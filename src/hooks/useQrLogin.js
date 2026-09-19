import { useCallback, useEffect, useRef, useState } from "react";
import { generateQR, checkQRStatus } from "../services/qrService";

const POLL_INTERVAL_MS = 3000;
const QR_LIFETIME_MS = 5 * 60 * 1000; // matches the server-side session expiry

// Runs the whole QR login flow: create a session, poll until the phone confirms,
// then hand the resulting { token, user } to onAuthenticated.
//
// status: "idle" | "loading" | "ready" | "expired" | "error"
export default function useQrLogin({ enabled, onAuthenticated }) {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("idle");
  const [connectionIssue, setConnectionIssue] = useState(false);
  const [attempt, setAttempt] = useState(0);

  // Keep the latest callback without restarting the polling loop when it changes.
  const onAuthenticatedRef = useRef(onAuthenticated);
  useEffect(() => {
    onAuthenticatedRef.current = onAuthenticated;
  });

  const refresh = useCallback(() => setAttempt((n) => n + 1), []);

  useEffect(() => {
    setUrl("");
    setConnectionIssue(false);
    if (!enabled) {
      setStatus("idle");
      return undefined;
    }

    let cancelled = false;
    let timer;

    // Polls one request at a time (no overlapping requests on slow networks).
    const poll = async (sessionId, deadline) => {
      if (cancelled) return;
      if (Date.now() > deadline) {
        setStatus("expired");
        return;
      }
      try {
        const data = await checkQRStatus(sessionId);
        if (cancelled) return;
        if (data.expired) {
          setStatus("expired");
          return;
        }
        if (data.authenticated && data.token && data.user) {
          onAuthenticatedRef.current(data);
          return;
        }
        setConnectionIssue(false);
      } catch {
        if (cancelled) return;
        setConnectionIssue(true); // keep the QR visible and keep trying
      }
      timer = setTimeout(() => poll(sessionId, deadline), POLL_INTERVAL_MS);
    };

    setStatus("loading");
    generateQR()
      .then((data) => {
        if (cancelled) return;
        if (!data.sessionId || !data.qrURL) throw new Error("Invalid QR response");
        setUrl(data.qrURL);
        setStatus("ready");
        const deadline = Date.now() + QR_LIFETIME_MS;
        timer = setTimeout(() => poll(data.sessionId, deadline), POLL_INTERVAL_MS);
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [enabled, attempt]);

  return { url, status, connectionIssue, refresh };
}
