// Saturn Simulation Constants

export const TIPS = [8, 12, 16, 20];
export const JOINTS = [6, 10, 14, 18];

export const RING_START_INDICES = [0, 6000, 14000, 18000];

// Themed Sapphire Blue Ring Layers
export const RING_LAYERS = [
  { count: 6000, rMin: 5.8, rMax: 7.0, color: 0x3d6bff, size: 0.02, opacity: 0.55, ySpread: 0.08 }, // Inner ring: #3D6BFF
  { count: 8000, rMin: 7.1, rMax: 8.5, color: 0x5b8cff, size: 0.03, opacity: 0.75, ySpread: 0.12 }, // Middle ring: #5B8CFF
  { count: 4000, rMin: 8.6, rMax: 9.2, color: 0x78a8ff, size: 0.025, opacity: 0.45, ySpread: 0.06 }, // Middle-outer ring
  { count: 3000, rMin: 9.4, rMax: 10.2, color: 0x9cc8ff, size: 0.02, opacity: 0.4, ySpread: 0.1 } // Outer ring: #9CC8FF
];

export const HAND_CONNECTIONS = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [5, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  [9, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [13, 17],
  [0, 17],
  [17, 18],
  [18, 19],
  [19, 20]
];

export const STAR_COUNT = 6000;
export const NEBULA_COUNT = 800;

export const CAMERA_CONFIG = {
  fov: 75,
  near: 0.1,
  far: 2000,
  initialZ: 12,
  minZ: 5,
  maxZ: 60,
  baseZoom: 35,
  zoomScale: 110,
  lerpSpeed: 0.1
};

export const EXPLOSION_CONFIG = {
  maxFactor: 8.0,
  lerpIn: 0.04,
  lerpOut: 0.18,
  attractionLerpSaturn: 0.08,
  attractionLerpRing: 0.06,
  breathSpeedSaturn: 0.8,
  breathSpeedRing: 0.6,
  breathFreqSaturn: 0.01,
  breathFreqRing: 0.005,
  breatheScaleSaturn: 0.015,
  breatheScaleRing: 0.008
};

export const SHAKE_CONFIG = {
  fistReleaseShake: 0.15,
  explosionStartShake: 0.3,
  decay: 0.9,
  threshold: 0.02,
  returnLerp: 0.1
};

export const ROTATION_CONFIG = {
  idleSaturnY: 0.003,
  idleRingsZ: 0.0015,
  idleStarsY: 0.00005,
  idleNebulaY: -0.00003,
  interactionMultiplier: 7
};

// Global colors definition matching premium sapphire render specs
export const COLORS = {
  bg: 0x030611, // Premium deep-space black with a subtle blue tint
  ambientLight: 0x1c2b4d, // Soft cool blue
  pointLight: 0x7db5ff, // Point light: #7DB5FF
  saturnBase: 0x4a7dff, // Main Saturn particles: #4A7DFF
  core: 0xeaf6ff, // Core: #EAF6FF (almost white with a slight blue tint)
  handSkeleton: 0x4a7dff, // Hand tracker matching Saturn base
  handPoints: 0x78a8ff // Hand joints matching highlight particles
};
