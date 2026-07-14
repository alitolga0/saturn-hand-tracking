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

    const handleError = (err) => {
      setIsLoading(false);
      console.error('MediaPipe initialization error:', err);

      if (!window.isSecureContext) {
        setError('Hata: Kamera erişimi güvenli bağlantı (HTTPS) veya localhost gerektirir. Lütfen siteye HTTPS ile eriştiğinizden emin olun.');
        return;
      }

      if (!window.Hands || !window.Camera) {
        setError('Hata: MediaPipe kütüphaneleri yüklenemedi. Lütfen internet bağlantınızı kontrol edip sayfayı yenileyin.');
        return;
      }

      if (err && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')) {
        setError('Hata: Kamera erişim izni reddedildi. Lütfen tarayıcı ayarlarından kameraya izin verin ve sayfayı yenileyin.');
        return;
      }

      if (err && (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError')) {
        setError('Hata: Kamera cihazı bulunamadı. Lütfen cihazınıza bir kamera bağlı olduğundan emin olun.');
        return;
      }

      setError(`Hata: Kameraya erişim veya takip sistemi yüklenemedi (${err?.message || 'Bilinmeyen hata'}).`);
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
