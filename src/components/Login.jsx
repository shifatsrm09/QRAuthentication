import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { login } from "../services/authService";
import { generateQR, checkQRStatus } from "../services/qrService";
import { QRCodeCanvas } from "qrcode.react";
import axios from "axios";
import email_icon from "../Assets/email.png";
import password_icon from "../Assets/password.png";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  // QR Login States
  const [qrData, setQrData] = useState({ qrURL: "", sessionId: "" });
  const [isLoading, setIsLoading] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check for QR Auth redirect
  useEffect(() => {
    const qrAuth = searchParams.get('qrAuth');
    const sessionId = searchParams.get('sessionId');
    
    if (qrAuth === 'true' && sessionId) {
      handleQRAuth(sessionId);
    }
  }, [searchParams]);

  // Handle QR Auth - Mobile user scans QR and gets redirected here
  const handleQRAuth = async (sessionId) => {
    console.log("🔄 QR Auth Handler - Debug Info:");
    
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    console.log("📱 Mobile Auth Status:");
    console.log("- Token exists:", !!token);
    console.log("- User data exists:", !!user);
    
    if (token && user) {
      console.log("✅ Mobile is logged in, redirecting to backend with data...");
      
      const userData = JSON.parse(user);
      console.log("👤 User data:", userData);
      
      // Redirect to backend with ALL data in URL
      const backendURL = 'https://qr-frontend-4kwe.onrender.com';
      const scanURL = `${backendURL}/api/qr/scan?sessionId=${sessionId}&token=${token}&user=${encodeURIComponent(user)}&email=${encodeURIComponent(userData.email || '')}&name=${encodeURIComponent(userData.name || '')}`;
      
      console.log("🔗 Redirecting to:", scanURL);
      window.location.href = scanURL;
    } else {
      console.log("❌ Mobile not logged in, staying on login page");
      // User needs to log in first
      alert("Please log in first, then scan the QR code again.");
    }
  };

  // Generate QR Code for desktop
  useEffect(() => {
    if (!isMobile) {
      const generateQRCode = async () => {
        try {
          setIsLoading(true);
          const res = await generateQR();
          setQrData({
            sessionId: res.sessionId,
            qrURL: res.qrURL
          });
        } catch (err) {
          console.error("QR generation error:", err);
        } finally {
          setIsLoading(false);
        }
      };
      generateQRCode();
    }
  }, [isMobile]);

  // Polling for QR authentication
  useEffect(() => {
    if (!qrData.sessionId || isMobile) return;

    const interval = setInterval(async () => {
      try {
        const res = await checkQRStatus(qrData.sessionId);
        if (res.authenticated) {
          localStorage.setItem("token", "QR_LOGGED_IN");
          localStorage.setItem("user", JSON.stringify(res.user));
          clearInterval(interval);
          navigate("/dashboard");
        }
      } catch (err) {
        console.error("Status check error:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [qrData.sessionId, isMobile, navigate]);

  const handleLogin = async () => {
    try {
      const data = await login(email, password);

      if (!data.token) {
        alert("Login failed: no token received");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (err) {
      console.error("Login failed:", err.response?.data || err.message);
      alert("Login failed! Check email/password.");
    }
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
                    className="form-input"
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
                    className="form-input"
                  />
                </div>
              </div>

              <button className="login-btn" onClick={handleLogin}>
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
                  ) : (
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
                  )}
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
                  <span className="status-indicator"></span>
                  <span>Ready for scanning</span>
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