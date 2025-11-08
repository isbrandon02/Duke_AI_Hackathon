import React, { useState, useMemo } from "react";
import "./CompetePage.css";

export default function CompetePage({ onBack = null }) {
  const [difficulty, setDifficulty] = useState("easy");
  const [isReady, setIsReady] = useState(false);

  const difficulties = ["easy", "medium", "hard", "expert"];

  // Placeholder leaderboards. Replace with API data as needed.
  const leaderboards = useMemo(
    () => ({
      easy: [
        ["Alex", "00:12.34"],
        ["Sam", "00:13.02"],
        ["Taylor", "00:14.10"],
        ["Jordan", "00:15.01"],
        ["Casey", "00:15.80"],
        ["Riley", "00:16.22"],
        ["Morgan", "00:16.88"],
        ["Jamie", "00:17.11"],
        ["Drew", "00:17.45"],
        ["Blake", "00:18.00"],
      ],
      medium: [
        ["Ava", "00:10.12"],
        ["Ethan", "00:11.03"],
        ["Noah", "00:11.45"],
        ["Liam", "00:12.00"],
        ["Mia", "00:12.33"],
        ["Olivia", "00:13.00"],
        ["Sophia", "00:13.40"],
        ["Logan", "00:14.00"],
        ["Lucas", "00:14.50"],
        ["Zoe", "00:15.10"],
      ],
      hard: [
        ["Leader1", "00:09.11"],
        ["Leader2", "00:09.50"],
        ["Leader3", "00:10.00"],
        ["Leader4", "00:10.20"],
        ["Leader5", "00:10.45"],
        ["Leader6", "00:11.02"],
        ["Leader7", "00:11.40"],
        ["Leader8", "00:12.10"],
        ["Leader9", "00:12.55"],
        ["Leader10", "00:13.00"],
      ],
      expert: [
        ["Pro1", "00:08.10"],
        ["Pro2", "00:08.60"],
        ["Pro3", "00:09.00"],
        ["Pro4", "00:09.20"],
        ["Pro5", "00:09.50"],
        ["Pro6", "00:10.00"],
        ["Pro7", "00:10.40"],
        ["Pro8", "00:11.00"],
        ["Pro9", "00:11.50"],
        ["Pro10", "00:12.00"],
      ],
    }),
    []
  );

  const activeBoard = leaderboards[difficulty] || [];

  return (
    <div className="compete-page">
      <header className="compete-header">
        {onBack && (
          <button className="btn-ghost" onClick={onBack}>
            Back
          </button>
        )}
        <h2>Compete</h2>
      </header>

      <main className="compete-main with-leaderboard">
        <aside className="leaderboard">
          <h4>
            Leaderboard (
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)})
          </h4>
          <ol className="rank-list">
            {activeBoard.map(([name, time], idx) => (
              <li
                key={`${difficulty}-${idx}`}
                className={`rank-item rank-${idx + 1}`}
              >
                <div className="rank-left">
                  <span className="rank-pos">{idx + 1}</span>
                  <span className="rank-name">{name}</span>
                </div>
                <div className="rank-time">{time}</div>
              </li>
            ))}
          </ol>
        </aside>

        <section className="difficulty-panel">
          <h3>Select difficulty</h3>
          <div className="difficulty-list">
            {difficulties.map((d) => (
              <button
                key={d}
                className={`diff-btn ${difficulty === d ? "selected" : ""}`}
                onClick={() => {
                  setDifficulty(d);
                  setIsReady(false);
                }}
              >
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>

          <div className="ready-area">
            {difficulty === "easy" ? (
              !isReady ? (
                <button className="btn-ready" onClick={() => setIsReady(true)}>
                  Ready (Easy)
                </button>
              ) : (
                <div className="ready-state">
                  <p>You are ready for Easy — waiting for opponents...</p>
                  <button
                    className="btn-ghost"
                    onClick={() => setIsReady(false)}
                  >
                    Cancel
                  </button>
                </div>
              )
            ) : (
              <p className="coming-soon">
                Select Easy to enable Ready (other difficulties coming soon).
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
