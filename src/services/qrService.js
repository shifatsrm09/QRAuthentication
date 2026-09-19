import client from "./client";

export const generateQR = async () => {
  const { data } = await client.get("/qr/generate");
  return data;
};

// Resolves with the status payload. A session the server no longer knows about
// (404) or has expired (410) resolves as { expired: true } instead of throwing,
// so callers only need try/catch for real connection problems.
export const checkQRStatus = async (sessionId) => {
  try {
    const { data } = await client.get("/qr/status", { params: { sessionId } });
    return data;
  } catch (err) {
    const status = err.response?.status;
    if (status === 404 || status === 410) return { authenticated: false, expired: true };
    throw err;
  }
};
