import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/pages/AdminLoginPage.css";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";

const AUTH_STORAGE_KEY = "voltmart-auth-user";

const AdminLoginPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { adminLogin, isAdmin, isAuthenticated, logout } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const redirectTo =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ??
    "/admin/dashboard";

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAdmin, isAuthenticated, navigate, redirectTo]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const result = await adminLogin(email, password);
    if (result.error) {
      setError(result.error);
      return;
    }

    const storedUser = window.localStorage.getItem(AUTH_STORAGE_KEY);
    const nextUser = storedUser ? (JSON.parse(storedUser) as { role?: string }) : null;

    if (nextUser?.role !== "ROLE_ADMIN") {
      logout();
      setError("This account does not have admin access.");
      return;
    }

    toast.success("Admin login successful");
  };

  return (
    <section className="shell section page-section auth-page">
      <form className="store-card auth-card" onSubmit={handleSubmit}>
        <span className="eyebrow">Admin login</span>
        <h1>Admin portal access</h1>
        <p>Sign in with an admin account to open the VoltMart control center.</p>
        <label>
          Admin email
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button className="button" type="submit">
          Login to admin
        </button>
        <p>
          Looking for the storefront? <Link to="/products">Go to website</Link>
        </p>
      </form>
    </section>
  );
};

export default AdminLoginPage;
