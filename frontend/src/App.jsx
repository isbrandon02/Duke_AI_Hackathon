import React from "react";
import SignRecognition from "./components/SignRecognition";
import "./App.css";

export default function App() {
  return (
    <div className="app">
      <header>
        <h1>Sign Language Recognition</h1>
        <p>ASL Recognition using MediaPipe and Machine Learning</p>
      </header>
      <main>
        <SignRecognition />
      </main>
    </div>
  );
}
