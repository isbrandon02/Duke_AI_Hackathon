import React, { useState } from "react";
import "./ModulePage.css";
import logo from "../../../gesturify_logo.png";
// import letter images from src so they are bundled by Vite
import Aimg from "../letters/A.png";
import Bimg from "../letters/B.png";
import Cimg from "../letters/C.png";
import Dimg from "../letters/D.png";

const MODULE_CONTENT = {
  letters: {
    title: "Letters",
    words: Array.from({ length: 26 }).map((_, i) =>
      String.fromCharCode(65 + i)
    ),
  },
  greetings: {
    title: "Greetings",
    words: [
      "Hello",
      "Hi",
      "Good morning",
      "Good afternoon",
      "Good night",
      "Goodbye",
      "Please",
      "Thank you",
      "You're welcome",
      "How are you?",
    ],
  },
  // placeholders for other modules
  family: { title: "Family", words: ["Mother", "Father", "Brother", "Sister"] },
  food: { title: "Food", words: ["Eat", "Drink", "Hungry", "Delicious"] },
  numbers: { title: "Numbers", words: ["One", "Two", "Three", "Four"] },
  colors: { title: "Colors", words: ["Red", "Blue", "Green", "Yellow"] },
  emotions: {
    title: "Emotions",
    words: ["Happy", "Sad", "Angry", "Surprised"],
  },
  weather: { title: "Weather", words: ["Sunny", "Rain", "Cloudy", "Windy"] },
  time: { title: "Time", words: ["Now", "Later", "Today", "Tomorrow"] },
  travel: { title: "Travel", words: ["Go", "Car", "Plane", "Train"] },
  questions: { title: "Questions", words: ["Who", "What", "Where", "Why"] },
};

export default function ModulePage({ moduleId, onBack = null }) {
  const [selectedWord, setSelectedWord] = useState(null);

  const LETTER_IMAGES = {
    A: Aimg,
    B: Bimg,
    C: Cimg,
    D: Dimg,
  };

  const content = MODULE_CONTENT[moduleId] || {
    title: moduleId || "Module",
    words: [],
  };

  // compute preview image source when a word is selected
  const imageSrc =
    moduleId === "letters" && selectedWord && selectedWord.length === 1
      ? LETTER_IMAGES[selectedWord.toUpperCase()] || logo
      : selectedWord
      ? logo
      : null;

  return (
    <div className="module-page">
      <header className="module-header">
        <div className="module-header-left">
          {onBack && (
            <button className="btn-ghost" onClick={onBack}>
              Back
            </button>
          )}
          <h2 className="module-page-title">{content.title}</h2>
        </div>
      </header>

      <main className="module-main">
        <aside className="module-sidebar">
          {/** dynamic sidebar title depending on module */}
          {(() => {
            const sidebarTitle =
              moduleId === "greetings"
                ? "Greeting words"
                : moduleId === "letters"
                ? "Alphabet"
                : `${content.title} words`;
            return <h3 className="module-sidebar-title">{sidebarTitle}</h3>;
          })()}
          <ul className="module-word-list">
            {content.words.map((w) => (
              <li
                key={w}
                className={`module-word-item ${
                  selectedWord === w ? "selected" : ""
                }`}
                onClick={() => setSelectedWord(w)}
              >
                {w}
              </li>
            ))}
          </ul>
        </aside>

        <section className="module-content">
          <div className="module-placeholder">
            <p>Click a word on the left to see sample gestures.</p>
          </div>

          {selectedWord && (
            <aside className="module-preview-panel" aria-label="Preview panel">
              <div className="module-preview-header">
                <button
                  className="btn-ghost"
                  onClick={() => setSelectedWord(null)}
                >
                  Return
                </button>
                <h4 className="module-image-title">
                  {moduleId === "letters"
                    ? `Letter ${selectedWord}`
                    : selectedWord}
                </h4>
              </div>
              <div className="module-preview-body">
                <img
                  src={imageSrc || logo}
                  alt={`${selectedWord} example`}
                  className="module-preview-img"
                  onError={(e) => {
                    if (e && e.target) e.target.src = logo;
                  }}
                />
                <div className="module-preview-actions">
                  <button
                    className="btn-try"
                    onClick={() => alert(`Try for yourself: ${selectedWord}`)}
                  >
                    Try for yourself
                  </button>
                </div>
              </div>
            </aside>
          )}
        </section>
      </main>
    </div>
  );
}
