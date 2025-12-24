// frontend/src/pages/AuthPage.jsx

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
// import { Link } from "react-router-dom"; // Unused
import "./AuthPage.css"; // ⭐ CSS Import

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!name) throw new Error("Name is required for registration.");

        await register(name, email, password);
        alert("Registration successful! Please log in.");
        setIsLogin(true); // Switch to login after successful registration
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
           {" "}
      <div className="auth-form-card">
               {" "}
        <h2 className="auth-title">
                   {" "}
          {isLogin ? "Sign in to Budget Planner" : "Create an Account"}       {" "}
        </h2>
               {" "}
        <form className="auth-form" onSubmit={handleSubmit}>
                   {" "}
          {!isLogin && (
            <input
              type="text"
              required
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
            />
          )}
                   {" "}
          <input
            type="email"
            required
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input"
          />
                   {" "}
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input"
          />
                    {error && <p className="form-error-message">{error}</p>}   
               {" "}
          <button
            type="submit"
            disabled={loading}
            className="form-submit-button primary-button"
          >
                       {" "}
            {loading ? "Processing..." : isLogin ? "Sign In" : "Register"}     
               {" "}
          </button>
                 {" "}
        </form>
               {" "}
        <div className="auth-switch-link-container">
                   {" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="auth-switch-link"
          >
                       {" "}
            {isLogin
              ? "Need an account? Register"
              : "Already have an account? Sign In"}
                     {" "}
          </button>
                 {" "}
        </div>
             {" "}
      </div>
         {" "}
    </div>
  );
};

export default AuthPage;
