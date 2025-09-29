const QRSession = require("../models/QRSession");
const jwt = require("jsonwebtoken");

// Get environment-based URLs
const getFrontendURL = () => {
  return process.env.FRONTEND_URL || 'http://localhost:3000';
};

const getBackendURL = () => {
  return process.env.BACKEND_URL || 'http://localhost:5000';
};

// Generate QR session - POINT TO BACKEND DIRECTLY
// Generate QR session
exports.generateQR = async (req, res) => {
  try {
    const sessionId = Math.random().toString(36).substr(2, 9);
    const session = new QRSession({ sessionId });
    await session.save();
    
    // Point directly to backend - no GitHub Pages routing issues
    const qrURL = `https://qr-frontend-4kwe.onrender.com/api/qr/scan?sessionId=${sessionId}`;
    
    res.json({ 
      sessionId, 
      qrURL 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Check QR status (desktop polling)
exports.checkStatus = async (req, res) => {
  const { sessionId } = req.query;
  const session = await QRSession.findOne({ sessionId }).populate("userId");
  
  if (!session) return res.status(404).json({ authenticated: false });

  if (session.status === "authenticated") {
    return res.json({
      authenticated: true,
      user: { name: session.userId.name, email: session.userId.email }
    });
  }

  res.json({ authenticated: false });
};

// Confirm QR Login
// Confirm QR Login
exports.confirmQR = async (req, res) => {
  const { sessionId } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  console.log("🔐 CONFIRM QR DEBUG:");
  console.log("Session ID:", sessionId);
  console.log("Token received:", token ? "YES" : "NO");

  if (!token) {
    return res.status(401).json({ msg: "No authentication token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const session = await QRSession.findOne({ sessionId });

    if (!session) {
      return res.status(404).json({ msg: "QR session not found or expired" });
    }

    console.log("User ID from token:", decoded.id);
    
    // Link mobile user to session
    session.userId = decoded.id;
    session.status = "authenticated";
    await session.save();

    console.log("✅ QR Session confirmed for user:", decoded.id);

    res.json({
      msg: "Login confirmed successfully!",
      user: { id: decoded.id }
    });
  } catch (err) {
    console.error("Confirm QR error:", err);
    res.status(500).json({ msg: "Server error: " + err.message });
  }
};
// Mobile scan page
// Mobile scan page - WORKING VERSION
// Mobile scan page - WORKING VERSION
// Mobile scan page - WORKING VERSION
exports.scanPage = async (req, res) => {
  const { sessionId } = req.query;
  
  console.log("🔍 SCAN PAGE DEBUG INFO:");
  console.log("Session ID:", sessionId);
  
  try {
    const session = await QRSession.findOne({ sessionId });
    console.log("QR Session found:", !!session);
    
    if (!session) {
      return res.send(`
        <html>
          <body style="background: #1a1a1a; color: white; text-align: center; padding: 50px; font-family: Arial;">
            <h2>QR Expired</h2>
            <p>This QR code has expired. Please generate a new one on your desktop.</p>
          </body>
        </html>
      `);
    }

    if (session.status === "authenticated") {
      return res.send(`
        <html>
          <body style="background: #1a1a1a; color: white; text-align: center; padding: 50px; font-family: Arial;">
            <h2>Already Authenticated</h2>
            <p>This QR code has already been used. You're logged in on desktop!</p>
          </body>
        </html>
      `);
    }

    res.send(`
      <html>
      <head>
        <title>Desktop Login</title>
        <style>
          body { 
            background: #1a1a1a; 
            color: white; 
            text-align: center; 
            padding: 50px; 
            font-family: Arial; 
          }
          .container { max-width: 400px; margin: 0 auto; }
          .btn { 
            background: #007bff; 
            color: white; 
            border: none; 
            padding: 15px 30px; 
            border-radius: 5px; 
            cursor: pointer; 
            font-size: 16px; 
            margin: 10px; 
          }
          .btn:hover { background: #0056b3; }
          .btn-success { background: #28a745; }
          .btn-success:hover { background: #218838; }
          .user-info { 
            background: #2a2a2a; 
            padding: 15px; 
            border-radius: 5px; 
            margin: 20px 0; 
          }
          .hidden { display: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Desktop Login</h2>
          <p>Confirm your identity to log in on desktop</p>
          
          <div id="loginPrompt">
            <div style="margin: 30px 0;">
              <p>First, make sure you're logged in on the mobile app:</p>
              <a href="https://shifatsrm09.github.io/qr_frontend/login" class="btn" target="_blank">
                Open Mobile App
              </a>
            </div>
            
            <div style="margin: 30px 0;">
              <p>Then check your login status:</p>
              <button class="btn btn-success" onclick="checkAuthStatus()">
                Check Login Status
              </button>
            </div>
          </div>
          
          <div id="authResult" class="hidden">
            <!-- This will be populated by JavaScript -->
          </div>
          
          <div id="debugInfo" style="margin-top: 30px; font-size: 12px; opacity: 0.7;">
            <strong>Debug Info:</strong><br>
            Session: ${sessionId}<br>
            Status: Ready for authentication
          </div>

          <script>
            let userToken = null;
            let userData = null;

            // Listen for messages from the auth check iframe
            window.addEventListener('message', function(event) {
              console.log('Received message:', event.data);
              
              if (event.data.type === 'AUTH_STATUS') {
                if (event.data.loggedIn) {
                  userToken = event.data.token;
                  userData = event.data.user;
                  showAuthSuccess(event.data.user);
                } else {
                  showAuthFailed();
                }
              }
            });

            function checkAuthStatus() {
              const debugInfo = document.getElementById('debugInfo');
              debugInfo.innerHTML = '<strong>Debug Info:</strong><br>Checking auth status...';
              
              // Create hidden iframe to check auth status
              const iframe = document.createElement('iframe');
              iframe.src = 'https://shifatsrm09.github.io/qr_frontend/api-check.html';
              iframe.style.display = 'none';
              document.body.appendChild(iframe);
              
              setTimeout(() => {
                if (!userToken) {
                  debugInfo.innerHTML = '<strong>Debug Info:</strong><br>No auth response received';
                }
              }, 3000);
            }

            function showAuthSuccess(user) {
              const loginPrompt = document.getElementById('loginPrompt');
              const authResult = document.getElementById('authResult');
              const debugInfo = document.getElementById('debugInfo');
              
              loginPrompt.classList.add('hidden');
              authResult.classList.remove('hidden');
              
              authResult.innerHTML = \`
                <div class="user-info">
                  <h3>✅ Logged In As</h3>
                  <p><strong>\${user.name || 'User'}</strong></p>
                  <p>\${user.email || ''}</p>
                </div>
                <p>Ready to confirm desktop login?</p>
                <button class="btn btn-success" onclick="confirmLogin()">
                  Confirm Desktop Login
                </button>
              \`;
              
              debugInfo.innerHTML = '<strong>Debug Info:</strong><br>User authenticated ✅<br>Token: ' + (userToken ? 'Received' : 'Missing');
            }

            function showAuthFailed() {
              const debugInfo = document.getElementById('debugInfo');
              debugInfo.innerHTML = '<strong>Debug Info:</strong><br>User not logged in ❌';
              
              alert('Please log in on the mobile app first, then check again.');
            }

            async function confirmLogin() {
              const debugInfo = document.getElementById('debugInfo');
              const authResult = document.getElementById('authResult');
              
              if (!userToken) {
                debugInfo.innerHTML = '<strong>Debug Info:</strong><br>No token available ❌';
                return;
              }

              debugInfo.innerHTML = '<strong>Debug Info:</strong><br>Sending confirmation...';
              
              try {
                const response = await fetch('https://qr-frontend-4kwe.onrender.com/api/qr/confirm', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + userToken
                  },
                  body: JSON.stringify({ sessionId: '${sessionId}' })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                  authResult.innerHTML = '<p style="color: green; font-size: 18px;">✅ Login Confirmed!</p><p>You can now return to your desktop.</p>';
                  debugInfo.innerHTML = '<strong>Debug Info:</strong><br>Login confirmed successfully! ✅';
                } else {
                  authResult.innerHTML = '<p style="color: red;">❌ ' + data.msg + '</p>';
                  debugInfo.innerHTML = '<strong>Debug Info:</strong><br>Confirmation failed: ' + data.msg;
                }
              } catch (error) {
                authResult.innerHTML = '<p style="color: red;">❌ Network error</p>';
                debugInfo.innerHTML = '<strong>Debug Info:</strong><br>Network error: ' + error.message;
              }
            }
          </script>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    console.error("Scan page error:", err);
    res.status(500).send('Server error');
  }
};