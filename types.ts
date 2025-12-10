import * as THREE from 'three';

export enum AppMode {
  TREE = 'TREE',
  SCATTERED = 'SCATTERED',
  PHOTO_VIEW = 'PHOTO_VIEW'
}

export interface ParticleData {
  id: string;
  type: 'sphere' | 'cube' | 'photo';
  position: THREE.Vector3; // Current rendered position
  treePosition: THREE.Vector3; // Target position in Tree mode
  scatterPosition: THREE.Vector3; // Target position in Scattered mode
  rotation: THREE.Euler;
  scale: number;
  color: string;
  textureUrl?: string; // Only for photos
}

export interface HandGestureState {
  gesture: string; // 'None' | 'Closed_Fist' | 'Open_Palm' | 'Victory'
  x: number; // Normalized 0-1
  y: number; // Normalized 0-1
  isPresent: boolean;
}

export interface GameContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  handState: HandGestureState;
  setHandState: (state: HandGestureState) => void;
  photos: string[];
  addPhotos: (urls: string[]) => void;
}
