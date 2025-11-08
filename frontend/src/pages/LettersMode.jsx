import { useEffect, useRef, useState } from "react";
import { auth, db } from "../hooks/firebase.js";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import Leaderboard from "../components/Leaderboard";
import { LETTERS, nextLetter } from "../lib/letters";
import { detectLetter, attachKeyboardSim } from "../lib/detectLetter.js";
import "../styles/competition.css";

const DURATION = 30_000;

export default function LettersMode() {
  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [avgMs, setAvgMs] = useState(0);
  const [target, setTarget] = useState(LETTERS[0]);
  const [feedback, setFeedback] = useState(null);
  const [startedAt, setStartedAt] = useState(0);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const tickRef = useRef(null);
  const lastPromptAt = useRef(performance.now());
  const hasSubmittedRef = useRef(false);

  // Camera
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });
        if (cancelled) return;
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (e) {
        console.error("Camera error:", e);
      }
    })();
    return () => {
      cancelled = true;
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Demo keyboard detector
  useEffect(() => attachKeyboardSim(), []);

  // Timer
  useEffect(() => {
    if (!running) return;
    setStartedAt(Date.now());
    lastPromptAt.current = performance.now();
    tickRef.current = setInterval(() => {
      setTimeLeft((t) => {
        const next = Math.max(0, t - 100);
        if (next === 0) {
          clearInterval(tickRef.current);
          setRunning(false);
        }
        return next;
      });
    }, 100);
    return () => clearInterval(tickRef.current);
  }, [running]);

  // Detect loop
  useEffect(() => {
    if (!running) return;
    let stop = false;

    const loop = async () => {
      while (!stop) {
        const started = performance.now();
        const res = await detectLetter(videoRef.current, target);

        if (res?.ok && res.kind === "match") {
          const reaction = performance.now() - lastPromptAt.current;

          // Update attempts & avg using the *latest* attempt count
          setAttempts((aPrev) => {
            const aNew = aPrev + 1;
            setAvgMs((p) => Math.round((p * aPrev + reaction) / aNew));
            return aNew;
          });

          setScore((s) => s + 1);
          setFeedback("correct");
          setTarget((prev) => {
            const n = nextLetter(prev);
            lastPromptAt.current = performance.now();
            return n;
          });
          await sleep(260);
          setFeedback(null);
        } else if (res?.kind === "explicit") {
          setAttempts((a) => a + 1);
          setFeedback("try");
          await sleep(240);
          setFeedback(null);
        }

        // ~200ms cadence
        const spent = performance.now() - started;
        await sleep(Math.max(0, 200 - spent));
      }
    };

    loop();
    return () => {
      stop = true;
    };
  }, [running, target]);

  const accuracy = attempts ? Math.min(1, score / attempts) : 0;

  function startRound() {
    setScore(0);
    setAttempts(0);
    setAvgMs(0);
    setTarget(nextLetter(null));
    setTimeLeft(DURATION);
    setFeedback(null);
    hasSubmittedRef.current = false; // allow submit at end of this round
    setRunning(true);
  }

  async function submitScore() {
    // prevent duplicate submissions (timer + manual exit)
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;

    // If Firebase isn't configured, skip saving (don't crash)
    if (!db) {
      console.warn("Skipping score submit: Firestore (db) not initialized.");
      return;
    }

    const user = auth?.currentUser ?? null;
    const username = user?.displayName || user?.email || "Player";
    const board = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    const attemptsSafe = Number.isFinite(attempts) ? attempts : 0;
    const scoreSafe = Number.isFinite(score) ? score : 0;
    const avgMsSafe = Number.isFinite(avgMs) ? avgMs : 0;
    const acc = attemptsSafe > 0 ? scoreSafe / attemptsSafe : 0;

    try {
      await addDoc(collection(db, "scores_letters"), {
        userId: user?.uid ?? null,
        username,
        score: scoreSafe,
        attempts: attemptsSafe,
        accuracy: Number(acc.toFixed(4)),
        avgReactionMs: avgMsSafe,
        durationSec:
          Math.max(0, Math.round((Date.now() - (startedAt || Date.now())) / 1000)) || 30,
        board,
        timestamp: serverTimestamp(),
        mode: "letters",
      });
    } catch (e) {
      console.error("Error saving score:", e);
    }
  }

  // Auto-submit when time ends
  useEffect(() => {
    if (timeLeft === 0) submitScore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  return (
    <div className="comp-page">
      <main className="comp-main">
        <header className="comp-header">
          <div className="brand">👋 Gesturify</div>
          <div className="spacer" />
          <div className="pill pill-blue">⏱ {clock(timeLeft)}</div>
          <div className="pill pill-green">Score: {score}</div>
        </header>

        <section className="comp-center">
          <div className="letter-pill">{target}</div>

          <div className="camera">
            <video ref={videoRef} playsInline muted className="video" />
            {feedback === "correct" && (
              <div className="banner banner-good">✓ Correct!</div>
            )}
            {feedback === "try" && (
              <div className="banner banner-gray">Try again</div>
            )}
          </div>

          <div className="stats">
            <span className="chip">Accuracy {Math.round(accuracy * 100)}%</span>
            <span className="chip">Avg {avgMs} ms</span>
          </div>

          {!running ? (
            <button className="btn btn-primary" onClick={startRound}>
              Start 30-Second Round
            </button>
          ) : (
            <button className="btn btn-ghost" onClick={submitScore}>
              Exit (Unranked)
            </button>
          )}

          <p className="hint">
            Demo: press the same letter key for correct, <b>X</b> for incorrect.
          </p>
        </section>
      </main>

      <aside className="comp-side">
        <Leaderboard />
      </aside>
    </div>
  );
}

function sleep(n) {
  return new Promise((r) => setTimeout(r, n));
}
function clock(ms) {
  const s = Math.ceil(ms / 1000);
  return `00:${String(s % 60).padStart(2, "0")}`;
}