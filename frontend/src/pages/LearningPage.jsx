import React from "react";
import "./LearningPage.css";

export default function LearningPage({ onBack = null, onSelectModule = null }) {
  const modules = [
    { id: "letters", title: "Letters" },
    { id: "greetings", title: "Greetings" },
    { id: "family", title: "Family" },
    { id: "food", title: "Food" },
    { id: "numbers", title: "Numbers" },
    { id: "colors", title: "Colors" },
    { id: "emotions", title: "Emotions" },
    { id: "weather", title: "Weather" },
    { id: "time", title: "Time" },
    { id: "travel", title: "Travel" },
  ];

  return (
    <div className="learning-page">
      <header className="learning-header">
        <h1 className="learning-title">Learning Pathway</h1>
        {onBack && (
          <button className="btn-ghost" onClick={onBack}>
            Back
          </button>
        )}
      </header>

      <main className="learning-main">
        <div className="path-wrapper">
          <div className="modules-scroll">
            <div className="modules-line" />
            <div className="modules">
              {modules.map((m, i) => (
                <div key={m.id} className="module-item">
                  <div
                    className={`module-box ${m.id}`}
                    role={onSelectModule ? "button" : undefined}
                    onClick={() => onSelectModule && onSelectModule(m.id)}
                    style={{ cursor: onSelectModule ? "pointer" : "default" }}
                  >
                    <div className="module-badge">Module {i + 1}</div>
                    <div className="module-title">{m.title}</div>
                  </div>
                  {i < modules.length - 1 && (
                    <div className="module-connector" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
