// lib/http.js
// Small helpers shared by all serverless handlers.
const jwt = require("jsonwebtoken");

// Send an error in the shape the frontend already understands
// (`msg` from the old backend, `message` is what the React code reads).
function fail(res, status, message, extra = {}) {
  return res.status(status).json({ success: false, msg: message, message, ...extra });
}

// Returns true if the request may continue, false if a 405 was already sent.
function allowMethods(req, res, methods) {
  res.setHeader("Cache-Control", "no-store");
  if (!methods.includes(req.method)) {
    res.setHeader("Allow", methods.join(", "));
    fail(res, 405, `Method ${req.method} not allowed`);
    return false;
  }
  return true;
}

function getBearerToken(req) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  return scheme === "Bearer" && token ? token : null;
}

// Returns the decoded JWT payload, or null if missing/invalid/expired.
function verifyRequestToken(req) {
  const token = getBearerToken(req);
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

function signToken(userId, expiresIn = "1h") {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn });
}

// Public origin of this deployment, e.g. https://my-app.vercel.app
// Override with APP_URL if you attach a custom domain and want to force it.
function getOrigin(req) {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  const proto = (req.headers["x-forwarded-proto"] || req.protocol || "http").split(",")[0];
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return `${proto}://${host}`;
}

module.exports = { fail, allowMethods, getBearerToken, verifyRequestToken, signToken, getOrigin };
