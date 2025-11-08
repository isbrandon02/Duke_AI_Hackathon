import { useState, useCallback, useEffect } from 'react';
import { useCamera } from '../hooks/useCamera';
import { useSignRecognition } from '../hooks/useSignRecognition';
import CameraFeed from './CameraFeed';
import './SignRecognition.css';

export default function SignRecognition({ targetSign = null, onCorrect = null }) {
  const { videoRef, startCamera, stopCamera, isActive, error: cameraError } = useCamera();
  const { prediction, confidence, isProcessing, error: recognitionError, predictSign, reset } = useSignRecognition();
  const [isCorrect, setIsCorrect] = useState(false);

  // Check if prediction matches target sign
  useEffect(() => {
    if (targetSign && prediction) {
      const matches = prediction.toUpperCase() === targetSign.toUpperCase();
      setIsCorrect(matches);
      if (matches && onCorrect) {
        onCorrect();
      }
    } else {
      setIsCorrect(false);
    }
  }, [prediction, targetSign, onCorrect]);

  const handleLandmarksDetected = useCallback((landmarks) => {
    if (landmarks && landmarks.length === 21) {
      predictSign(landmarks);
    }
  }, [predictSign]);

  const handleStart = () => {
    reset();
    setIsCorrect(false);
    startCamera();
  };

  const handleStop = () => {
    stopCamera();
    reset();
    setIsCorrect(false);
  };

  return (
    <div className="sign-recognition">
      <div className="camera-container">
        {isActive ? (
          <CameraFeed
            videoRef={videoRef}
            onLandmarksDetected={handleLandmarksDetected}
            isActive={isActive}
          />
        ) : (
          <div className="camera-placeholder">
            <p>Click "Start Camera" to begin</p>
          </div>
        )}
      </div>

      <div className="controls">
        {!isActive ? (
          <button onClick={handleStart} className="btn btn-start">
            Start Camera
          </button>
        ) : (
          <button onClick={handleStop} className="btn btn-stop">
            Stop Camera
          </button>
        )}
      </div>

      <div className="results">
        {cameraError && (
          <div className="error">
            <p>Camera Error: {cameraError}</p>
          </div>
        )}

        {recognitionError && (
          <div className="error">
            <p>Recognition Error: {recognitionError}</p>
          </div>
        )}

        {isProcessing && (
          <div className="processing">
            <p>Processing...</p>
          </div>
        )}

        {prediction && (
          <div className={`prediction ${isCorrect ? 'correct' : ''}`}>
            <div className="prediction-sign">
              <h2>{prediction}</h2>
            </div>
            <div className="prediction-confidence">
              <p>Confidence: {(confidence * 100).toFixed(1)}%</p>
            </div>
            {targetSign && (
              <div className="target-sign">
                <p>Target: {targetSign}</p>
                {isCorrect && (
                  <div className="correct-indicator">
                    ✓ Correct!
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {!prediction && !isProcessing && isActive && (
          <div className="waiting">
            <p>Show your hand to the camera</p>
          </div>
        )}
      </div>
    </div>
  );
}

