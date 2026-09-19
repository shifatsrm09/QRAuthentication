import React from "react";
import { useNavigate } from "react-router-dom";
import { clearSession, getUser } from "../utils/session";

// Starter dashboard: replace the "Start building" card with your own app.
const Dashboard = () => {
  const navigate = useNavigate();
  const user = getUser();
  const name = user?.name || "User";

  const handleLogout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  return (
    <div className="page page--top">
      <div className="dashboard">
        <header className="dashboard__header">
          <h1>Dashboard</h1>
          <button type="button" className="btn btn--danger btn--auto" onClick={handleLogout}>
            Logout
          </button>
        </header>

        <main className="dashboard__body">
          <section className="card profile">
            <div className="avatar" aria-hidden="true">
              {name.charAt(0).toUpperCase()}
            </div>
            <div className="profile__info">
              <h2>Welcome back, {name}!</h2>
              {user?.email && <p>{user.email}</p>}
            </div>
          </section>

          <section className="card">
            <h3>Start building</h3>
            <p className="muted">
              You're signed in. Add your own pages and features here: this screen lives in{" "}
              <code>src/components/Dashboard.jsx</code>.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
