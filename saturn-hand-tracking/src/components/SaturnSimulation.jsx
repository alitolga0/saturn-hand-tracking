// Component: SaturnSimulation

import { useCallback, useRef } from 'react';
import * as THREE from 'three';
import { useThreeScene } from '../hooks/useThreeScene';
import { useMediaPipeHands } from '../hooks/useMediaPipeHands';
import { useAnimationLoop } from '../hooks/useAnimationLoop';
import LoadingOverlay from './LoadingOverlay';
import HintOverlay from './HintOverlay';
import { isHandFist, getPinchDistance } from '../utils/gestureUtils';
import { lerp, clamp, calculateCameraZoomZ } from '../utils/mathUtils';
import { CAMERA_CONFIG, SHAKE_CONFIG, ROTATION_CONFIG, HAND_CONNECTIONS } from '../constants/saturnConstants';

export default function SaturnSimulation() {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);

  // Core simulation states stored in a ref to bypass React rendering loop for WebGL performance (60 FPS)
  const simulationState = useRef({
    isExploded: false,
    explosionFactor: 0,
    shakeIntensity: 0,
    currentHandCenter: new THREE.Vector3(0, 0, 0),
    lastHandPos: null
  });

  // Access underlying ThreeSceneService instance
  const threeSceneRef = useThreeScene(canvasRef);

  // Setup callbacks to mutatively update the simulation states and particle buffers
  const onResults = useCallback(
    (results) => {
      const service = threeSceneRef.current;
      if (!service) return;

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];

        // Update raw tracking coordinates in local camera space
        simulationState.current.currentHandCenter.set((1 - landmarks[9].x - 0.5) * 15, -(landmarks[9].y - 0.5) * 10, 0);

        // Write landmark points directly to the pre-allocated ThreeJS BufferAttribute
        if (service.handPoints) {
          const pointsArray = service.handPoints.geometry.attributes.position.array;
          for (let i = 0; i < landmarks.length; i++) {
            const lm = landmarks[i];
            const idx = i * 3;
            pointsArray[idx] = (1 - lm.x - 0.5) * 15;
            pointsArray[idx + 1] = -(lm.y - 0.5) * 10;
            pointsArray[idx + 2] = 0;
          }
          service.handPoints.geometry.attributes.position.needsUpdate = true;
        }

        // Write skeleton connection line points
        if (service.handSkeleton) {
          const skeletonArray = service.handSkeleton.geometry.attributes.position.array;
          const pointsArray = service.handPoints.geometry.attributes.position.array;
          let lineIdx = 0;
          for (let i = 0; i < HAND_CONNECTIONS.length; i++) {
            const [start, end] = HAND_CONNECTIONS[i];
            const sIdx = start * 3;
            const eIdx = end * 3;

            skeletonArray[lineIdx++] = pointsArray[sIdx];
            skeletonArray[lineIdx++] = pointsArray[sIdx + 1];
            skeletonArray[lineIdx++] = pointsArray[sIdx + 2];

            skeletonArray[lineIdx++] = pointsArray[eIdx];
            skeletonArray[lineIdx++] = pointsArray[eIdx + 1];
            skeletonArray[lineIdx++] = pointsArray[eIdx + 2];
          }
          service.handSkeleton.geometry.attributes.position.needsUpdate = true;
        }

        // Extract postures
        const isFist = isHandFist(landmarks);
        const pinchDist = getPinchDistance(landmarks);

        // Camera depth zoom (Thumb + Index Tip distance)
        const targetZ = calculateCameraZoomZ(pinchDist, CAMERA_CONFIG.baseZoom, CAMERA_CONFIG.zoomScale);
        const clampedZ = clamp(targetZ, CAMERA_CONFIG.minZ, CAMERA_CONFIG.maxZ);
        service.camera.position.z = lerp(service.camera.position.z, clampedZ, CAMERA_CONFIG.lerpSpeed);

        if (isFist) {
          // Trigger a tiny camera shake on fist squeeze transition
          if (simulationState.current.isExploded) {
            simulationState.current.shakeIntensity = SHAKE_CONFIG.fistReleaseShake;
          }
          simulationState.current.isExploded = false;

          const indexTip = landmarks[8];
          const prevHandPos = simulationState.current.lastHandPos;

          if (prevHandPos) {
            const dx = 1 - indexTip.x - (1 - prevHandPos.x);
            const dy = indexTip.y - prevHandPos.y;

            service.saturn.rotation.y += dx * ROTATION_CONFIG.interactionMultiplier;
            service.saturn.rotation.x += dy * ROTATION_CONFIG.interactionMultiplier;
            service.rings.rotation.y += dx * ROTATION_CONFIG.interactionMultiplier;
            service.rings.rotation.x += dy * ROTATION_CONFIG.interactionMultiplier;
          }
          simulationState.current.lastHandPos = indexTip;
        } else {
          // Open Hand -> Trigger particle explosion
          if (!simulationState.current.isExploded) {
            simulationState.current.shakeIntensity = SHAKE_CONFIG.explosionStartShake;
          }
          simulationState.current.isExploded = true;
          simulationState.current.lastHandPos = null;
        }

        if (service.handGroup) {
          service.handGroup.visible = true;
        }
      } else {
        // Hide hand skeletal meshes if no hand is detected
        if (service.handGroup) {
          service.handGroup.visible = false;
        }
        simulationState.current.lastHandPos = null;
        simulationState.current.isExploded = false;
      }
    },
    [threeSceneRef]
  );

  // Hook up MediaPipe hands tracking stream
  const { isLoading, error } = useMediaPipeHands(videoRef, onResults);

  // Hook up the animation loop service updates.
  // Pass setters in state bindings to allow ThreeJS scene service to read and write variables directly
  const stateBindings = useRef({
    get isExploded() {
      return simulationState.current.isExploded;
    },
    get explosionFactor() {
      return simulationState.current.explosionFactor;
    },
    get shakeIntensity() {
      return simulationState.current.shakeIntensity;
    },
    get currentHandCenter() {
      return simulationState.current.currentHandCenter;
    },
    get lastHandPos() {
      return simulationState.current.lastHandPos;
    },
    setExplosionFactor(val) {
      simulationState.current.explosionFactor = val;
    },
    setShakeIntensity(val) {
      simulationState.current.shakeIntensity = val;
    }
  });

  useAnimationLoop(threeSceneRef, stateBindings);

  return (
    <>
      <LoadingOverlay isLoading={isLoading} error={error} />
      <HintOverlay />
      <video id="input-video" ref={videoRef} playsInline></video>
      <canvas ref={canvasRef} style={{ display: 'block', position: 'absolute', top: 0, left: 0 }}></canvas>
    </>
  );
}
