// Hook: useThreeScene

import { useEffect, useRef } from 'react';
import { ThreeSceneService } from '../services/threeSceneService.js';

/**
 * Custom React hook to orchestrate the lifecycle of the Three.js particle scene.
 * @param {React.RefObject<HTMLCanvasElement>} canvasRef
 * @returns {React.RefObject<ThreeSceneService>}
 */
export function useThreeScene(canvasRef) {
  const serviceRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const service = new ThreeSceneService();
    service.init(canvasRef.current);
    serviceRef.current = service;

    return () => {
      if (serviceRef.current) {
        serviceRef.current.destroy();
        serviceRef.current = null;
      }
    };
  }, [canvasRef]);

  return serviceRef;
}
