// frontend/src/pages/ProfilePage.jsx
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { FaUserEdit, FaLock, FaCheckCircle } from "react-icons/fa";
import "./ProfilePage.css"; // ⭐ CSS Import

const ProfilePage = () => {
  const { user, apiClient } = useAuth();
  const [newName, setNewName] = useState(user.name);
  const [newEmail, setNewEmail] = useState(user.email);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");

  const [status, setStatus] = useState({ message: null, type: null }); // {message: '...', type: 'success' | 'error'}
  const [loading, setLoading] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setStatus({ message: null, type: null });
    setLoading(true);

    try {
      const response = await apiClient.put("/profile", {
        name: newName,
        email: newEmail,
      }); // Assuming the backend sends back the updated user object // In a real app, you'd need an AuthContext method to update local user state // For simplicity, we just show a success message here.
      setStatus({ message: "Profile updated successfully!", type: "success" });
    } catch (err) {
      setStatus({
        message: err.response?.data?.message || "Failed to update profile.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setStatus({ message: null, type: null });
    setLoading(true);

    if (password !== confirmPassword) {
      setStatus({ message: "New passwords do not match.", type: "error" });
      setLoading(false);
      return;
    }

    if (!oldPassword) {
      setStatus({ message: "Old password is required.", type: "error" });
      setLoading(false);
      return;
    }

    try {
      await apiClient.put("/profile/password", {
        oldPassword,
        newPassword: password,
      });
      setStatus({ message: "Password updated successfully!", type: "success" });
      setPassword("");
      setConfirmPassword("");
      setOldPassword("");
    } catch (err) {
      setStatus({
        message:
          err.response?.data?.message ||
          "Failed to update password. Check old password.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
            <h1 className="page-title">User Profile</h1>     {" "}
      {/* Status Message */}     {" "}
      {status.message && (
        <div className={`status-message ${status.type}-status`}>
                   {" "}
          {status.type === "success" ? (
            <FaCheckCircle className="status-icon" />
          ) : null}
                    {status.message}       {" "}
        </div>
      )}
           {" "}
      <div className="profile-grid">
                {/* I. Profile Update Form (FR1.3) */}       {" "}
        <div className="profile-card">
                   {" "}
          <h2 className="card-title">
                        <FaUserEdit className="icon-left" /> Edit Information  
                   {" "}
          </h2>
                   {" "}
          <form className="profile-form" onSubmit={handleProfileUpdate}>
                       {" "}
            <div className="form-group">
                            <label className="form-label">Name</label>
                           {" "}
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="form-input"
                required
              />
                         {" "}
            </div>
                       {" "}
            <div className="form-group">
                            <label className="form-label">Email</label>
                           {" "}
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="form-input"
                required
              />
                         {" "}
            </div>
                       {" "}
            <button
              type="submit"
              disabled={loading}
              className="submit-button primary-button"
            >
                            {loading ? "Updating..." : "Save Profile Changes"} 
                       {" "}
            </button>
                     {" "}
          </form>
                 {" "}
        </div>
                {/* II. Password Update Form (FR1.3) */}       {" "}
        <div className="profile-card">
                   {" "}
          <h2 className="card-title">
                        <FaLock className="icon-left" /> Change Password        
             {" "}
          </h2>
                   {" "}
          <form className="profile-form" onSubmit={handlePasswordUpdate}>
                       {" "}
            <div className="form-group">
                            <label className="form-label">Old Password</label>
                           {" "}
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="form-input"
                required
              />
                         {" "}
            </div>
                       {" "}
            <div className="form-group">
                            <label className="form-label">New Password</label>
                           {" "}
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                required
                minLength="6"
              />
                         {" "}
            </div>
                       {" "}
            <div className="form-group">
                           {" "}
              <label className="form-label">Confirm New Password</label>
                           {" "}
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input"
                required
                minLength="6"
              />
                         {" "}
            </div>
                       {" "}
            <button
              type="submit"
              disabled={loading}
              className="submit-button primary-button"
            >
                            {loading ? "Updating..." : "Change Password"}       
                 {" "}
            </button>
                     {" "}
          </form>
                 {" "}
        </div>
             {" "}
      </div>
         {" "}
    </div>
  );
};

export default ProfilePage;
