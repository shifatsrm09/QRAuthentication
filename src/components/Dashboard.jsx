import React from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="dashboard-container black-theme">
      <div className="dashboard-content">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-content">
            <h1 className="dashboard-title">Dashboard</h1>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="dashboard-main">
          <div className="welcome-card">
            <div className="welcome-content">
              <div className="user-avatar">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="user-info">
                <h2>Welcome back, {user.name || "User"}!</h2>
                <p className="user-email">{user.email || "user@example.com"}</p>
              </div>
            </div>
          </div>

          {/* Simple Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👤</div>
              <div className="stat-content">
                <h3>Profile Status</h3>
                <p>Active</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <h3>Account Type</h3>
                <p>Standard</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="actions-section">
            <h3>Quick Actions</h3>
            <div className="actions-grid">
              <button className="action-btn">
                <span className="action-icon">⚙️</span>
                <span>Settings</span>
              </button>
              <button className="action-btn">
                <span className="action-icon">👤</span>
                <span>Profile</span>
              </button>
              <button className="action-btn">
                <span className="action-icon">🔒</span>
                <span>Security</span>
              </button>
              <button className="action-btn">
                <span className="action-icon">ℹ️</span>
                <span>Help</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;