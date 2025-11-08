// frontend/src/lib/detectLetter.js
let lastKey = null;

/** Keyboard simulator for local testing.
 *  - Press SAME LETTER as the prompt -> CORRECT
 *  - Press X -> explicit incorrect
 *  - Any other key -> incorrect
 */
export function attachKeyboardSim() {
  const handler = (e) => { lastKey = (e.key || "").toUpperCase(); };
  window.addEventListener("keydown", handler);
  return () => window.removeEventListener("keydown", handler);
}

export async function detectLetter(/* videoEl */ _videoEl, target) {
  // simulate model latency
  await new Promise((r) => setTimeout(r, 80));

  if (!lastKey) return { ok: false, kind: "idle" };

  const k = lastKey;
  lastKey = null;

  if (k === "X") return { ok: false, kind: "explicit" };
  if (k === target) return { ok: true, kind: "match", key: k };
  return { ok: false, kind: "explicit", key: k };
}