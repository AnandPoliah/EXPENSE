// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

// 1. Configure the API client to handle the token
const apiClient = axios.create({
  baseURL: "http://localhost:5000/api/v1", // Matches your Node.js backend URL
});

// Interceptor to attach the JWT token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate(); // Load user from storage on initial load

  React.useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      // Simple check to ensure state is set on refresh
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiClient.post("/auth/login", { email, password });
      const { token, user: userData } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);
      navigate("/dashboard"); // Redirect after successful login
      return true;
    } catch (error) {
      console.error(
        "Login failed:",
        error.response ? error.response.data : error.message
      );
      throw new Error(error.response?.data?.message || "Login failed.");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  }; // Registration logic would be similar to login, but without setting the token yet

  const register = async (name, email, password) => {
    // Implement API call to /auth/register
    try {
      await apiClient.post("/auth/register", { name, email, password });
      return true;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Registration failed.");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        apiClient,
        login,
        logout,
        register,
        isAuthenticated: !!user,
      }}
    >
            {children}   {" "}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
