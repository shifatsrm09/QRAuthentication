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
exports.confirmQR = async (req, res) => {
  const { sessionId } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ msg: "No token, mobile not authenticated" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const session = await QRSession.findOne({ sessionId });

    if (!session) return res.status(404).json({ msg: "QR session not found or expired" });

    // Link mobile user to session
    session.userId = decoded.id;
    session.status = "authenticated";
    await session.save();

    res.json({
      msg: "Login confirmed successfully!",
      user: { id: decoded.id }
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error: " + err.message });
  }
};

// Mobile scan page
// Mobile scan page - IMPROVED VERSION
// Mobile scan page - SMART DETECTION
exports.scanPage = async (req, res) => {
  const { sessionId } = req.query;
  
  console.log("🔍 SCAN PAGE DEBUG INFO:");
  console.log("Session ID:", sessionId);
  console.log("Request headers:", req.headers);
  
  try {
    const session = await QRSession.findOne({ sessionId });
    console.log("QR Session found:", !!session);
    
    if (!session) {
      return res.send(`
        <html>
          <body style="background: #1a1a1a; color: white; text-align: center; padding: 50px; font-family: Arial;">
            <h2>QR Expired</h2>
            <p>This QR code has expired. Please generate a new one on your desktop.</p>
            <div style="margin-top: 20px; font-size: 12px; opacity: 0.7;">
              Debug: Session ${sessionId} not found
            </div>
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

    // Show login instructions with option to check if already logged in
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
          .btn-check { background: #28a745; }
          .btn-check:hover { background: #218838; }
          .debug-info {
            background: #333;
            padding: 10px;
            border-radius: 5px;
            margin: 20px 0;
            font-size: 12px;
            text-align: left;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Desktop Login</h2>
          <p>To log in on your desktop, you need to be logged in on this device first.</p>
          
          <div style="margin: 30px 0;">
            <a href="https://shifatsrm09.github.io/qr_frontend/login" class="btn" target="_blank">
              Login First
            </a>
            <p style="font-size: 14px; margin-top: 10px;">Then come back here and click below</p>
          </div>
          
          <div style="margin: 30px 0;">
            <p>Already logged in?</p>
            <button class="btn btn-check" onclick="checkAuth()">Check My Login Status</button>
          </div>
          
          <div id="result" style="margin-top: 20px;"></div>
          
          <!-- DEBUG INFO -->
          <div class="debug-info">
            <strong>Debug Info:</strong><br>
            Session: ${sessionId}<br>
            Backend: Working ✅<br>
            QR Status: ${session.status}
          </div>
          
          <script>
            async function checkAuth() {
              const result = document.getElementById('result');
              result.innerHTML = '<p>Checking your login status...</p>';
              
              try {
                // Try to get the mobile app URL to check if user is logged in
                const response = await fetch('https://shifatsrm09.github.io/qr_frontend/api-check', {
                  method: 'GET',
                  credentials: 'include'
                });
                
                if (response.ok) {
                  result.innerHTML = '<p style="color: green;">✅ You appear to be logged in!</p>' +
                                    '<button class="btn" onclick="confirmLogin()">Confirm Desktop Login</button>';
                } else {
                  throw new Error('Not logged in');
                }
              } catch (error) {
                result.innerHTML = '<p style="color: red;">❌ You are not logged in on the mobile app.</p>' +
                                  '<p>Please <a href="https://shifatsrm09.github.io/qr_frontend/login" class="btn" style="padding: 10px 20px;">Login Here</a> first.</p>';
              }
            }
            
            async function confirmLogin() {
              const result = document.getElementById('result');
              result.innerHTML = '<p>Attempting to confirm login...</p>';
              
              try {
                // This is a simplified approach - in reality we need the mobile's token
                const response = await fetch('https://qr-frontend-4kwe.onrender.com/api/qr/confirm', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ 
                    sessionId: '${sessionId}',
                    // Note: We don't have the token here, so we'll need to handle this differently
                  })
                });
                
                const data = await response.json();
                if (response.ok) {
                  result.innerHTML = '<p style="color: green;">✅ Success! You can now return to your desktop.</p>';
                } else {
                  result.innerHTML = '<p style="color: red;">❌ ' + data.msg + '</p>' +
                                    '<p>Please make sure you are logged in on the mobile app.</p>';
                }
              } catch (error) {
                result.innerHTML = '<p style="color: red;">❌ Network error: ' + error.message + '</p>';
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