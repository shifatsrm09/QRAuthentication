import React from "react";
import { QRCodeCanvas } from "qrcode.react";

const STATUS_LABEL = {
  loading: "Generating…",
  ready: "Ready for scanning",
  expired: "Expired",
  error: "Unavailable",
};

// Desktop-only card that shows the login QR code. State comes from useQrLogin.
const QrPanel = ({ url, status, connectionIssue, onRefresh }) => {
  const failed = status === "expired" || status === "error";

  return (
    <aside className="card" aria-label="Sign in with QR code">
      <header className="card__header">
        <h2>Quick Access</h2>
        <p>Scan the QR code with your phone</p>
      </header>

      <div className="qr-stage" aria-live="polite">
        {status === "loading" && (
          <div className="qr-state">
            <span className="spinner" aria-hidden="true" />
            <p>Generating QR code…</p>
          </div>
        )}

        {status === "ready" && url && (
          <div className="qr-frame">
            <QRCodeCanvas value={url} size={200} level="H" marginSize={4} bgColor="#1a1a1a" fgColor="#ffffff" />
            <span className="qr-scanline" aria-hidden="true" />
          </div>
        )}

        {failed && (
          <div className="qr-state">
            <p className="message message--error">
              {status === "expired" ? "This QR code has expired." : "Couldn't generate a QR code."}
            </p>
            <button type="button" className="btn btn--secondary" onClick={onRefresh}>
              {status === "expired" ? "Get a new QR code" : "Try again"}
            </button>
          </div>
        )}
      </div>

      {connectionIssue && !failed && (
        <p className="message message--warning" role="status">
          Connection issue. Retrying…
        </p>
      )}

      <ol className="qr-steps">
        <li>Open the camera on your phone</li>
        <li>Scan the QR code above</li>
        <li>Confirm the login on your phone</li>
      </ol>

      <p className="qr-status">
        <span className={`qr-status__dot qr-status__dot--${failed ? "error" : status}`} aria-hidden="true" />
        {STATUS_LABEL[status] || "Loading…"}
      </p>
    </aside>
  );
};

export default QrPanel;
