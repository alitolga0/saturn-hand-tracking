// Mathematical Helpers for Saturn Simulation

/**
 * Linearly interpolates between two numbers.
 * @param {number} start
 * @param {number} end
 * @param {number} amt
 * @returns {number}
 */
export function lerp(start, end, amt) {
  return start + (end - start) * amt;
}

/**
 * Calculates Euclidean distance between two 2D points (x, y).
 * @param {{x: number, y: number}} p1
 * @param {{x: number, y: number}} p2
 * @returns {number}
 */
export function calculateDistance2D(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculates the target camera Z depth based on hand pinch distance.
 * @param {number} distance - Distance between thumb tip and index tip.
 * @param {number} baseZoom - Base offset for zoom calculation (default 35).
 * @param {number} scale - Scaling factor for zoom sensitivity (default 110).
 * @returns {number}
 */
export function calculateCameraZoomZ(distance, baseZoom = 35, scale = 110) {
  return baseZoom - distance * scale;
}

/**
 * Clamps a number between a minimum and maximum value.
 * @param {number} val
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(val, min, max) {
  return Math.max(min, Math.min(val, max));
}
