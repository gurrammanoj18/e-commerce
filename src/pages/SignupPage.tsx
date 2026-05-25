import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/pages/SignupPage.css";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";

const SignupPage: React.FC = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormState((currentState) => ({ ...currentState, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (formState.password !== formState.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!(await signup(formState.name, formState.email, formState.password))) {
      setError("Complete all fields and use a password with at least 6 characters.");
      return;
    }
    toast.success("Account created successfully");
    navigate("/");
  };

  return (
    <section className="shell section page-section auth-page">
      <form className="store-card auth-card" onSubmit={handleSubmit}>
        <span className="eyebrow">Signup</span>
        <h1>Create your account</h1>
        <p>Save your details for quicker checkout and future procurement requests.</p>
        <label>
          Full name
          <input name="name" value={formState.name} onChange={handleChange} />
        </label>
        <label>
          Email
          <input name="email" type="email" value={formState.email} onChange={handleChange} />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            value={formState.password}
            onChange={handleChange}
          />
        </label>
        <label>
          Confirm password
          <input
            name="confirmPassword"
            type="password"
            value={formState.confirmPassword}
            onChange={handleChange}
          />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button className="button" type="submit">
          Create account
        </button>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </section>
  );
};

export default SignupPage;
