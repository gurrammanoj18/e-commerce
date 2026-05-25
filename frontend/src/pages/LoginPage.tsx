import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/pages/LoginPage.css";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!(await login(email, password))) {
      setError("Enter a valid email and a password with at least 6 characters.");
      return;
    }
    toast.success("Logged in successfully");
    navigate("/", { replace: true });
  };

  return (
    <section className="shell section page-section auth-page">
      <form className="store-card auth-card" onSubmit={handleSubmit}>
        <span className="eyebrow">Login</span>
        <h1>Welcome back</h1>
        <p>Access saved carts, checkout faster, and track future orders.</p>
        <label>
          Email
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
          Login
        </button>
        <p>
          New here? <Link to="/signup">Create an account</Link>
        </p>
      </form>
    </section>
  );
};

export default LoginPage;
