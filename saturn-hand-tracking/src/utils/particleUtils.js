// Particle Generation Utilities for Saturn Simulation

/**
 * Generates original positions and random dispersion directions for Saturn particles.
 * @param {Float32Array} currentPos - The current vertices of the Saturn sphere.
 * @returns {{origPos: Float32Array, randomDirs: Float32Array}}
 */
export function generateSaturnParticleBuffers(currentPos) {
  const count = currentPos.length;
  const origPos = new Float32Array(count);
  const randomDirs = new Float32Array(count);

  for (let i = 0; i < count; i += 3) {
    origPos[i] = currentPos[i];
    origPos[i + 1] = currentPos[i + 1];
    origPos[i + 2] = currentPos[i + 2];

    randomDirs[i] = (Math.random() - 0.5) * 3.5;
    randomDirs[i + 1] = (Math.random() - 0.5) * 3.5;
    randomDirs[i + 2] = (Math.random() - 0.5) * 3.5;
  }

  return { origPos, randomDirs };
}

/**
 * Generates original positions, random dispersion directions, and layer-by-layer positions for the Ring system.
 * @param {Array<{count: number, rMin: number, rMax: number, ySpread: number}>} layersConfig
 * @returns {{ringOrigPos: Float32Array, ringRandomDirs: Float32Array, layersData: Array<Float32Array>}}
 */
export function generateRingsParticleBuffers(layersConfig) {
  const totalCount = layersConfig.reduce((acc, layer) => acc + layer.count, 0);
  const ringOrigPos = new Float32Array(totalCount * 3);
  const ringRandomDirs = new Float32Array(totalCount * 3);
  const layersData = [];

  let ringIdx = 0;

  layersConfig.forEach((layer) => {
    const pos = new Float32Array(layer.count * 3);
    for (let i = 0; i < layer.count; i++) {
      const r = layer.rMin + Math.random() * (layer.rMax - layer.rMin);
      const a = Math.random() * Math.PI * 2;
      const x = Math.cos(a) * r;
      const y = (Math.random() - 0.5) * layer.ySpread;
      const z = Math.sin(a) * r;

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      ringOrigPos[ringIdx] = x;
      ringOrigPos[ringIdx + 1] = y;
      ringOrigPos[ringIdx + 2] = z;

      ringRandomDirs[ringIdx] = (Math.random() - 0.5) * 2.5;
      ringRandomDirs[ringIdx + 1] = (Math.random() - 0.5) * 2.5;
      ringRandomDirs[ringIdx + 2] = (Math.random() - 0.5) * 2.5;

      ringIdx += 3;
    }
    layersData.push(pos);
  });

  return { ringOrigPos, ringRandomDirs, layersData };
}

/**
 * Generates positions and colors for background Star particles.
 * @param {number} starCount
 * @returns {{starPos: Float32Array, starColors: Float32Array}}
 */
export function generateStarsParticleBuffers(starCount) {
  const starPos = new Float32Array(starCount * 3);
  const starColors = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    starPos[i * 3] = (Math.random() - 0.5) * 1200;
    starPos[i * 3 + 1] = (Math.random() - 0.5) * 1200;
    starPos[i * 3 + 2] = (Math.random() - 0.5) * 1200;

    const temp = Math.random();
    if (temp < 0.6) {
      starColors[i * 3] = 1;
      starColors[i * 3 + 1] = 1;
      starColors[i * 3 + 2] = 1;
    } else if (temp < 0.8) {
      starColors[i * 3] = 0.7;
      starColors[i * 3 + 1] = 0.8;
      starColors[i * 3 + 2] = 1;
    } else {
      starColors[i * 3] = 1;
      starColors[i * 3 + 1] = 0.95;
      starColors[i * 3 + 2] = 0.7;
    }
  }

  return { starPos, starColors };
}

/**
 * Generates positions for background Nebula particles.
 * @param {number} nebulaCount
 * @returns {Float32Array}
 */
export function generateNebulaParticleBuffers(nebulaCount) {
  const nebPos = new Float32Array(nebulaCount * 3);

  for (let i = 0; i < nebulaCount; i++) {
    nebPos[i * 3] = (Math.random() - 0.5) * 400;
    nebPos[i * 3 + 1] = (Math.random() - 0.5) * 400;
    nebPos[i * 3 + 2] = -200 - Math.random() * 300;
  }

  return nebPos;
}
