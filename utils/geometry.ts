import * as THREE from 'three';

// Generate a spiral cone shape for the tree
export const calculateTreePosition = (index: number, total: number, height: number = 15, radius: number = 6): THREE.Vector3 => {
  const y = (index / total) * height - (height / 2); // Bottom to top
  const progress = (y + height / 2) / height; // 0 to 1
  const currentRadius = radius * (1 - progress); 
  const angle = index * 0.5; // Spiral tightness

  const x = Math.cos(angle) * currentRadius;
  const z = Math.sin(angle) * currentRadius;

  return new THREE.Vector3(x, y, z);
};

// Generate a random position inside a sphere volume
export const calculateScatterPosition = (radius: number = 15): THREE.Vector3 => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;

  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.sin(phi) * Math.sin(theta);
  const z = r * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
};

export const randomColor = (palette: string[]) => {
  return palette[Math.floor(Math.random() * palette.length)];
};
