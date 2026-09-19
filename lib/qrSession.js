// lib/qrSession.js
// Self-verifying QR session ids, so creating one needs no database round trip.
//
//   id = "<nonce>.<expiry>.<signature>"
//
// The signature is an HMAC of "<nonce>.<expiry>" keyed with JWT_SECRET, so a
// client can't forge an id or extend its lifetime. A database row is only
// written later, when the phone confirms the login (see handlers/qr/confirm.js).
const crypto = require("crypto");

const LIFETIME_SECONDS = 5 * 60; // keep in sync with QR_LIFETIME_MS in src/hooks/useQrLogin.js

const sign = (payload) =>
  crypto
    .createHmac("sha256", process.env.JWT_SECRET)
    .update(`qr-session:${payload}`)
    .digest("base64url")
    .slice(0, 16);

function createSessionId() {
  const expiresAtSeconds = Math.floor(Date.now() / 1000) + LIFETIME_SECONDS;
  const payload = `${crypto.randomBytes(12).toString("base64url")}.${expiresAtSeconds.toString(36)}`;
  return {
    sessionId: `${payload}.${sign(payload)}`,
    expiresAt: new Date(expiresAtSeconds * 1000),
  };
}

// Returns { state: "valid" | "expired" | "invalid", expiresAt? }
function checkSessionId(sessionId) {
  if (typeof sessionId !== "string" || sessionId.length > 100) return { state: "invalid" };

  const parts = sessionId.split(".");
  if (parts.length !== 3) return { state: "invalid" };

  const [nonce, expiry, signature] = parts;
  const given = Buffer.from(signature);
  const expected = Buffer.from(sign(`${nonce}.${expiry}`));
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) {
    return { state: "invalid" };
  }

  const expiresAtSeconds = parseInt(expiry, 36);
  if (Number.isNaN(expiresAtSeconds)) return { state: "invalid" };

  return {
    state: expiresAtSeconds * 1000 > Date.now() ? "valid" : "expired",
    expiresAt: new Date(expiresAtSeconds * 1000),
  };
}

module.exports = { createSessionId, checkSessionId };
