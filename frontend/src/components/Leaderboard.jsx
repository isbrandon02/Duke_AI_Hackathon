import { useEffect, useState } from "react";
import { db } from "../hooks/firebase.js";            // <- correct path
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";

function todayKey() { return new Date().toISOString().slice(0,10); }

export default function Leaderboard({ board = todayKey() }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    // If Firebase isn’t configured, just show empty state (don’t crash)
    if (!db) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const q = query(
          collection(db, "scores_letters"),
          where("board", "==", board),
          orderBy("score", "desc"),
          limit(10)
        );
        const snap = await getDocs(q);
        if (ignore) return;
        const list = [];
        snap.forEach((d) => list.push(d.data()));
        setRows(list);
      } catch (e) {
        console.error("Leaderboard error:", e);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => { ignore = true; };
  }, [board]);

  return (
    <div className="comp-card">
      <div className="comp-card-title">Leaderboard (Today)</div>
      {!db ? (
        <div className="comp-muted">Connect Firebase to enable leaderboard.</div>
      ) : loading ? (
        <div className="comp-muted">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="comp-muted">No scores yet—be the first!</div>
      ) : (
        <table className="comp-table">
          <thead>
            <tr>
              <th>#</th><th>Player</th><th>Score</th><th>Acc</th><th>Avg(ms)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>{i+1}</td>
                <td>{r.username ?? "Player"}</td>
                <td>{r.score ?? 0}</td>
                <td>{Math.round((r.accuracy ?? 0)*100)}%</td>
                <td>{r.avgReactionMs ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}