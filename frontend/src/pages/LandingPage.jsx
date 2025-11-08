import React from "react";
import "./HomePage.css";

export default function LandingPage({ user, onContinue, onSignOut }) {
  return (
    <div className="home-page">
      <div className="home-container">
        <div className="home-content">
          <h1 className="home-title">Welcome</h1>
          <p className="home-subtitle">You're signed in — nice to see you!</p>

          <div style={{ marginTop: 16 }}>
            <p>
              Signed in as{" "}
              <strong>{user?.email || user?.displayName || "User"}</strong>
            </p>
          </div>

          <div className="home-actions" style={{ marginTop: 20 }}>
            <button className="btn-sign-in" onClick={onContinue}>
              Continue to App
            </button>
            <button
              style={{
                marginLeft: 12,
                background: "transparent",
                border: "1px solid #eee",
                padding: "10px 16px",
                borderRadius: 8,
              }}
              onClick={onSignOut}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
