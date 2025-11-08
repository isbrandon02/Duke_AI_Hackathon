import { useEffect, useRef } from 'react';
import { Hands } from '@mediapipe/hands';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { HAND_CONNECTIONS } from '@mediapipe/hands';

export default function CameraFeed({ onLandmarksDetected, videoRef, isActive }) {
  const canvasRef = useRef(null);
  const handsRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Ensure video element has the stream and plays
  useEffect(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.play().catch(err => {
        console.error('Video play error:', err);
      });
    }
  }, [isActive, videoRef]);

  useEffect(() => {
    if (!isActive || !videoRef.current || !videoRef.current.srcObject) return;

    const hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      }
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    hands.onResults((results) => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;

      const ctx = canvas.getContext('2d');
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw hand landmarks if detected (canvas is transparent overlay)
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        
        // Mirror landmarks for drawing (video is already mirrored)
        const mirroredLandmarks = landmarks.map(lm => ({
          ...lm,
          x: 1 - lm.x
        }));
        
        // Draw hand connections (MediaPipe utils expect normalized coords)
        drawConnectors(ctx, mirroredLandmarks, HAND_CONNECTIONS, {
          color: '#00FF00',
          lineWidth: 2
        });
        
        // Draw landmarks
        drawLandmarks(ctx, mirroredLandmarks, {
          color: '#FF0000',
          lineWidth: 1,
          radius: 3
        });

        // Send original landmarks to parent component
        if (onLandmarksDetected) {
          onLandmarksDetected(landmarks);
        }
      }

      ctx.restore();
    });

    handsRef.current = hands;

    // Set canvas size
    const updateCanvasSize = () => {
      if (canvasRef.current && videoRef.current) {
        const width = videoRef.current.videoWidth || 640;
        const height = videoRef.current.videoHeight || 480;
        canvasRef.current.width = width;
        canvasRef.current.height = height;
      }
    };

    // Wait for video to be ready
    const setupVideo = () => {
      if (videoRef.current) {
        videoRef.current.addEventListener('loadedmetadata', updateCanvasSize);
        videoRef.current.addEventListener('loadeddata', () => {
          updateCanvasSize();
        });
        if (videoRef.current.readyState >= 2) {
          updateCanvasSize();
        }
      }
    };

    setupVideo();

    // Process frames
    const processFrame = async () => {
      if (videoRef.current && handsRef.current && videoRef.current.readyState === 4) {
        await handsRef.current.send({ image: videoRef.current });
      }
      if (isActive) {
        animationFrameRef.current = requestAnimationFrame(processFrame);
      }
    };

    processFrame();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (videoRef.current) {
        videoRef.current.removeEventListener('loadedmetadata', updateCanvasSize);
      }
    };
  }, [isActive, onLandmarksDetected, videoRef]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '480px' }}>
      <video
        ref={videoRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: 'scaleX(-1)', // Mirror for user
          zIndex: 1,
          backgroundColor: '#000'
        }}
        playsInline
        muted
        autoPlay
      />
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 2,
          pointerEvents: 'none'
        }}
      />
    </div>
  );
}

