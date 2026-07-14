// Hook: useAnimationLoop

import { useEffect, useRef } from 'react';

/**
 * Custom React hook to manage a single requestAnimationFrame loop.
 * Passes the latest clock elapsed time and simulation state values to the Three.js scene service.
 * @param {React.RefObject<ThreeSceneService>} threeSceneRef - Ref pointing to the active scene service.
 * @param {React.RefObject<object>} statesRef - Ref containing the current simulation states.
 */
export function useAnimationLoop(threeSceneRef, statesRef) {
  const requestRef = useRef(null);
  const clockRef = useRef(null);

  useEffect(() => {
    const animate = () => {
      const service = threeSceneRef.current;
      if (service) {
        if (!clockRef.current && service.clock) {
          clockRef.current = service.clock;
          clockRef.current.start();
        }
        const time = clockRef.current ? clockRef.current.getElapsedTime() : 0;
        service.update(time, statesRef.current);
      }
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [threeSceneRef, statesRef]);
}
