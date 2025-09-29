import React, { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import axios from "axios";
import './QRLogin.css'; // Optional CSS file for additional styling

const QRLogin = () => {
  const [sessionId, setSessionId] = useState("");
  const [qrURL, setQrURL] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const generateQR = async () => {
      try {
        setIsLoading(true);
        setError("");
        const res = await axios.get("http://192.168.0.100:5000/api/qr/generate");
        setSessionId(res.data.sessionId);
        setQrURL(res.data.qrURL);
      } catch (err) {
        setError("Failed to generate QR code. Please try again.");
        console.error("QR generation error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    generateQR();
  }, []);

  // Polling desktop every 3 sec
  useEffect(() => {
    if (!sessionId) return;

    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`http://192.168.0.100:5000/api/qr/status?sessionId=${sessionId}`);
        if (res.data.authenticated) {
          setAuthenticated(true);
          setUser(res.data.user);
          localStorage.setItem("token", "QR_LOGGED_IN");
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Status check error:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [sessionId]);

  if (authenticated) {
    return (
      <div className="welcome-container">
        <div className="welcome-card">
          <div className="success-icon">✓</div>
          <h1>Welcome back!</h1>
          <p className="user-greeting">Hello, <span className="user-name">{user?.name}</span></p>
          <p className="success-message">You have been successfully logged in.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-card">
          <div className="error-icon">⚠️</div>
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button 
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="qr-container">
      <div className="qr-card">
        <div className="qr-header">
          <h1>QR Code Login</h1>
          <p>Scan with your mobile device to sign in</p>
        </div>
        
        <div className="qr-code-wrapper">
          {isLoading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Generating QR code...</p>
            </div>
          ) : (
            <>
              <div className="qr-code-border">
                <QRCodeCanvas 
                  value={qrURL} 
                  size={200}
                  level="H"
                  includeMargin
                />
              </div>
              <div className="scanning-animation">
                <div className="scan-line"></div>
              </div>
            </>
          )}
        </div>

        <div className="instructions">
          <h3>How to login:</h3>
          <ol>
            <li>Open your phone's camera or QR scanner app</li>
            <li>Point your camera at the QR code</li>
            <li>Follow the instructions on your phone</li>
            <li>Wait for automatic confirmation</li>
          </ol>
        </div>

        <div className="status-indicator">
          <div className="pulse-dot"></div>
          <span>Waiting for scan...</span>
        </div>
      </div>
    </div>
  );
};

export default QRLogin;