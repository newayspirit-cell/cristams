import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AppMode } from '../types';
import { calculateTreePosition, calculateScatterPosition, randomColor } from '../utils/geometry';

interface OrnamentsProps {
  mode: AppMode;
  count: number;
}

const PALETTE = [
  '#FFD700', // Gold
  '#D4AF37', // Metallic Gold
  '#AA0000', // Christmas Red
  '#004400', // Dark Green
  '#FFFFFF', // White (Snow/Candy)
];

const Ornaments: React.FC<OrnamentsProps> = ({ mode, count }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // Initialize particle data
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const treePos = calculateTreePosition(i, count, 20, 7);
      const scatterPos = calculateScatterPosition(25);
      const scale = Math.random() * 0.3 + 0.1;
      
      temp.push({
        id: i,
        treePos,
        scatterPos,
        scale,
        color: new THREE.Color(randomColor(PALETTE)),
        currentPos: treePos.clone(), // Start at tree
        rotationSpeed: Math.random() * 0.02
      });
    }
    return temp;
  }, [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const t = state.clock.getElapsedTime();
    const lerpFactor = 0.05; // Smooth transition speed

    particles.forEach((particle, i) => {
      // Determine target position based on mode
      let target = particle.treePos;
      if (mode === AppMode.SCATTERED || mode === AppMode.PHOTO_VIEW) {
        target = particle.scatterPos;
      }

      // Interpolate current position
      particle.currentPos.lerp(target, lerpFactor);

      // Add floating animation in scattered mode
      if (mode !== AppMode.TREE) {
        particle.currentPos.y += Math.sin(t + i) * 0.01;
      }

      // Update dummy object
      dummy.position.copy(particle.currentPos);
      
      // Rotate particles slightly
      dummy.rotation.x += particle.rotationSpeed;
      dummy.rotation.y += particle.rotationSpeed;
      
      dummy.scale.setScalar(particle.scale);
      dummy.updateMatrix();

      meshRef.current!.setMatrixAt(i, dummy.matrix);
      meshRef.current!.setColorAt(i, particle.color);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow receiveShadow>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial 
        roughness={0.2} 
        metalness={0.8} 
        emissive="#111111"
        emissiveIntensity={0.2}
      />
    </instancedMesh>
  );
};

export default Ornaments;
