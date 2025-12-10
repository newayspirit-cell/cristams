import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Upload, Hand, Info, Camera, MousePointer2 } from 'lucide-react';
import Experience from './components/Experience';
import HandRecognizer from './components/HandRecognizer';
import { AppMode, HandGestureState } from './types';

// Placeholder images from Picsum
const INITIAL_PHOTOS = [
  'https://picsum.photos/id/1015/500/500',
  'https://picsum.photos/id/1016/500/500',
  'https://picsum.photos/id/1018/500/500',
  'https://picsum.photos/id/1019/500/500',
  'https://picsum.photos/id/1025/500/500',
  'https://picsum.photos/id/1033/500/500',
  'https://picsum.photos/id/1041/500/500',
];

function App() {
  const [mode, setMode] = useState<AppMode>(AppMode.TREE);
  const [handState, setHandState] = useState<HandGestureState>({
    gesture: 'None',
    x: 0.5,
    y: 0.5,
    isPresent: false
  });
  const [photos, setPhotos] = useState<string[]>(INITIAL_PHOTOS);

  // Gesture Logic Processor
  useEffect(() => {
    if (!handState.isPresent) return;

    // Debounce state switching slightly or just direct map
    // We map gestures to states
    const g = handState.gesture;

    if (g === 'Closed_Fist') {
      setMode(AppMode.TREE);
    } else if (g === 'Open_Palm') {
      setMode(AppMode.SCATTERED);
    } else if (g === 'Victory' || g === 'Pointing_Up') {
      // "Grab" mechanic - Switch to Photo View
      // Only allow transition from Scattered to Photo for dramatic effect
      if (mode === AppMode.SCATTERED || mode === AppMode.PHOTO_VIEW) {
        setMode(AppMode.PHOTO_VIEW);
      }
    }
  }, [handState.gesture, handState.isPresent, mode]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newUrls = Array.from(e.target.files).map(file => URL.createObjectURL(file as File));
      setPhotos(prev => [...prev, ...newUrls]);
    }
  };

  return (
    <div className="w-full h-screen relative bg-black overflow-hidden">
      
      {/* 3D Scene */}
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 25], fov: 45 }}>
        <Experience mode={mode} handState={handState} photos={photos} />
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full p-6 pointer-events-none flex justify-between items-start">
        {/* Header */}
        <div className="text-white">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-500 drop-shadow-lg">
            Noël Lumineux
          </h1>
          <p className="text-yellow-100/70 text-sm mt-2 tracking-widest uppercase">
            Interactive Gesture Experience
          </p>
        </div>

        {/* Hand Recognizer (Top Left inside component, positioned absolutely) */}
        <div className="pointer-events-auto">
           {/* The recognizer component renders its own video preview box */}
           <HandRecognizer onUpdate={setHandState} />
        </div>
      </div>

      {/* Instructions / Status */}
      <div className="absolute bottom-10 left-10 pointer-events-none space-y-4">
        <div className="bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10 text-white max-w-sm">
          <div className="flex items-center gap-2 mb-3 text-yellow-400 font-bold">
            <Info size={20} />
            <span>Gesture Controls</span>
          </div>
          <ul className="space-y-3 text-sm text-gray-200">
            <li className="flex items-center gap-3">
              <span className={`p-2 rounded-full ${handState.gesture === 'Closed_Fist' ? 'bg-red-500 text-white' : 'bg-white/10'}`}>
                 ✊
              </span>
              <span><strong>Fist:</strong> Gather Tree</span>
            </li>
            <li className="flex items-center gap-3">
              <span className={`p-2 rounded-full ${handState.gesture === 'Open_Palm' ? 'bg-green-500 text-white' : 'bg-white/10'}`}>
                 ✋
              </span>
              <span><strong>Open Hand:</strong> Scatter & Rotate</span>
            </li>
            <li className="flex items-center gap-3">
              <span className={`p-2 rounded-full ${(handState.gesture === 'Victory' || handState.gesture === 'Pointing_Up') ? 'bg-blue-500 text-white' : 'bg-white/10'}`}>
                 ✌️
              </span>
              <span><strong>Victory/Peace:</strong> Grab Photo</span>
            </li>
          </ul>
        </div>
        
        {/* Debug / Status Indicator */}
        <div className="text-xs text-white/50 font-mono">
          State: {mode} | Detected: {handState.gesture}
        </div>
      </div>

      {/* Upload Controls */}
      <div className="absolute bottom-10 right-10 pointer-events-auto">
        <label className="group flex items-center justify-center w-16 h-16 rounded-full bg-white/10 hover:bg-yellow-500/80 border border-yellow-500/50 backdrop-blur-md cursor-pointer transition-all duration-300 shadow-[0_0_20px_rgba(255,215,0,0.2)] hover:shadow-[0_0_40px_rgba(255,215,0,0.6)]">
          <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="hidden" />
          <Upload className="text-yellow-200 group-hover:text-white transition-colors" size={24} />
        </label>
        <p className="text-center text-yellow-200/60 text-xs mt-2 uppercase tracking-wide">Add Photos</p>
      </div>

    </div>
  );
}

export default App;