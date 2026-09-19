const { test } = require('node:test');
const assert = require('node:assert/strict');
process.env.MONGO_URI = 'mongodb://test-only';
process.env.JWT_SECRET = 'integration-test-secret';
require.cache[require.resolve('../../lib/db')] = { exports: async () => {} };
const User = require('../../lib/models/User');
const QR = require('../../lib/models/QRSession');
const users = [];
const sessions = [];
User.findOne = async ({email}) => users.find(u => u.email === email);
User.prototype.save = async function () { users.push(this); return this; };
User.findById = id => ({ select: async () => users.find(u => String(u._id) === String(id)) });
// A session row only exists once the phone has confirmed the login.
QR.findOne = async ({sessionId}) => sessions.find(s => s.sessionId === sessionId) || null;
QR.findOneAndUpdate = (query, update) => {
 let result = null;
 if (update.$setOnInsert) {
  // confirm: upsert. null => created just now, otherwise the row that already existed.
  const existing = sessions.find(s => s.sessionId === query.sessionId);
  if (existing) result = {...existing};
  else sessions.push({sessionId: query.sessionId, ...update.$setOnInsert});
 } else {
  // status: atomically claim an authenticated session.
  const found = sessions.find(s => s.sessionId === query.sessionId && s.status === query.status);
  if (found) { result = {...found}; Object.assign(found, update.$set); }
 }
 const promise = Promise.resolve(result);
 promise.populate = async () => result && {...result, userId:users.find(u => String(u._id) === String(result.userId))};
 return promise;
};
const app = require('../../api');
test('shared Express API: password login, QR exchange, expiry, replay and errors', async t => {
 const server = app.listen(0, '127.0.0.1');
 await new Promise(resolve => server.once('listening', resolve));
 t.after(() => new Promise(resolve => server.close(resolve)));
 const base = 'http://127.0.0.1:' + server.address().port;
 async function request(path, body, token, headers={}) {
  const response = await fetch(base + '/api' + path, {method:body ? 'POST':'GET',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{}),...headers},...(body?{body:JSON.stringify(body)}:{})});
  return {status:response.status, body:await response.json(), headers:response.headers};
 }
 assert.equal((await request('/health')).status,200);
 assert.equal((await request('/auth/me')).status,401);
 assert.equal((await request('/auth/login',{})).status,400);
 const account={name:'Test User',email:'test@example.com',password:'test-password'};
 assert.equal((await request('/auth/signup',account)).status,201);
 assert.equal((await request('/auth/signup',account)).status,400);
 assert.equal((await request('/auth/login',{...account,password:'wrong'})).status,400);
 const login=await request('/auth/login',account);
 assert.ok(login.body.token);
 assert.equal((await request('/auth/me',null,login.body.token)).body.email,account.email);

 // Generating a QR needs no database write: the session id is self-verifying.
 const generated=await request('/qr/generate',null,null,{'x-forwarded-host':'example.vercel.app','x-forwarded-proto':'https'});
 assert.ok(generated.body.qrURL.startsWith('https://example.vercel.app/qr-auth.html?sessionId='));
 assert.equal(generated.headers.get('cache-control'),'no-store');
 assert.equal(sessions.length,0);
 const sessionId=generated.body.sessionId;
 assert.equal((await request('/qr/status?sessionId='+sessionId)).body.authenticated,false);
 assert.equal((await request('/qr/confirm',{sessionId})).status,401);

 // Forged or tampered ids are rejected.
 const forged=sessionId.slice(0,-1)+(sessionId.endsWith('A')?'B':'A');
 assert.equal((await request('/qr/confirm',{sessionId:forged},login.body.token)).status,404);
 assert.equal((await request('/qr/status?sessionId='+forged)).status,404);
 assert.equal((await request('/qr/status?sessionId=not-a-real-id')).status,404);
 assert.equal(sessions.length,0);

 assert.equal((await request('/qr/confirm',{sessionId},login.body.token)).status,200);
 assert.equal(sessions.length,1);
 const exchanged=await request('/qr/status?sessionId='+sessionId);
 assert.equal(exchanged.body.authenticated,true);
 assert.equal((await request('/auth/me',null,exchanged.body.token)).status,200);
 assert.equal((await request('/qr/status?sessionId='+sessionId)).body.token,undefined);
 assert.equal((await request('/qr/confirm',{sessionId},login.body.token)).status,404);

 // Two simultaneous confirms: exactly one wins.
 const raced=(await request('/qr/generate')).body.sessionId;
 const results=await Promise.all([request('/qr/confirm',{sessionId:raced},login.body.token),request('/qr/confirm',{sessionId:raced},login.body.token)]);
 assert.deepEqual(results.map(r=>r.status).sort(),[200,404]);

 // Expiry: jump the clock past the 5 minute lifetime.
 const expired=(await request('/qr/generate')).body.sessionId;
 const realNow=Date.now;
 Date.now=()=>realNow()+6*60*1000;
 try {
  assert.equal((await request('/qr/confirm',{sessionId:expired},login.body.token)).status,404);
  assert.equal((await request('/qr/status?sessionId='+expired)).status,410);
 } finally { Date.now=realNow; }

 assert.equal((await request('/qr/status')).status,400);
 assert.equal((await request('/qr/generate',{})).status,405);
 assert.equal((await request('/missing')).status,404);
 const malformed=await fetch(base+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:'{'});
 assert.equal(malformed.status,400);
 delete process.env.JWT_SECRET;
 assert.equal((await request('/auth/login',account)).status,503);
 assert.equal((await request('/health')).status,200);
});
