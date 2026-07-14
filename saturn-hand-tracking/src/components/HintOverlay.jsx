// Component: HintOverlay

import { useEffect, useState } from 'react';

/**
 * HintOverlay component to display hints about gestures on screen, then fade out smoothly.
 */
export default function HintOverlay() {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpacity(0);
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div id="hint-overlay" style={{ opacity, transition: 'opacity 1.5s ease' }}>
      Yumruk yap — döndür &nbsp;|&nbsp; Açık el — patlat &nbsp;|&nbsp; Başparmak+işaret — yakınlaştır
    </div>
  );
}
