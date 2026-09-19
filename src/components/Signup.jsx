import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthField from "./AuthField";
import { signup } from "../services/authService";
import { getErrorMessage } from "../services/client";
import userIcon from "../Assets/person.png";
import emailIcon from "../Assets/email.png";
import passwordIcon from "../Assets/password.png";

const Signup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError("");
    try {
      await signup(name.trim(), email.trim(), password);
      navigate("/login", { replace: true, state: { registered: true } });
    } catch (err) {
      setError(getErrorMessage(err, "Signup failed. Please try again."));
      setSubmitting(false);
    }
  };

  return (
    <main className="page">
      <div className="auth-layout">
        <section className="card">
          <header className="card__header">
            <h1>Create Account</h1>
            <p>Join us and get started today</p>
          </header>

          <form className="form" onSubmit={handleSubmit}>
            {error && (
              <p className="message message--error" role="alert">
                {error}
              </p>
            )}

            <AuthField
              icon={userIcon}
              type="text"
              name="name"
              placeholder="Full Name"
              aria-label="Full name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              className="btn btn--primary"
              type="submit"
              disabled={!name || !email || !password || submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner spinner--sm" aria-hidden="true" />
                  Creating account…
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="card__footer">
            Already have an account?{" "}
            <Link className="link" to="/login">
              Log in here
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
};

export default Signup;
