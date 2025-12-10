import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision';
import { HandGestureState } from '../types';

interface HandRecognizerProps {
  onUpdate: (state: HandGestureState) => void;
}

const HandRecognizer: React.FC<HandRecognizerProps> = ({ onUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);
  const gestureRecognizerRef = useRef<GestureRecognizer | null>(null);
  const requestRef = useRef<number>();

  useEffect(() => {
    const init = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
      );
      
      gestureRecognizerRef.current = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 1
      });
      setLoaded(true);
    };

    init();
    return () => {
       if (gestureRecognizerRef.current) {
         gestureRecognizerRef.current.close();
       }
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;

    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener('loadeddata', predictWebcam);
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
      }
    };

    startWebcam();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      cancelAnimationFrame(requestRef.current!);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  const predictWebcam = () => {
    if (!gestureRecognizerRef.current || !videoRef.current) return;

    const nowInMs = Date.now();
    const results = gestureRecognizerRef.current.recognizeForVideo(videoRef.current, nowInMs);

    if (results.gestures.length > 0 && results.landmarks.length > 0) {
      const gesture = results.gestures[0][0].categoryName;
      // Get palm center (average of wrist(0), index(5), pinky(17))
      const landmarks = results.landmarks[0];
      const cx = (landmarks[0].x + landmarks[5].x + landmarks[17].x) / 3;
      const cy = (landmarks[0].y + landmarks[5].y + landmarks[17].y) / 3;

      onUpdate({
        gesture: gesture,
        x: cx,
        y: cy,
        isPresent: true
      });
    } else {
      onUpdate({
        gesture: 'None',
        x: 0.5,
        y: 0.5,
        isPresent: false
      });
    }

    requestRef.current = requestAnimationFrame(predictWebcam);
  };

  return (
    <div className="absolute top-4 left-4 z-50 w-32 h-24 overflow-hidden rounded-lg border-2 border-gold-500/50 shadow-lg bg-black/50 backdrop-blur-sm">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        className="w-full h-full object-cover transform scale-x-[-1]" // Mirror video
      />
      {!loaded && <div className="absolute inset-0 flex items-center justify-center text-xs text-white">Loading AI...</div>}
    </div>
  );
};

export default HandRecognizer;
