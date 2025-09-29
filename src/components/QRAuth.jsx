import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const QRAuth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('sessionId');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    console.log("QRAuth - Token:", token ? "Found" : "Not found");
    console.log("QRAuth - Session ID:", sessionId);
    
    if (token && sessionId) {
      // Redirect to backend with token
      const redirectUrl = `http://192.168.0.100:5000/api/qr/scan?sessionId=${sessionId}&token=${encodeURIComponent(token)}&user=${encodeURIComponent(user || '{}')}`;
      console.log("Redirecting to:", redirectUrl);
      window.location.href = redirectUrl;
    } else {
      if (!token) {
        alert('Please log in first before scanning QR codes');
        navigate('/login');
      } else if (!sessionId) {
        alert('Invalid QR code');
        navigate('/login');
      }
    }
  }, [sessionId, navigate]);

  return (
    <div style={{ 
      background: '#1a1a1a', 
      color: 'white', 
      textAlign: 'center', 
      padding: '50px',
      fontFamily: 'Arial',
      minHeight: '100vh'
    }}>
      <h2>QR Authentication</h2>
      <p>Redirecting to confirm login...</p>
      <div style={{ marginTop: '20px' }}>
        <div style={{ 
          background: '#333', 
          padding: '15px', 
          borderRadius: '5px',
          textAlign: 'left',
          maxWidth: '500px',
          margin: '0 auto'
        }}>
          <strong>Debug Info:</strong><br />
          Session ID: {sessionId || 'Not found'}<br />
          Token: {localStorage.getItem('token') ? '✅ Found' : '❌ Not found'}<br />
          User: {localStorage.getItem('user') ? '✅ Found' : '❌ Not found'}
        </div>
      </div>
    </div>
  );
};

export default QRAuth;