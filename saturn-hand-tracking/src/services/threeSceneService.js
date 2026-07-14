// Three.js Simulation Scene Service Layer

import * as THREE from 'three';
import {
  RING_LAYERS,
  RING_START_INDICES,
  STAR_COUNT,
  NEBULA_COUNT,
  CAMERA_CONFIG,
  EXPLOSION_CONFIG,
  SHAKE_CONFIG,
  ROTATION_CONFIG,
  COLORS
} from '../constants/saturnConstants.js';
import { lerp } from '../utils/mathUtils.js';
import {
  generateSaturnParticleBuffers,
  generateRingsParticleBuffers,
  generateStarsParticleBuffers,
  generateNebulaParticleBuffers
} from '../utils/particleUtils.js';

export class ThreeSceneService {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // ThreeJS Meshes & Groups
    this.saturn = null;
    this.rings = null;
    this.stars = null;
    this.nebulaParticles = null;
    this.handGroup = null;
    this.handSkeleton = null;
    this.handPoints = null;

    // Immutable Original Buffers & Dispersion Velocities
    this.saturnOrigPos = null;
    this.saturnRandomDirs = null;
    this.ringOrigPos = null;
    this.ringRandomDirs = null;

    // Cached utility objects to minimize GC overhead
    this.attractionVector = new THREE.Vector3();
    this.saturnBaseColor = new THREE.Color(COLORS.saturnBase);
    this.tempColor = new THREE.Color();
  }

  /**
   * Initializes the full Three.js scene, camera, lights, meshes, and renderer.
   * @param {HTMLCanvasElement} canvasElement
   */
  init(canvasElement) {
    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(COLORS.bg);
    this.scene.fog = new THREE.FogExp2(COLORS.bg, 0.003);

    // 2. Camera setup
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(CAMERA_CONFIG.fov, width / height, CAMERA_CONFIG.near, CAMERA_CONFIG.far);
    this.camera.position.z = CAMERA_CONFIG.initialZ;
    this.scene.add(this.camera);

    // 3. Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvasElement,
      antialias: true,
      alpha: false
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    // 4. Lights
    this.scene.add(new THREE.AmbientLight(COLORS.ambientLight, 0.3));

    const pointLight = new THREE.PointLight(COLORS.pointLight, 2, 50);
    pointLight.position.set(0, 0, 0);
    this.scene.add(pointLight);

    // 5. Build meshes
    this._buildSaturn();
    this._buildRings();
    this._buildStars();
    this._buildNebula();
    this._buildHandTrackingSkeleton();

    // 6. Bind resize event listener
    window.addEventListener('resize', this.resize);
  }

  /**
   * Builds the Saturn sphere points and its inner glowing core.
   * @private
   */
  _buildSaturn() {
    const saturnGeo = new THREE.SphereGeometry(4, 80, 80);
    const saturnMat = new THREE.PointsMaterial({
      color: COLORS.saturnBase,
      size: 0.045,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.saturn = new THREE.Points(saturnGeo, saturnMat);
    this.scene.add(this.saturn);

    const sPos = this.saturn.geometry.attributes.position.array;
    const buffers = generateSaturnParticleBuffers(sPos);
    this.saturnOrigPos = buffers.origPos;
    this.saturnRandomDirs = buffers.randomDirs;

    // Saturn Glow Core
    const coreGeo = new THREE.SphereGeometry(2.2, 40, 40);
    const coreMat = new THREE.PointsMaterial({
      color: COLORS.core,
      size: 0.03,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const core = new THREE.Points(coreGeo, coreMat);
    this.saturn.add(core);
  }

  /**
   * Builds the multi-layered Saturn ring particle groupings.
   * @private
   */
  _buildRings() {
    this.rings = new THREE.Group();
    this.scene.add(this.rings);

    const buffers = generateRingsParticleBuffers(RING_LAYERS);
    this.ringOrigPos = buffers.ringOrigPos;
    this.ringRandomDirs = buffers.ringRandomDirs;

    RING_LAYERS.forEach((layer, layerIdx) => {
      const geo = new THREE.BufferGeometry();
      const pos = buffers.layersData[layerIdx];

      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const mat = new THREE.PointsMaterial({
        color: layer.color,
        size: layer.size,
        transparent: true,
        opacity: layer.opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      this.rings.add(new THREE.Points(geo, mat));
    });

    this.rings.rotation.x = Math.PI / 3.2;
  }

  /**
   * Builds the space background stars points.
   * @private
   */
  _buildStars() {
    const starGeo = new THREE.BufferGeometry();
    const buffers = generateStarsParticleBuffers(STAR_COUNT);

    starGeo.setAttribute('position', new THREE.BufferAttribute(buffers.starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(buffers.starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.stars = new THREE.Points(starGeo, starMat);
    this.scene.add(this.stars);
  }

  /**
   * Builds the space nebula dust clouds.
   * @private
   */
  _buildNebula() {
    const nebulaGeo = new THREE.BufferGeometry();
    const nebPos = generateNebulaParticleBuffers(NEBULA_COUNT);
    nebulaGeo.setAttribute('position', new THREE.BufferAttribute(nebPos, 3));

    const nebulaMat = new THREE.PointsMaterial({
      color: 0x4a2000,
      size: 8,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.nebulaParticles = new THREE.Points(nebulaGeo, nebulaMat);
    this.scene.add(this.nebulaParticles);
  }

  /**
   * Builds the 3D hand skeleton framework to show inside the simulation scene.
   * @private
   */
  _buildHandTrackingSkeleton() {
    this.handGroup = new THREE.Group();

    // Hand joint lines
    const skeletonGeo = new THREE.BufferGeometry();
    const skeletonPosArray = new Float32Array(23 * 2 * 3);
    skeletonGeo.setAttribute('position', new THREE.BufferAttribute(skeletonPosArray, 3));

    const skeletonMat = new THREE.LineBasicMaterial({
      color: COLORS.handSkeleton,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });
    this.handSkeleton = new THREE.LineSegments(skeletonGeo, skeletonMat);

    // Hand joints points
    const pointsGeo = new THREE.BufferGeometry();
    const pointsPosArray = new Float32Array(21 * 3);
    pointsGeo.setAttribute('position', new THREE.BufferAttribute(pointsPosArray, 3));

    const pointsMat = new THREE.PointsMaterial({
      color: COLORS.handPoints,
      size: 0.12,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.handPoints = new THREE.Points(pointsGeo, pointsMat);

    this.handGroup.add(this.handSkeleton);
    this.handGroup.add(this.handPoints);
    this.handGroup.position.set(0, 0, -10);

    // Add hand group relative to camera
    this.camera.add(this.handGroup);
    this.handGroup.visible = false;
  }

  /**
   * Resizes the WebGL renderer size and camera projection layout on window changes.
   */
  resize = () => {
    if (!this.camera || !this.renderer) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  /**
   * The animation tick update loop executing the simulation physics.
   * @param {number} time - Elapsed time in seconds.
   * @param {object} states - Hand gestures, camera shake settings and positions.
   */
  update(time, states) {
    const {
      isExploded,
      explosionFactor,
      shakeIntensity,
      currentHandCenter,
      lastHandPos,
      setExplosionFactor,
      setShakeIntensity
    } = states;

    if (!this.saturn || !this.rings) return;

    // 1. Lerp explosion factor
    const targetFactor = isExploded ? EXPLOSION_CONFIG.maxFactor : 0;
    const factorStep = isExploded ? EXPLOSION_CONFIG.lerpIn : EXPLOSION_CONFIG.lerpOut;
    const nextExplosionFactor = lerp(explosionFactor, targetFactor, factorStep);
    setExplosionFactor(nextExplosionFactor);

    // 2. Transform hand center tracker coordinates to world space
    if (isExploded) {
      this.attractionVector.copy(currentHandCenter);
      this.handGroup.localToWorld(this.attractionVector);
    }

    // 3. Animate Saturn points (breathe vs explode)
    const saturnAttr = this.saturn.geometry.attributes.position;
    for (let i = 0; i < saturnAttr.count; i++) {
      const i3 = i * 3;
      let x = this.saturnOrigPos[i3] + this.saturnRandomDirs[i3] * nextExplosionFactor;
      let y = this.saturnOrigPos[i3 + 1] + this.saturnRandomDirs[i3 + 1] * nextExplosionFactor;
      let z = this.saturnOrigPos[i3 + 2] + this.saturnRandomDirs[i3 + 2] * nextExplosionFactor;

      if (isExploded) {
        x = lerp(x, this.attractionVector.x, EXPLOSION_CONFIG.attractionLerpSaturn);
        y = lerp(y, this.attractionVector.y, EXPLOSION_CONFIG.attractionLerpSaturn);
        z = lerp(z, this.attractionVector.z, EXPLOSION_CONFIG.attractionLerpSaturn);
      } else {
        const breathe =
          Math.sin(time * EXPLOSION_CONFIG.breathSpeedSaturn + i * EXPLOSION_CONFIG.breathFreqSaturn) *
          EXPLOSION_CONFIG.breatheScaleSaturn;
        x += this.saturnOrigPos[i3] * breathe;
        y += this.saturnOrigPos[i3 + 1] * breathe;
        z += this.saturnOrigPos[i3 + 2] * breathe;
      }

      saturnAttr.array[i3] = x;
      saturnAttr.array[i3 + 1] = y;
      saturnAttr.array[i3 + 2] = z;
    }
    saturnAttr.needsUpdate = true;

    // 4. Animate Ring points
    this.rings.children.forEach((ringMesh, layerIdx) => {
      const rAttr = ringMesh.geometry.attributes.position;
      const startIdx = RING_START_INDICES[layerIdx];

      for (let i = 0; i < rAttr.count; i++) {
        const gi = (startIdx + i) * 3;
        let x = this.ringOrigPos[gi] + this.ringRandomDirs[gi] * nextExplosionFactor;
        let y = this.ringOrigPos[gi + 1] + this.ringRandomDirs[gi + 1] * nextExplosionFactor;
        let z = this.ringOrigPos[gi + 2] + this.ringRandomDirs[gi + 2] * nextExplosionFactor;

        if (isExploded) {
          x = lerp(x, this.attractionVector.x, EXPLOSION_CONFIG.attractionLerpRing);
          y = lerp(y, this.attractionVector.y, EXPLOSION_CONFIG.attractionLerpRing);
          z = lerp(z, this.attractionVector.z, EXPLOSION_CONFIG.attractionLerpRing);
        } else {
          const breathe =
            Math.sin(time * EXPLOSION_CONFIG.breathSpeedRing + i * EXPLOSION_CONFIG.breathFreqRing + layerIdx) *
            EXPLOSION_CONFIG.breatheScaleRing;
          x += this.ringOrigPos[gi] * breathe;
          y += this.ringOrigPos[gi + 1] * breathe;
          z += this.ringOrigPos[gi + 2] * breathe;
        }

        rAttr.array[i * 3] = x;
        rAttr.array[i * 3 + 1] = y;
        rAttr.array[i * 3 + 2] = z;
      }
      rAttr.needsUpdate = true;
    });

    // 5. Camera Shake
    if (shakeIntensity > SHAKE_CONFIG.threshold) {
      this.camera.position.x += (Math.random() - 0.5) * shakeIntensity;
      this.camera.position.y += (Math.random() - 0.5) * shakeIntensity;
      setShakeIntensity(shakeIntensity * SHAKE_CONFIG.decay);
    } else {
      this.camera.position.x = lerp(this.camera.position.x, 0, SHAKE_CONFIG.returnLerp);
      this.camera.position.y = lerp(this.camera.position.y, 0, SHAKE_CONFIG.returnLerp);
    }

    // 6. Idle rotations (when no hand interaction occurs)
    if (!isExploded && !lastHandPos) {
      this.saturn.rotation.y += ROTATION_CONFIG.idleSaturnY;
      this.rings.rotation.z += ROTATION_CONFIG.idleRingsZ;
    }

    if (this.stars) this.stars.rotation.y += ROTATION_CONFIG.idleStarsY;
    if (this.nebulaParticles) this.nebulaParticles.rotation.y += ROTATION_CONFIG.idleNebulaY;

    // 7. Dynamic Hue/Saturation color adjustment for Saturn PointMaterial
    if (this.saturn.material) {
      const hueShift = Math.sin(time * 0.3) * 0.02;
      this.tempColor.copy(this.saturnBaseColor).offsetHSL(hueShift, 0, Math.sin(time * 0.5) * 0.05);
      this.saturn.material.color.copy(this.tempColor);
    }

    // 8. Render
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Disposes of geometries, materials, and renderer setups to prevent memory leaks.
   */
  destroy() {
    window.removeEventListener('resize', this.resize);

    const disposeNode = (node) => {
      if (node.geometry) {
        node.geometry.dispose();
      }
      if (node.material) {
        if (Array.isArray(node.material)) {
          node.material.forEach((mat) => mat.dispose());
        } else {
          node.material.dispose();
        }
      }
    };

    if (this.scene) {
      this.scene.traverse((node) => {
        if (node.isMesh || node.isPoints || node.isLineSegments || node.isLine) {
          disposeNode(node);
        }
      });
      this.scene = null;
    }

    if (this.renderer) {
      try {
        this.renderer.dispose();
      } catch (e) {
        console.error('Error disposing WebGLRenderer:', e);
      }
      this.renderer = null;
    }

    this.camera = null;
    this.saturn = null;
    this.rings = null;
    this.stars = null;
    this.nebulaParticles = null;
    this.handGroup = null;
    this.handSkeleton = null;
    this.handPoints = null;
    this.saturnOrigPos = null;
    this.saturnRandomDirs = null;
    this.ringOrigPos = null;
    this.ringRandomDirs = null;
  }
}
