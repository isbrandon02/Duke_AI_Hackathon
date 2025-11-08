import React from "react";
import "./HomePage.css";

export default function HomePage({
  onSignIn,
  isLoading = false,
  authError = null,
}) {
  return (
    <div className="home-page">
      <div className="home-container">
        <div className="home-content">
          <h1 className="home-title">Sign Language Recognition</h1>
          <p className="home-subtitle">
            Learn and practice American Sign Language (ASL) with AI-powered
            recognition
          </p>

          <div className="home-features">
            <div className="feature">
              <div className="feature-icon">🤚</div>
              <h3>Real-time Recognition</h3>
              <p>Get instant feedback on your sign language gestures</p>
            </div>
            <div className="feature">
              <div className="feature-icon">🎯</div>
              <h3>Practice Mode</h3>
              <p>Improve your skills with interactive learning</p>
            </div>
            <div className="feature">
              <div className="feature-icon">📊</div>
              <h3>Track Progress</h3>
              <p>Monitor your improvement over time</p>
            </div>
          </div>

          <div className="home-actions">
            <button
              className="btn-sign-in"
              onClick={onSignIn}
              disabled={isLoading}
            >
              {isLoading ? "Opening sign-in..." : "Sign In to Get Started"}
            </button>
            <p className="home-help-text">
              Sign in to access sign language recognition and practice features
            </p>
            {authError && (
              <div
                className="home-error"
                style={{ color: "#ff4d4f", marginTop: 8 }}
              >
                {String(authError?.message || authError)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
