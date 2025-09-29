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
// Generate QR session
exports.generateQR = async (req, res) => {
  try {
    const sessionId = Math.random().toString(36).substr(2, 9);
    const session = new QRSession({ sessionId });
    await session.save();
    
    // Point to backend scan page
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
// Mobile scan page - WORKING VERSION
// Mobile scan page - WORKING VERSION
// Mobile scan page - WORKING VERSION
// Mobile scan page - SIMPLE REDIRECT
exports.scanPage = async (req, res) => {
  const { sessionId } = req.query;
  
  console.log("📱 Mobile scanned QR - Session:", sessionId);
  
  try {
    const session = await QRSession.findOne({ sessionId });
    
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
            <h2>Already Logged In</h2>
            <p>This QR code has already been used. You're logged in on desktop!</p>
          </body>
        </html>
      `);
    }

    // Simple page that tells user what to do
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
            text-decoration: none;
            display: inline-block;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Confirm Desktop Login</h2>
          <p>Click the button below to confirm you want to log in on your desktop.</p>
          
          <div style="margin: 30px 0;">
            <button class="btn" onclick="confirmLogin()">
              Confirm Desktop Login
            </button>
          </div>
          
          <div id="result" style="margin-top: 20px;"></div>

          <script>
            async function confirmLogin() {
              const result = document.getElementById('result');
              result.innerHTML = '<p>Confirming login...</p>';
              
              try {
                // Get the mobile user's token from localStorage
                const token = localStorage.getItem('token');
                const user = localStorage.getItem('user');
                
                if (!token) {
                  result.innerHTML = '<p style="color: red;">❌ You are not logged in. Please log in first.</p>' +
                                    '<a href="https://shifatsrm09.github.io/qr_frontend/login" class="btn">Go to Login</a>';
                  return;
                }

                // Send confirmation to backend
                const response = await fetch('https://qr-frontend-4kwe.onrender.com/api/qr/confirm', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                  },
                  body: JSON.stringify({ sessionId: '${sessionId}' })
                });
                
                const data = await response.json();
                if (response.ok) {
                  result.innerHTML = '<p style="color: green;">✅ Success! You can now return to your desktop.</p>';
                } else {
                  result.innerHTML = '<p style="color: red;">❌ ' + data.msg + '</p>';
                }
              } catch (error) {
                result.innerHTML = '<p style="color: red;">❌ Error: ' + error.message + '</p>';
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