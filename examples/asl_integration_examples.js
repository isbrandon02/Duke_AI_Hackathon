/**
 * ASL Integration Examples
 * 
 * This file contains practical examples for integrating ASL alphabet recognition
 * with the backend API. These examples show how to:
 * 1. Capture hand landmarks
 * 2. Format data for the backend
 * 3. Send requests to prediction and scoring APIs
 * 4. Handle responses
 */

// ============================================================================
// EXAMPLE 1: Basic Hand Landmark Capture and Prediction
// ============================================================================

/**
 * Sends hand landmarks to the prediction API
 * Returns the predicted sign and confidence
 */
async function predictSign(landmarks) {
  try {
    const response = await fetch('http://localhost:8000/api/sign-language/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        hand_landmarks: {
          landmarks: landmarks.map(lm => ({
            x: lm.x,
            y: lm.y,
            z: lm.z || 0
          }))
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      sign: data.predicted_sign,
      confidence: data.confidence,
      allPredictions: data.all_predictions
    };
  } catch (error) {
    console.error('Error predicting sign:', error);
    return null;
  }
}

// Usage:
// const result = await predictSign(landmarksFromMediaPipe);
// console.log(`Predicted: ${result.sign} (${result.confidence * 100}%)`);

// ============================================================================
// EXAMPLE 2: Scoring a Single Frame Against a Reference
// ============================================================================

/**
 * Scores a user's hand sign attempt against a reference sign
 * @param {string} targetLetter - The letter to score against (e.g., "A", "B")
 * @param {Array} landmarks - Array of 21 landmarks from MediaPipe
 * @returns {Object} Scoring result with score, passed status, and tips
 */
async function scoreSignAttempt(targetLetter, landmarks) {
  try {
    // Add visibility to landmarks (1.0 = fully visible)
    const landmarksWithVisibility = landmarks.map(lm => ({
      x: lm.x,
      y: lm.y,
      z: lm.z || 0,
      v: 1.0  // Assume fully visible; can be adjusted based on MediaPipe data
    }));

    const response = await fetch('http://localhost:8000/api/attempts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        word: targetLetter,
        frames: [
          {
            landmarks: landmarksWithVisibility
          }
        ]
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return {
      letter: result.word,
      score: result.score,
      passed: result.passed,
      tips: result.tips
    };
  } catch (error) {
    console.error('Error scoring sign attempt:', error);
    return null;
  }
}

// Usage:
// const result = await scoreSignAttempt('A', landmarksFromMediaPipe);
// if (result) {
//   console.log(`Score: ${result.score}/100`);
//   console.log(`Passed: ${result.passed}`);
//   console.log(`Tips: ${result.tips.join(', ')}`);
// }

// ============================================================================
// EXAMPLE 3: Multi-Frame Collection for Better Accuracy
// ============================================================================

class HandSignRecorder {
  constructor(targetLetter, maxFrames = 10) {
    this.targetLetter = targetLetter;
    this.maxFrames = maxFrames;
    this.frames = [];
    this.isRecording = false;
  }

  start() {
    this.isRecording = true;
    this.frames = [];
    console.log(`Started recording for letter: ${this.targetLetter}`);
  }

  stop() {
    this.isRecording = false;
    console.log(`Stopped recording. Captured ${this.frames.length} frames`);
  }

  /**
   * Add a frame of landmarks during recording
   */
  addFrame(landmarks) {
    if (!this.isRecording) return;

    if (landmarks.length !== 21) {
      console.warn('Invalid landmarks: must have exactly 21 points');
      return;
    }

    const landmarksWithVisibility = landmarks.map(lm => ({
      x: lm.x,
      y: lm.y,
      z: lm.z || 0,
      v: 1.0
    }));

    this.frames.push({ landmarks: landmarksWithVisibility });

    // Keep only the most recent frames
    if (this.frames.length > this.maxFrames) {
      this.frames.shift();
    }
  }

  /**
   * Submit all collected frames for scoring
   */
  async submitForScoring() {
    if (this.frames.length === 0) {
      throw new Error('No frames captured. Start recording first.');
    }

    try {
      const response = await fetch('http://localhost:8000/api/attempts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          word: this.targetLetter,
          frames: this.frames
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error submitting for scoring:', error);
      throw error;
    }
  }

  clear() {
    this.frames = [];
  }

  getFrameCount() {
    return this.frames.length;
  }
}

// Usage:
// const recorder = new HandSignRecorder('A', 10);
// recorder.start();
// 
// // In your landmark detection callback:
// function onLandmarksDetected(landmarks) {
//   recorder.addFrame(landmarks);
// }
//
// // After 1-2 seconds of recording:
// recorder.stop();
// const result = await recorder.submitForScoring();
// console.log(result);

// ============================================================================
// EXAMPLE 4: ASL Alphabet Learning Interface
// ============================================================================

class ASLAlphabetTrainer {
  constructor() {
    this.alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    this.currentIndex = 0;
    this.scores = {};
    this.passThreshold = 75;
  }

  getCurrentLetter() {
    return this.alphabet[this.currentIndex];
  }

  async checkAttempt(landmarks) {
    const currentLetter = this.getCurrentLetter();
    
    try {
      const result = await scoreSignAttempt(currentLetter, landmarks);
      
      if (!result) {
        return { success: false, error: 'Failed to score attempt' };
      }

      // Store the score
      this.scores[currentLetter] = result.score;

      // Check if passed
      if (result.passed) {
        return {
          success: true,
          passed: true,
          score: result.score,
          message: `Great! You passed letter ${currentLetter}!`,
          tips: result.tips
        };
      } else {
        return {
          success: true,
          passed: false,
          score: result.score,
          message: `Keep trying! Score: ${result.score}/100`,
          tips: result.tips
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  moveToNext() {
    if (this.currentIndex < this.alphabet.length - 1) {
      this.currentIndex++;
      return {
        success: true,
        letter: this.getCurrentLetter()
      };
    } else {
      return {
        success: false,
        message: 'You have completed all letters!'
      };
    }
  }

  moveToPrevious() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return {
        success: true,
        letter: this.getCurrentLetter()
      };
    } else {
      return {
        success: false,
        message: 'Already at the first letter'
      };
    }
  }

  getProgress() {
    return {
      current: this.currentIndex + 1,
      total: this.alphabet.length,
      percentage: ((this.currentIndex + 1) / this.alphabet.length) * 100,
      scores: this.scores
    };
  }

  reset() {
    this.currentIndex = 0;
    this.scores = {};
  }
}

// Usage in React component:
/*
function ASLLearning() {
  const [trainer] = useState(() => new ASLAlphabetTrainer());
  const [currentLetter, setCurrentLetter] = useState(trainer.getCurrentLetter());
  const [result, setResult] = useState(null);

  const handleCheck = async (landmarks) => {
    const checkResult = await trainer.checkAttempt(landmarks);
    setResult(checkResult);
    
    if (checkResult.passed) {
      setTimeout(() => {
        const nextResult = trainer.moveToNext();
        if (nextResult.success) {
          setCurrentLetter(nextResult.letter);
          setResult(null);
        }
      }, 2000);
    }
  };

  return (
    <div>
      <h2>Learn Letter: {currentLetter}</h2>
      <CameraFeed onLandmarksDetected={handleCheck} />
      {result && (
        <div>
          <p>{result.message}</p>
          {result.tips && result.tips.map((tip, i) => (
            <p key={i}>{tip}</p>
          ))}
        </div>
      )}
    </div>
  );
}
*/

// ============================================================================
// EXAMPLE 5: Data Collection for Training
// ============================================================================

class ASLDataCollector {
  constructor(letter) {
    this.letter = letter;
    this.samples = [];
    this.isCollecting = false;
    this.sampleInterval = 500; // Collect sample every 500ms
    this.lastSampleTime = 0;
  }

  start() {
    this.isCollecting = true;
    this.samples = [];
    console.log(`Started collecting data for letter: ${this.letter}`);
  }

  stop() {
    this.isCollecting = false;
    console.log(`Stopped collecting. Total samples: ${this.samples.length}`);
  }

  /**
   * Collect a sample if enough time has passed
   */
  collectSample(landmarks) {
    if (!this.isCollecting) return false;

    const now = Date.now();
    if (now - this.lastSampleTime < this.sampleInterval) {
      return false;
    }

    if (landmarks.length !== 21) {
      console.warn('Invalid landmarks: must have exactly 21 points');
      return false;
    }

    const sample = {
      letter: this.letter,
      landmarks: landmarks.map(lm => ({
        x: lm.x,
        y: lm.y,
        z: lm.z || 0
      })),
      timestamp: now
    };

    this.samples.push(sample);
    this.lastSampleTime = now;
    
    console.log(`Collected sample ${this.samples.length}`);
    return true;
  }

  /**
   * Export collected data as JSON
   */
  exportData() {
    const json = JSON.stringify(this.samples, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `asl_${this.letter}_samples_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log(`Exported ${this.samples.length} samples for letter ${this.letter}`);
  }

  /**
   * Get samples in format ready for model training
   */
  getTrainingData() {
    return this.samples.map(sample => ({
      features: sample.landmarks.flatMap(lm => [lm.x, lm.y, lm.z]), // Flatten to [x1,y1,z1,x2,y2,z2,...]
      label: sample.letter
    }));
  }

  getSampleCount() {
    return this.samples.length;
  }
}

// Usage for data collection:
// const collector = new ASLDataCollector('A');
// collector.start();
// 
// // In landmark detection callback:
// function onLandmarksDetected(landmarks) {
//   collector.collectSample(landmarks);
// }
//
// // After collecting ~50-100 samples:
// collector.stop();
// collector.exportData();

// ============================================================================
// EXAMPLE 6: Real-time Prediction with Debouncing
// ============================================================================

class RealtimeASLPredictor {
  constructor(debounceMs = 500) {
    this.debounceMs = debounceMs;
    this.lastPredictionTime = 0;
    this.currentPrediction = null;
  }

  async predict(landmarks) {
    const now = Date.now();
    
    // Debounce: only predict if enough time has passed
    if (now - this.lastPredictionTime < this.debounceMs) {
      return this.currentPrediction;
    }

    this.lastPredictionTime = now;

    const result = await predictSign(landmarks);
    
    if (result) {
      this.currentPrediction = result;
      
      // Only show predictions with confidence above threshold
      if (result.confidence > 0.7) {
        console.log(`Detected: ${result.sign} (${(result.confidence * 100).toFixed(1)}%)`);
        return result;
      }
    }

    return null;
  }

  getCurrentPrediction() {
    return this.currentPrediction;
  }

  reset() {
    this.currentPrediction = null;
    this.lastPredictionTime = 0;
  }
}

// Usage:
// const predictor = new RealtimeASLPredictor(500);
//
// function onLandmarksDetected(landmarks) {
//   predictor.predict(landmarks).then(result => {
//     if (result) {
//       updateUI(result);
//     }
//   });
// }

// ============================================================================
// EXAMPLE 7: Get Supported Words from Backend
// ============================================================================

async function getSupportedWords() {
  try {
    const response = await fetch('http://localhost:8000/api/words');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const words = await response.json();
    return words;
  } catch (error) {
    console.error('Error fetching supported words:', error);
    return [];
  }
}

// Usage:
// const words = await getSupportedWords();
// console.log('Available signs:', words);
// words.forEach(word => {
//   console.log(`${word.display_name} (${word.difficulty})`);
// });

// ============================================================================
// EXAMPLE 8: Batch Processing Multiple Letters
// ============================================================================

async function processAlphabetSequence(landmarksByLetter) {
  /**
   * Process multiple letters at once
   * @param {Object} landmarksByLetter - Object with letter keys and landmarks arrays
   * Example: { 'A': landmarks1, 'B': landmarks2, ... }
   */
  const results = {};
  
  for (const [letter, landmarks] of Object.entries(landmarksByLetter)) {
    try {
      const result = await scoreSignAttempt(letter, landmarks);
      results[letter] = result;
    } catch (error) {
      console.error(`Error processing letter ${letter}:`, error);
      results[letter] = { error: error.message };
    }
  }
  
  return results;
}

// Usage:
// const results = await processAlphabetSequence({
//   'A': landmarksA,
//   'B': landmarksB,
//   'C': landmarksC
// });
// console.log(results);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Validate that landmarks array is properly formatted
 */
function validateLandmarks(landmarks) {
  if (!Array.isArray(landmarks)) {
    return { valid: false, error: 'Landmarks must be an array' };
  }
  
  if (landmarks.length !== 21) {
    return { valid: false, error: `Expected 21 landmarks, got ${landmarks.length}` };
  }
  
  for (let i = 0; i < landmarks.length; i++) {
    const lm = landmarks[i];
    if (typeof lm.x !== 'number' || typeof lm.y !== 'number') {
      return { valid: false, error: `Landmark ${i} missing x or y coordinate` };
    }
  }
  
  return { valid: true };
}

/**
 * Convert landmarks to the format expected by prediction API
 */
function formatForPrediction(landmarks) {
  const validation = validateLandmarks(landmarks);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  return {
    hand_landmarks: {
      landmarks: landmarks.map(lm => ({
        x: lm.x,
        y: lm.y,
        z: lm.z || 0
      }))
    }
  };
}

/**
 * Convert landmarks to the format expected by scoring API
 */
function formatForScoring(landmarks, targetWord) {
  const validation = validateLandmarks(landmarks);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  return {
    word: targetWord,
    frames: [
      {
        landmarks: landmarks.map(lm => ({
          x: lm.x,
          y: lm.y,
          z: lm.z || 0,
          v: lm.v !== undefined ? lm.v : 1.0
        }))
      }
    ]
  };
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    predictSign,
    scoreSignAttempt,
    HandSignRecorder,
    ASLAlphabetTrainer,
    ASLDataCollector,
    RealtimeASLPredictor,
    getSupportedWords,
    processAlphabetSequence,
    validateLandmarks,
    formatForPrediction,
    formatForScoring
  };
}
