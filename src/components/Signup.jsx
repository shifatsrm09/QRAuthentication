import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import user_icon from "../Assets/person.png";
import email_icon from "../Assets/email.png";
import password_icon from "../Assets/password.png";
import "./Signup.css";
import { signup } from "../services/authService";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async () => {
    if (!name || !email || !password) {
      alert("Please fill in all fields");
      return;
    }

    try {
      setIsLoading(true);
      await signup(name, email, password);
      alert("Signup successful! Please log in.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSignup();
    }
  };

  return (
    <div className="login-container black-theme">
      <div className="login-content">
        <div className="login-form-section">
          <div className="form-card">
            <div className="form-header">
              <h1>Create Account</h1>
              <p>Join us and get started today</p>
            </div>

            <div className="form-inputs">
              <div className="input-group">
                <div className="input-icon">
                  <img src={user_icon} alt="user" />
                </div>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="form-input"
                />
              </div>

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
                />
              </div>
            </div>

            <button 
              className="login-btn" 
              onClick={handleSignup}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="btn-loading">
                  <div className="btn-spinner"></div>
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>

            <div className="form-footer">
              <p>
                Already have an account? <Link to="/login" className="signup-link">Log in here</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;