import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Environment, OrbitControls, Sparkles, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { AppMode, HandGestureState } from '../types';
import Ornaments from './Ornaments';
import PhotoCloud from './PhotoCloud';

interface ExperienceProps {
  mode: AppMode;
  handState: HandGestureState;
  photos: string[];
}

const Experience: React.FC<ExperienceProps> = ({ mode, handState, photos }) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  // Camera animation logic based on hand
  useFrame((state, delta) => {
    // Smooth camera drift
    if (mode === AppMode.TREE) {
      // Auto rotate slowly around tree
      const t = state.clock.getElapsedTime() * 0.1;
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, Math.sin(t) * 25, 0.02);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, Math.cos(t) * 25, 0.02);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, 5, 0.02);
      camera.lookAt(0, 0, 0);
    } else if (mode === AppMode.SCATTERED && handState.isPresent) {
      // Hand movement controls camera rotation relative to center
      // Hand X (0-1) -> Rotation Y
      // Hand Y (0-1) -> Rotation X (Elevation)
      
      const targetX = (handState.x - 0.5) * 40; // Horizontal range
      const targetY = (handState.y - 0.5) * 20; // Vertical range
      
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, Math.sin(targetX * 0.1) * 25, 0.05);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, Math.cos(targetX * 0.1) * 25, 0.05);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.05);
      camera.lookAt(0, 0, 0);
    } else if (mode === AppMode.PHOTO_VIEW) {
        // Lock camera
        camera.position.lerp(new THREE.Vector3(0, 0, 10), 0.05);
        camera.lookAt(0,0,0);
    }
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.2} color="#001100" />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#FFD700" />
      <pointLight position={[-10, 5, -10]} intensity={1} color="#FF0000" />
      <spotLight position={[0, 20, 0]} angle={0.5} penumbra={1} intensity={2} color="#FFFFFF" castShadow />

      {/* Environment */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Sparkles count={200} scale={30} size={4} speed={0.4} opacity={0.5} color="#FFD700" />

      {/* Objects */}
      <Ornaments mode={mode} count={350} />
      <PhotoCloud mode={mode} photos={photos} />

      {/* Post Processing */}
      <EffectComposer disableNormalPass>
        <Bloom luminanceThreshold={0.5} mipmapBlur intensity={1.5} radius={0.6} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </>
  );
};

export default Experience;
