// Hook: useMediaPipeHands

import { useEffect, useRef, useState } from 'react';
import { MediaPipeService } from '../services/mediapipeService.js';

/**
 * Custom React hook to orchestrate the MediaPipe Hands tracking lifecycle.
 * @param {React.RefObject<HTMLVideoElement>} videoRef
 * @param {Function} onResults - Callback invoked on each frame tracking result.
 * @returns {{isLoading: boolean, error: string|null}}
 */
export function useMediaPipeHands(videoRef, onResults) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const serviceRef = useRef(null);

  // Use a stable ref for the callback to prevent effect re-runs when components pass inline arrow functions
  const onResultsRef = useRef(onResults);
  useEffect(() => {
    onResultsRef.current = onResults;
  }, [onResults]);

  useEffect(() => {
    if (!videoRef.current) return;

    const service = new MediaPipeService();
    serviceRef.current = service;

    const handleResults = (results) => {
      setIsLoading(false);
      if (onResultsRef.current) {
        onResultsRef.current(results);
      }
    };

    const handleError = () => {
      setIsLoading(false);
      setError('Hata: Kameraya erişim veya takip sistemi yüklenemedi.');
    };

    service.initialize(videoRef.current, handleResults, handleError);

    return () => {
      if (serviceRef.current) {
        serviceRef.current.destroy();
        serviceRef.current = null;
      }
    };
  }, [videoRef]);

  return { isLoading, error };
}
