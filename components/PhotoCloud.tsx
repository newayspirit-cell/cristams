import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { AppMode } from '../types';
import { calculateTreePosition, calculateScatterPosition } from '../utils/geometry';

interface PhotoCloudProps {
  mode: AppMode;
  photos: string[];
}

// Sub-component for individual photo to handle texture loading gracefully
const PhotoItem: React.FC<{
  url: string;
  index: number;
  total: number;
  mode: AppMode;
}> = ({ url, index, total, mode }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(THREE.TextureLoader, url);
  
  // Calculate positions once
  const treePos = useMemo(() => calculateTreePosition(index, total, 18, 7.5), [index, total]);
  const scatterPos = useMemo(() => calculateScatterPosition(20), []);
  const currentPos = useRef(treePos.clone());
  
  // Specific zoom position (center screen, close to camera)
  const focusPos = useMemo(() => new THREE.Vector3(0, 0, 5), []);

  // Is this the "active" photo in Photo View? 
  // For simplicity in this MVP, we focus the first photo or a random one.
  // In a full app, we'd pass an ID. Here, let's say index 0 is always the "Grabbed" one for demo consistency,
  // Or we just float them closer.
  // Let's make index % 3 == 0 move closer in PhotoView to simulate a selection.
  const isFocused = mode === AppMode.PHOTO_VIEW && index === 0;

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    let target = treePos;
    let targetScale = 1.5;
    let targetRotation = new THREE.Euler(0, -Math.PI / 2 + (index * 0.5), 0); // Face outward in tree

    if (mode === AppMode.SCATTERED) {
      target = scatterPos;
      targetRotation = new THREE.Euler(state.clock.elapsedTime * 0.1, state.clock.elapsedTime * 0.05, 0);
    } else if (mode === AppMode.PHOTO_VIEW) {
      if (isFocused) {
        target = focusPos;
        targetScale = 4;
        targetRotation = new THREE.Euler(0, 0, 0); // Face camera
      } else {
        // Push others back/fade
        target = scatterPos;
      }
    }

    // Lerp Position
    currentPos.current.lerp(target, 0.05);
    meshRef.current.position.copy(currentPos.current);

    // Lerp Scale
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, 1), 0.05);

    // Lerp Rotation (using Quaternion for smoothness)
    const qTarget = new THREE.Quaternion().setFromEuler(targetRotation);
    meshRef.current.quaternion.slerp(qTarget, 0.05);
    
    // Make look at camera if in tree mode to ensure visibility or billboard? 
    // Actually spiral logic faces them roughly out.
    if (mode === AppMode.TREE) {
        meshRef.current.lookAt(0, currentPos.current.y, 0);
        meshRef.current.rotateY(Math.PI); // Flip to face out
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial 
        map={texture} 
        side={THREE.DoubleSide} 
        transparent 
        opacity={mode === AppMode.PHOTO_VIEW && !isFocused ? 0.3 : 1}
      />
      {/* Gold Frame */}
      <mesh position={[0, 0, -0.01]}>
        <boxGeometry args={[1.1, 1.1, 0.05]} />
        <meshStandardMaterial color="#FFD700" metalness={1} roughness={0.1} />
      </mesh>
    </mesh>
  );
};

const PhotoCloud: React.FC<PhotoCloudProps> = ({ mode, photos }) => {
  return (
    <group>
      {photos.map((url, i) => (
        <PhotoItem key={url + i} url={url} index={i} total={photos.length} mode={mode} />
      ))}
    </group>
  );
};

export default PhotoCloud;
