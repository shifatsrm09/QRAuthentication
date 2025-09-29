const QRSession = require("../models/QRSession");
const jwt = require("jsonwebtoken");

// Get configuration from environment
const getConfig = () => ({
  frontendUrl: process.env.FRONTEND_URL || 'https://shifatsrm09.github.io',
  frontendPath: process.env.FRONTEND_PATH || '/QRAuthentication.git',
  backendUrl: process.env.BACKEND_URL || 'https://qr-frontend-4kwe.onrender.com',
  qrExpiry: parseInt(process.env.QR_EXPIRY_MINUTES) || 5,
  tokenLength: parseInt(process.env.QR_TOKEN_LENGTH) || 9
});

// Generate QR session
exports.generateQR = async (req, res) => {
  try {
    const config = getConfig();
    console.log("🔧 Backend Config:", config);
    
    const sessionId = Math.random().toString(36).substr(2, config.tokenLength);
    const session = new QRSession({ 
      sessionId,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + config.qrExpiry * 60 * 1000)
    });
    
    await session.save();
    console.log("✅ QR session saved:", sessionId);
    
    // Build QR URL using environment variables
    const qrURL = `${config.frontendUrl}${config.frontendPath}/qr-auth.html?sessionId=${sessionId}`;
    
    console.log("🔗 Generated QR URL:", qrURL);
    
    res.json({ 
      success: true,
      sessionId, 
      qrURL,
      expiresIn: `${config.qrExpiry} minutes`
    });
    
  } catch (err) {
    console.error("❌ QR generation error:", err.message);
    res.status(500).json({ 
      success: false,
      error: "Failed to generate QR code",
      message: err.message 
    });
  }
};

// Check QR status
exports.checkStatus = async (req, res) => {
  const { sessionId } = req.query;
  
  if (!sessionId) {
    return res.status(400).json({ 
      success: false,
      error: "Session ID is required" 
    });
  }

  try {
    console.log("🔍 Checking QR status for session:", sessionId);
    
    const session = await QRSession.findOne({ sessionId }).populate("userId");
    
    if (!session) {
      return res.status(404).json({ 
        success: false,
        authenticated: false,
        error: "QR session not found" 
      });
    }

    if (session.status === "authenticated" && session.userId) {
      console.log("✅ QR session authenticated for user:", session.userId.email);
      
      return res.json({
        success: true,
        authenticated: true,
        user: {
          name: session.userId.name,
          email: session.userId.email,
          id: session.userId._id
        }
      });
    }

    res.json({
      success: true,
      authenticated: false,
      status: session.status
    });
    
  } catch (err) {
    console.error("❌ QR status check error:", err.message);
    res.status(500).json({ 
      success: false,
      error: "Failed to check QR status",
      message: err.message 
    });
  }
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
exports.scanPage = async (req, res) => {
  const { sessionId, token, user, email, name } = req.query;
  const config = getConfig();
  
  console.log("🔍 SCAN PAGE DEBUG INFO:");
  console.log("Session ID:", sessionId);
  console.log("Token received:", token ? "YES (" + token.substring(0, 20) + "...)" : "NO");
  console.log("User data received:", user ? "YES" : "NO");
  console.log("Email:", email || "NO");
  console.log("Name:", name || "NO");

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
            <h2>Already Authenticated</h2>
            <p>This QR code has already been used. You're logged in on desktop!</p>
          </body>
        </html>
      `);
    }

    // If we have token, show confirmation
    if (token) {
      let userEmail = email || 'Unknown';
      let userName = name || 'User';
      
      try {
        const userData = JSON.parse(decodeURIComponent(user));
        userEmail = userData.email || userEmail;
        userName = userData.name || userName;
      } catch (e) {
        console.log("Error parsing user data:", e.message);
      }

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
            }
            .btn:hover { background: #0056b3; }
            .user-info { 
              background: #2a2a2a; 
              padding: 15px; 
              border-radius: 5px; 
              margin: 20px 0; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Confirm Desktop Login</h2>
            
            <div class="user-info">
              <p>You are logged in as:</p>
              <h3>${userName}</h3>
              <p>${userEmail}</p>
            </div>
            
            <p>Do you want to log in to your desktop with this account?</p>
            
            <button class="btn" onclick="confirmLogin()">Yes, Log Me In</button>
            
            <div id="result" style="margin-top: 20px;"></div>
            
            <script>
              async function confirmLogin() {
                const result = document.getElementById('result');
                result.innerHTML = '<p>Confirming login...</p>';
                
                try {
                  const response = await fetch('${config.backendUrl}/api/qr/confirm', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': 'Bearer ${token}'
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
                  result.innerHTML = '<p style="color: red;">❌ Network error: ' + error.message + '</p>';
                }
              }
            </script>
          </div>
        </body>
        </html>
      `);
    } else {
      // No token - show error
      res.send(`
        <html>
        <body style="background: #1a1a1a; color: white; text-align: center; padding: 50px; font-family: Arial;">
          <h2>Error</h2>
          <p>Authentication data missing. Please try scanning the QR code again.</p>
          <a href="${config.frontendUrl}${config.frontendPath}/login" 
             style="background: #007bff; color: white; padding: 15px 30px; border-radius: 5px; text-decoration: none;">
            Go to Login
          </a>
        </body>
        </html>
      `);
    }
  } catch (err) {
    res.status(500).send('Server error');
  }
};