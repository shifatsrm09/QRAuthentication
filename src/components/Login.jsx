import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/authService";
import { generateQR, checkQRStatus } from "../services/qrService";
import { QRCodeCanvas } from "qrcode.react";
import email_icon from "../Assets/email.png";
import password_icon from "../Assets/password.png";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  // QR Login States
  const [qrData, setQrData] = useState({ qrURL: "", sessionId: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [qrError, setQrError] = useState("");

  // Check if device is mobile - optimized
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Generate QR Code - with proper error handling
  const generateQRCode = useCallback(async () => {
    if (isMobile) return;
    
    try {
      setIsLoading(true);
      setQrError("");
      console.log("🔄 Generating QR code...");
      
      const data = await generateQR();
      
      if (!data.sessionId || !data.qrURL) {
        throw new Error("Invalid QR data received");
      }
      
      setQrData({
        sessionId: data.sessionId,
        qrURL: data.qrURL
      });
      
      console.log("✅ QR generated successfully");
    } catch (err) {
      console.error("❌ QR generation failed:", err.message);
      setQrError("Failed to generate QR code. Please try again.");
      setQrData({ qrURL: "", sessionId: "" });
    } finally {
      setIsLoading(false);
    }
  }, [isMobile]);

  useEffect(() => {
    generateQRCode();
  }, [generateQRCode]);

  // Polling for QR authentication - robust version
  useEffect(() => {
    if (!qrData.sessionId || isMobile) return;

    let pollCount = 0;
    const maxPolls = 100; // ~5 minutes at 3-second intervals
    
    console.log("🔍 Starting QR polling for session:", qrData.sessionId);

    const interval = setInterval(async () => {
      try {
        pollCount++;
        
        if (pollCount > maxPolls) {
          console.log("⏰ QR session expired - stopping polling");
          clearInterval(interval);
          setQrError("QR code expired. Please generate a new one.");
          return;
        }

        const data = await checkQRStatus(qrData.sessionId);
        
        if (data.authenticated && data.user) {
          console.log("✅ QR authentication successful!");
          clearInterval(interval);
          
          // Store auth data
          localStorage.setItem("token", data.user.token || "QR_AUTHENTICATED");
          localStorage.setItem("user", JSON.stringify(data.user));
          
          // Navigate to dashboard
          navigate("/dashboard");
        }
        
        // Log polling status occasionally
        if (pollCount % 10 === 0) {
          console.log(`⏳ Still waiting for QR auth... (poll ${pollCount})`);
        }
        
      } catch (err) {
        console.error("❌ QR status check failed:", err.message);
        
        // Don't show error for first few attempts (might be network issues)
        if (pollCount > 3) {
          setQrError("Connection issue. Still trying...");
        }
      }
    }, 3000);

    return () => {
      console.log("🧹 Cleaning up QR polling");
      clearInterval(interval);
    };
  }, [qrData.sessionId, isMobile, navigate]);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    
    if (!email || !password) {
      alert("Please enter both email and password");
      return;
    }

    try {
      console.log("🔐 Attempting login...");
      const data = await login(email, password);

      if (!data.token || !data.user) {
        throw new Error("Invalid response from server");
      }

      // Store auth data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      console.log("✅ Login successful!");
      navigate("/dashboard");
      
    } catch (err) {
      console.error("❌ Login failed:", err.response?.data || err.message);
      const errorMsg = err.response?.data?.message || "Login failed! Check email/password.";
      alert(errorMsg);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  const refreshQRCode = () => {
    console.log("🔄 Refreshing QR code...");
    generateQRCode();
  };

  return (
    <div className="login-page">
      <div className="login-container black-theme">
        <div className="login-content">
          {/* Regular Login Form */}
          <div className="login-form-section">
            <div className="form-card">
              <div className="form-header">
                <h1>Welcome Back</h1>
                <p>Sign in to your account</p>
              </div>

              <div className="form-inputs">
                <div className="input-group">
                  <div className="input-icon">
                    <img src={email_icon} alt="email" />
                  </div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="form-input"
                    required
                  />
                </div>

                <div className="input-group">
                  <div className="input-icon">
                    <img src={password_icon} alt="password" />
                  </div>
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <button 
                className="login-btn" 
                onClick={handleLogin}
                disabled={!email || !password}
              >
                Sign In
              </button>

              <div className="form-footer">
                <p>
                  Don't have an account? <Link to="/signup" className="signup-link">Sign up now</Link>
                </p>
              </div>
            </div>
          </div>

          {/* QR Login Section - Only visible on desktop */}
          {!isMobile && (
            <div className="qr-section">
              <div className="qr-card">
                <div className="qr-header">
                  <h2>Quick Access</h2>
                  <p>Scan QR code with your mobile</p>
                </div>
                
                <div className="qr-display">
                  {isLoading ? (
                    <div className="qr-loading">
                      <div className="loading-spinner"></div>
                      <p>Generating QR code...</p>
                    </div>
                  ) : qrError ? (
                    <div className="qr-error">
                      <p style={{color: 'red', marginBottom: '10px'}}>{qrError}</p>
                      <button 
                        onClick={refreshQRCode}
                        className="btn-retry"
                      >
                        Retry
                      </button>
                    </div>
                  ) : qrData.qrURL ? (
                    <div className="qr-code-container">
                      <QRCodeCanvas 
                        value={qrData.qrURL} 
                        size={200}
                        level="H"
                        includeMargin
                        bgColor="#1a1a1a"
                        fgColor="#ffffff"
                      />
                      <div className="qr-overlay"></div>
                    </div>
                  ) : null}
                </div>

                <div className="qr-instructions">
                  <h4>How to use:</h4>
                  <ul>
                    <li>Open camera on your phone</li>
                    <li>Scan the QR code above</li>
                    <li>Confirm login on your device</li>
                    <li>Get instant access</li>
                  </ul>
                </div>

                <div className="qr-status">
                  <span className={`status-indicator ${qrError ? 'error' : qrData.qrURL ? 'ready' : 'loading'}`}></span>
                  <span>
                    {qrError ? 'Error' : isLoading ? 'Generating...' : qrData.qrURL ? 'Ready for scanning' : 'Loading...'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;