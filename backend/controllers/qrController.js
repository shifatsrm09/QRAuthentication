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
exports.generateQR = async (req, res) => {
  try {
    const sessionId = Math.random().toString(36).substr(2, 9);
    const session = new QRSession({ sessionId });
    await session.save();
    
    // Point directly to backend - no frontend routing issues
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
exports.scanPage = async (req, res) => {
  const { sessionId } = req.query;
  
  try {
    const session = await QRSession.findOne({ sessionId });
    if (!session) {
      return res.send(`
        <html>
          <body style="background: #1a1a1a; color: white; text-align: center; padding: 50px; font-family: Arial;">
            <h2>QR Expired</h2>
            <p>This QR code has expired. Please generate a new one on your desktop.</p>
            <a href="https://shifatsrm09.github.io/qr_frontend/" style="color: #007bff;">Go to Login</a>
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
            <a href="https://shifatsrm09.github.io/qr_frontend/" style="color: #007bff;">Go to App</a>
          </body>
        </html>
      `);
    }

    // Show login prompt and confirmation
    res.send(`
      <html>
      <head>
        <title>Confirm Desktop Login</title>
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
            text-decoration: none;
            display: inline-block;
          }
          .btn:hover { background: #0056b3; }
          .btn-cancel { background: #6c757d; }
          .btn-cancel:hover { background: #545b62; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Desktop Login</h2>
          <p>Scan this QR code from a device that's already logged in to confirm your identity.</p>
          
          <div style="margin: 30px 0;">
            <a href="https://shifatsrm09.github.io/qr_frontend/login" class="btn">Login First</a>
            <p style="font-size: 14px; margin-top: 20px;">Then scan the QR code again</p>
          </div>
          
          <div style="margin-top: 30px;">
            <p>Already logged in?</p>
            <button class="btn" onclick="confirmLogin()">Confirm Desktop Login</button>
          </div>
          
          <div id="result" style="margin-top: 20px;"></div>
          
          <script>
            async function confirmLogin() {
              const result = document.getElementById('result');
              result.innerHTML = '<p>Checking authentication...</p>';
              
              try {
                // Try to get token from mobile app (if logged in)
                const response = await fetch('https://qr-frontend-4kwe.onrender.com/api/qr/confirm', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ sessionId: '${sessionId}' })
                });
                
                const data = await response.json();
                if (response.ok) {
                  result.innerHTML = '<p style="color: green;">✅ Success! You can return to your desktop.</p>';
                } else {
                  result.innerHTML = '<p style="color: red;">❌ ' + data.msg + '</p>' +
                                    '<p><a href="https://shifatsrm09.github.io/qr_frontend/login" class="btn">Please Login First</a></p>';
                }
              } catch (error) {
                result.innerHTML = '<p style="color: red;">❌ Network error. Please check your connection.</p>';
              }
            }
          </script>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send('Server error');
  }
};