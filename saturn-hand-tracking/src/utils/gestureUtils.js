// Gesture Detection Utilities

import { TIPS, JOINTS } from '../constants/saturnConstants.js';
import { calculateDistance2D } from './mathUtils.js';

/**
 * Detects if the hand posture is a fist (at least 3 fingers folded down).
 * @param {Array<{x: number, y: number, z: number}>} landmarks
 * @returns {boolean}
 */
export function isHandFist(landmarks) {
  if (!landmarks || landmarks.length < 21) return false;
  let closedCount = 0;
  for (let i = 0; i < 4; i++) {
    if (landmarks[TIPS[i]].y > landmarks[JOINTS[i]].y) {
      closedCount++;
    }
  }
  return closedCount >= 3;
}

/**
 * Calculates the pinch distance between the thumb tip (landmark 4) and index finger tip (landmark 8).
 * @param {Array<{x: number, y: number, z: number}>} landmarks
 * @returns {number}
 */
export function getPinchDistance(landmarks) {
  if (!landmarks || landmarks.length < 9) return 0;
  return calculateDistance2D(landmarks[4], landmarks[8]);
}

/**
 * Example of gesture extensibility. Returns the type of gesture active on hand.
 * @param {Array<{x: number, y: number, z: number}>} landmarks
 * @returns {'fist' | 'open' | 'unknown'}
 */
export function getHandGesture(landmarks) {
  if (isHandFist(landmarks)) {
    return 'fist';
  }
  return 'open';
}
