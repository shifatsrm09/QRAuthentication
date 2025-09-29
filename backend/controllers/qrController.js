const QRSession = require("../models/QRSession");
const jwt = require("jsonwebtoken");

// Generate QR session
exports.generateQR = async (req, res) => {
  try {
    const sessionId = Math.random().toString(36).substr(2, 9);
    const session = new QRSession({ sessionId });
    await session.save();
    
    // Point to React app route instead of direct backend
    res.json({ 
      sessionId, 
      qrURL: `http://192.168.0.100:3000/qr-auth?sessionId=${sessionId}` 
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


// Confirm QR Login (SIMPLIFIED FOR TESTING)
exports.confirmQR = async (req, res) => {
  const { sessionId } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ msg: "No token, mobile not authenticated" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const session = await QRSession.findOne({ sessionId });

    if (!session) return res.status(404).json({ msg: "QR session not found or expired" });

    // ✅ Link mobile user to session
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


// New function - Mobile scan page
exports.scanPage = async (req, res) => {
  const { sessionId, token, user } = req.query;
  
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

    // If token is provided from React app, show confirmation
    if (token) {
      let userEmail = 'Unknown';
      try {
        const userData = JSON.parse(decodeURIComponent(user || '{}'));
        userEmail = userData.email || 'Unknown';
      } catch (e) {
        userEmail = 'Error parsing user';
      }

      res.send(`
        <html>
        <body style="background: #1a1a1a; color: white; text-align: center; padding: 50px; font-family: Arial;">
          <h2>Confirm Login</h2>
          <p>Log in as: <strong>${userEmail}</strong></p>
          <button onclick="confirmLogin('${token}')" style="background: #007bff; color: white; border: none; padding: 15px 30px; border-radius: 5px; cursor: pointer; font-size: 16px;">
            Confirm Login
          </button>
          <div id="result" style="margin-top: 20px;"></div>
          
          <script>
            async function confirmLogin(token) {
              const result = document.getElementById('result');
              result.innerHTML = '<p>Sending confirmation...</p>';
              
              try {
                const response = await fetch('http://192.168.0.100:5000/api/qr/confirm', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                  },
                  body: JSON.stringify({ sessionId: '${sessionId}' })
                });
                
                const data = await response.json();
                if (response.ok) {
                  result.innerHTML = '<p style="color: green;">✅ Success! You can return to desktop.</p>';
                } else {
                  result.innerHTML = '<p style="color: red;">❌ ' + data.msg + '</p>';
                }
              } catch (error) {
                result.innerHTML = '<p style="color: red;">❌ Network error: ' + error.message + '</p>';
              }
            }
          </script>
        </body>
        </html>
      `);
    } else {
      // This shouldn't happen with the new flow, but just in case
      res.send(`
        <html>
        <body style="background: #1a1a1a; color: white; text-align: center; padding: 50px; font-family: Arial;">
          <h2>Error</h2>
          <p>Token not provided. Please scan the QR code from the main application.</p>
        </body>
        </html>
      `);
    }
    
  } catch (err) {
    res.status(500).send('Server error');
  }
};