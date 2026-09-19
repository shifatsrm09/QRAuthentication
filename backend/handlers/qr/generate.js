// GET /api/qr/generate
// No database access: the session id is self-verifying (see lib/qrSession.js),
// so the QR code can be returned immediately, even on a cold start.
const { fail, allowMethods, getOrigin } = require("../../../lib/http");
const { createSessionId } = require("../../../lib/qrSession");

module.exports = (req, res) => {
  if (!allowMethods(req, res, ["GET"])) return;

  try {
    const { sessionId } = createSessionId();

    // Frontend and API share one origin on Vercel, so the phone opens
    // the static confirm page from the same site it's logged into.
    const qrURL = `${getOrigin(req)}/qr-auth.html?sessionId=${sessionId}`;

    return res.json({ success: true, sessionId, qrURL, expiresIn: "5 minutes" });
  } catch (err) {
    console.error("QR generation error:", err);
    return fail(res, 500, "Failed to generate QR code", { error: "Failed to generate QR code" });
  }
};
