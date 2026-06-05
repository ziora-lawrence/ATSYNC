import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./resetpassword.css";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConPassword, setShowConPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const initSession = async () => {
      // Check if we already have an active session
      let { data: { session } } = await supabase.auth.getSession();
      
      // If not, try to parse tokens from URL hash fragment (Supabase standard)
      if (!session) {
        const hash = window.location.hash;
        if (hash) {
          const rawHash = hash.startsWith("#") ? hash.substring(1) : hash;
          const params = new URLSearchParams(rawHash);
          const accessToken = params.get("access_token");
          const refreshToken = params.get("refresh_token");
          
          if (accessToken && refreshToken) {
            try {
              const { data, error: setSessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
              });
              if (!setSessionError && data.session) {
                session = data.session;
              }
            } catch (err) {
              console.error("Error setting session from hash:", err);
            }
          }
        }
      }

      if (session) {
        setHasSession(true);
      } else {
        setError("Invalid or expired session. Please request a new password reset email.");
      }
    };

    initSession();
  }, []);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!password.trim()) return setError("Password cannot be empty");
    if (password.length < 6) return setError("Password must be at least 6 characters long");
    if (password !== confirmPassword) return setError("Passwords do not match");

    setIsLoading(true);
    setError("");

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password.trim()
      });

      if (updateError) {
        setError(updateError.message || "Failed to update password");
      } else {
        setSuccess(true);
        // Clear tokens from local storage so they log in fresh
        localStorage.removeItem("atsync_token");
        localStorage.removeItem("atsync_user");
        
        // Redirect to homepage login after 3 seconds
        setTimeout(() => {
          navigate("/");
        }, 3000);
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-page-container">
      <div className="reset-card-box">
        <div className="reset-logo">
          <span className="logo-white">ATS</span><span className="logo-blue">YNC</span>
        </div>

        {success ? (
          <div className="reset-success-state">
            <div className="reset-success-icon">✨</div>
            <h2>Password Updated!</h2>
            <p className="reset-subtitle">
              Your password has been changed successfully. Redirecting you to the home page to login...
            </p>
            <div className="reset-loader-line"></div>
          </div>
        ) : (
          <>
            <h2>Create New Password</h2>
            <p className="reset-subtitle">
              Enter your new secure password below to regain access to your dashboard.
            </p>

            {error && (
              <p className="reset-error-msg">
                {error}
              </p>
            )}

            {hasSession && (
              <form onSubmit={handlePasswordUpdate}>
                <div className="reset-input-group">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    placeholder="New Password"
                    className="reset-input-field"
                  />
                  <span
                    className="reset-eye-icon"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </span>
                </div>

                <div className="reset-input-group">
                  <input
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    type={showConPassword ? "text" : "password"}
                    placeholder="Confirm New Password"
                    className="reset-input-field"
                  />
                  <span
                    className="reset-eye-icon"
                    onClick={() => setShowConPassword(!showConPassword)}
                  >
                    {showConPassword ? "🙈" : "👁️"}
                  </span>
                </div>

                <button 
                  type="submit" 
                  className="reset-submit-btn" 
                  disabled={isLoading}
                >
                  {isLoading ? "Updating..." : "Update Password"}
                </button>
              </form>
            )}

            {!hasSession && !error && (
              <div className="reset-checking-session">
                <p>Authenticating secure reset session...</p>
                <div className="reset-spinner"></div>
              </div>
            )}

            <button 
              className="reset-back-btn" 
              onClick={() => navigate("/")}
            >
              Back to Home
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
