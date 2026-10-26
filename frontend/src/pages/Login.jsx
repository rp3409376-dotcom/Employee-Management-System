import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isRegistering = mode === "register";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (isRegistering && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/auth/${isRegistering ? "register" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(isRegistering ? { name: name.trim() } : {}),
          email: email.trim().toLowerCase(),
          password,
        }),
      });
      const responseText = await response.text();
      let result = null;

      if (responseText) {
        try {
          result = JSON.parse(responseText);
        } catch {
          result = null;
        }
      }

      if (!response.ok) {
        if (response.status === 401 && !isRegistering) {
          throw new Error("Email or password is incorrect. Check your details or create an employee account.");
        }
        if (response.status >= 500) {
          throw new Error("The server is unavailable right now. Please try again shortly.");
        }
        throw new Error(
          result?.error ||
          (typeof result?.message === "string" && result.message) ||
          "Unable to continue. Please check your details and try again.",
        );
      }

      if (
        typeof result?.token !== "string" ||
        !result.token ||
        !result.user ||
        typeof result.user !== "object" ||
        !["admin", "employee"].includes(result.user.role)
      ) {
        throw new Error("The server returned an unexpected response. Please try again.");
      }

      login(result.user, result.token);
      navigate(result.user.role === "admin" ? "/admin-dashboard" : "/employee-dashboard", {
        replace: true,
      });
    } catch (requestError) {
      setError(requestError.message || "Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const changeMode = () => {
    setMode((current) => current === "login" ? "register" : "login");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setError("");
  };

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <a className="login-brand" href="/login" aria-label="Employee MS home">
          <span className="login-brand-mark">P</span>
          <span>Employee MS</span>
        </a>

        <div className="login-heading">
          <h1 id="login-title">{isRegistering ? "Create your account" : "Sign in"}</h1>
          <p>{isRegistering ? "Create an employee account to continue." : "Enter your email and password to continue."}</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="login-error" role="alert">{error}</div>}

          {isRegistering && (
            <div className="login-field">
              <label htmlFor="name">Full name</label>
              <input
                autoComplete="name"
                id="name"
                name="name"
                onChange={(event) => setName(event.target.value)}
                placeholder="Your full name"
                required
                value={name}
              />
            </div>
          )}

          <div className="login-field">
            <label htmlFor="email">Email address</label>
            <input
              autoComplete="email"
              id="email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              required
              type="email"
              value={email}
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrap">
              <input
                autoComplete={isRegistering ? "new-password" : "current-password"}
                id="password"
                name="password"
                onChange={(event) => setPassword(event.target.value)}
                minLength={isRegistering ? 8 : undefined}
                placeholder={isRegistering ? "At least 8 characters" : "Enter your password"}
                required
                type={showPassword ? "text" : "password"}
                value={password}
              />
              <button
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="password-toggle"
                onClick={() => setShowPassword((visible) => !visible)}
                type="button"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {isRegistering && (
            <div className="login-field">
              <label htmlFor="confirm-password">Confirm password</label>
              <input
                autoComplete="new-password"
                id="confirm-password"
                name="confirm-password"
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Enter your password again"
                required
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
              />
            </div>
          )}

          <button className="login-submit" disabled={loading} type="submit">
            {loading
              ? isRegistering ? "Creating account…" : "Signing in…"
              : isRegistering ? "Create account" : "Sign in"}
          </button>
        </form>

        <p className="login-help">
          {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            className="login-mode-toggle"
            disabled={loading}
            onClick={changeMode}
            type="button"
          >
            {isRegistering ? "Sign in" : "Create account"}
          </button>
        </p>
        <p className="login-help">
          Admin accounts are provisioned by the system administrator. New sign-ups are employee accounts.
        </p>
      </section>
    </main>
  );
};

export default Login;
