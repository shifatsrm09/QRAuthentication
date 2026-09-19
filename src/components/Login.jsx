import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthField from "./AuthField";
import QrPanel from "./QrPanel";
import { login } from "../services/authService";
import { getErrorMessage } from "../services/client";
import useMediaQuery from "../hooks/useMediaQuery";
import useQrLogin from "../hooks/useQrLogin";
import { saveSession } from "../utils/session";
import emailIcon from "../Assets/email.png";
import passwordIcon from "../Assets/password.png";

// The QR card only appears (and a QR session is only created) on wider screens.
const DESKTOP_QUERY = "(min-width: 769px)";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const showQr = useMediaQuery(DESKTOP_QUERY);

  const finishLogin = ({ token, user }) => {
    saveSession(token, user);
    navigate("/dashboard", { replace: true });
  };

  const qr = useQrLogin({ enabled: showQr, onAuthenticated: finishLogin });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError("");
    try {
      const data = await login(email.trim(), password);
      if (!data.token || !data.user) throw new Error("Invalid response from server");
      finishLogin(data);
    } catch (err) {
      setError(getErrorMessage(err, "Login failed. Check your email and password."));
      setSubmitting(false);
    }
  };

  return (
    <main className="page">
      <div className={`auth-layout${showQr ? " auth-layout--split" : ""}`}>
        <section className="card">
          <header className="card__header">
            <h1>Welcome Back</h1>
            <p>Sign in to your account</p>
          </header>

          <form className="form" onSubmit={handleSubmit}>
            {location.state?.registered && !error && (
              <p className="message message--success" role="status">
                Account created. Please sign in.
              </p>
            )}
            {error && (
              <p className="message message--error" role="alert">
                {error}
              </p>
            )}

            <AuthField
              icon={emailIcon}
              type="email"
              name="email"
              placeholder="Email Address"
              aria-label="Email address"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <AuthField
              icon={passwordIcon}
              type="password"
              name="password"
              placeholder="Password"
              aria-label="Password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button className="btn btn--primary" type="submit" disabled={!email || !password || submitting}>
              {submitting ? (
                <>
                  <span className="spinner spinner--sm" aria-hidden="true" />
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="card__footer">
            Don't have an account?{" "}
            <Link className="link" to="/signup">
              Sign up now
            </Link>
          </p>
        </section>

        {showQr && (
          <QrPanel url={qr.url} status={qr.status} connectionIssue={qr.connectionIssue} onRefresh={qr.refresh} />
        )}
      </div>
    </main>
  );
};

export default Login;
