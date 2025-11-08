# ASL Integration Examples

This directory contains practical code examples for integrating ASL (American Sign Language) recognition into your application.

## Files

### asl_integration_examples.js

Complete JavaScript implementation with the following classes and functions:

#### Classes

1. **HandSignRecorder**
   - Records multiple frames of hand landmarks
   - Submits collected frames for scoring
   - Usage: Record user's sign over time for better accuracy

2. **ASLAlphabetTrainer**
   - Manages progression through the ASL alphabet
   - Tracks scores and user progress
   - Provides feedback and tips
   - Usage: Build an interactive learning interface

3. **ASLDataCollector**
   - Collects hand landmark samples for training
   - Exports data as JSON
   - Prepares data for model training
   - Usage: Gather training data for the ML model

4. **RealtimeASLPredictor**
   - Real-time sign prediction with debouncing
   - Filters predictions by confidence threshold
   - Usage: Live sign recognition display

#### Functions

1. **predictSign(landmarks)**
   - Sends landmarks to prediction API
   - Returns predicted sign and confidence
   
2. **scoreSignAttempt(targetLetter, landmarks)**
   - Scores user's attempt against reference
   - Returns score, pass/fail status, and tips

3. **getSupportedWords()**
   - Fetches list of available signs from backend

4. **processAlphabetSequence(landmarksByLetter)**
   - Batch processes multiple letters

5. **validateLandmarks(landmarks)**
   - Validates landmark format

6. **formatForPrediction(landmarks)**
   - Formats landmarks for prediction API

7. **formatForScoring(landmarks, targetWord)**
   - Formats landmarks for scoring API

## Quick Start

### 1. Import the examples

```javascript
// In a browser environment
<script src="examples/asl_integration_examples.js"></script>

// In a Node/module environment
import {
  predictSign,
  scoreSignAttempt,
  ASLAlphabetTrainer
} from './examples/asl_integration_examples.js';
```

### 2. Basic Prediction

```javascript
async function checkSign(landmarks) {
  const result = await predictSign(landmarks);
  if (result) {
    console.log(`Detected: ${result.sign}`);
    console.log(`Confidence: ${result.confidence * 100}%`);
  }
}
```

### 3. Score a Sign Attempt

```javascript
async function checkUserSign(letter, landmarks) {
  const result = await scoreSignAttempt(letter, landmarks);
  if (result) {
    console.log(`Score: ${result.score}/100`);
    console.log(`Passed: ${result.passed}`);
    console.log(`Tips: ${result.tips.join(', ')}`);
  }
}
```

### 4. Build an Alphabet Trainer

```javascript
const trainer = new ASLAlphabetTrainer();

// In your landmark detection callback
async function onLandmarks(landmarks) {
  const result = await trainer.checkAttempt(landmarks);
  
  if (result.success && result.passed) {
    console.log(result.message);
    // Move to next letter
    trainer.moveToNext();
  }
}
```

### 5. Collect Training Data

```javascript
const collector = new ASLDataCollector('A');
collector.start();

// In your landmark detection callback
function onLandmarks(landmarks) {
  collector.collectSample(landmarks);
}

// After collecting 50-100 samples
collector.stop();
collector.exportData();
```

## Integration with React

### Example: Simple Sign Recognition Component

```jsx
import { useState } from 'react';
import CameraFeed from './components/CameraFeed';
import { predictSign } from './examples/asl_integration_examples';

function SignRecognizer() {
  const [result, setResult] = useState(null);
  
  const handleLandmarks = async (landmarks) => {
    const prediction = await predictSign(landmarks);
    setResult(prediction);
  };
  
  return (
    <div>
      <CameraFeed onLandmarksDetected={handleLandmarks} />
      {result && (
        <div>
          <h2>Detected: {result.sign}</h2>
          <p>Confidence: {(result.confidence * 100).toFixed(1)}%</p>
        </div>
      )}
    </div>
  );
}
```

### Example: ASL Learning Component

```jsx
import { useState } from 'react';
import CameraFeed from './components/CameraFeed';
import { ASLAlphabetTrainer } from './examples/asl_integration_examples';

function ASLLearning() {
  const [trainer] = useState(() => new ASLAlphabetTrainer());
  const [letter, setLetter] = useState(trainer.getCurrentLetter());
  const [result, setResult] = useState(null);
  
  const handleCheck = async (landmarks) => {
    const checkResult = await trainer.checkAttempt(landmarks);
    setResult(checkResult);
    
    if (checkResult.passed) {
      setTimeout(() => {
        const next = trainer.moveToNext();
        if (next.success) {
          setLetter(next.letter);
          setResult(null);
        }
      }, 2000);
    }
  };
  
  return (
    <div>
      <h1>Learn ASL: Letter {letter}</h1>
      <CameraFeed onLandmarksDetected={handleCheck} />
      {result && (
        <div>
          <p>{result.message}</p>
          <p>Score: {result.score}/100</p>
          {result.tips && result.tips.map((tip, i) => (
            <p key={i}>{tip}</p>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Testing the Examples

### 1. Start the Backend

```bash
cd backend
source .venv/bin/activate
uvicorn main:app --reload
```

### 2. Start the Frontend

```bash
cd frontend
npm run dev
```

### 3. Test in Browser Console

```javascript
// Open browser console and test
const testLandmarks = [
  { x: 0.5, y: 0.4, z: 0.0 },
  // ... add 20 more landmarks
];

// Test prediction
predictSign(testLandmarks).then(result => console.log(result));

// Test scoring
scoreSignAttempt('A', testLandmarks).then(result => console.log(result));
```

## Data Format Requirements

All functions expect landmarks in this format:

```javascript
const landmarks = [
  { x: 0.5, y: 0.4, z: 0.0 },  // WRIST
  { x: 0.52, y: 0.38, z: -0.01 },  // THUMB_CMC
  // ... 19 more landmarks (21 total)
];
```

- `x`: Horizontal position (0-1, normalized)
- `y`: Vertical position (0-1, normalized)
- `z`: Depth (relative to wrist, negative = closer to camera)
- `v`: Visibility (0-1, optional, used by scoring API)

## Next Steps

1. **For Development**: Use these examples as building blocks for your UI
2. **For Training**: Use `ASLDataCollector` to gather training data
3. **For Testing**: Modify examples to test different scenarios
4. **For Production**: Add error handling and user feedback

## Related Documentation

- **Main Guide**: `../FRONTEND_BACKEND_DATA_GUIDE.md`
- **Quick Reference**: `../QUICK_REFERENCE.md`
- **Architecture**: `../ARCHITECTURE_DIAGRAM.md`

## Support

For questions or issues:
1. Check the main documentation files
2. Review the backend API docs at `http://localhost:8000/docs`
3. Examine the source code in `frontend/src/` and `backend/`
