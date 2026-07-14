// MediaPipe Hands Tracking Service Layer with StrictMode Race-Condition Protection

import '@mediapipe/hands';
import '@mediapipe/camera_utils';

const Hands = window.Hands;
const Camera = window.Camera;

export class MediaPipeService {
  constructor() {
    this.hands = null;
    this.camera = null;
    this.stream = null;
    this.animationFrameId = null;
    this.videoElement = null;
    this.isDestroyed = false;
  }

  /**
   * Initializes MediaPipe Hands and starts the camera stream.
   * @param {HTMLVideoElement} videoElement
   * @param {Function} onResultsCallback - Callback invoked when tracking results are ready.
   * @param {Function} onErrorCallback - Callback invoked if initialization or camera permission fails.
   */
  async initialize(videoElement, onResultsCallback, onErrorCallback) {
    this.isDestroyed = false;
    this.videoElement = videoElement;

    try {
      const HandsConstructor = Hands || window.Hands;
      if (!HandsConstructor) {
        throw new Error('MediaPipe Hands library is not loaded.');
      }

      this.hands = new HandsConstructor({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });

      this.hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7
      });

      this.hands.onResults((results) => {
        if (this.isDestroyed) return;
        if (onResultsCallback) {
          onResultsCallback(results);
        }
      });

      if (this.isDestroyed) {
        this.destroy();
        return;
      }

      // Start Camera Capture
      const CameraConstructor = Camera || window.Camera;
      if (CameraConstructor) {
        this.camera = new CameraConstructor(videoElement, {
          onFrame: async () => {
            if (this.isDestroyed || !this.hands) return;
            try {
              await this.hands.send({ image: videoElement });
            } catch (e) {
              console.error('Error sending frame to MediaPipe:', e);
            }
          },
          width: 640,
          height: 480
        });

        await this.camera.start();

        if (this.isDestroyed) {
          this.destroy();
          return;
        }
      } else {
        // Fallback: use native getUserMedia and requestAnimationFrame loop
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 }
        });

        if (this.isDestroyed) {
          this.destroy();
          return;
        }

        videoElement.srcObject = this.stream;

        await new Promise((resolve, reject) => {
          videoElement.onloadedmetadata = () => {
            if (this.isDestroyed) {
              reject(new Error('Destroyed during metadata load'));
              return;
            }
            videoElement.play().then(resolve).catch(reject);
          };
        });

        if (this.isDestroyed) {
          this.destroy();
          return;
        }

        const processFrame = async () => {
          if (this.isDestroyed || !this.hands) return;
          try {
            await this.hands.send({ image: videoElement });
          } catch (e) {
            console.error('Error sending frame to MediaPipe in fallback:', e);
          }
          this.animationFrameId = requestAnimationFrame(processFrame);
        };
        processFrame();
      }
    } catch (err) {
      if (this.isDestroyed) {
        this.destroy();
        return;
      }
      if (onErrorCallback) {
        onErrorCallback(err);
      } else {
        throw err;
      }
    }
  }

  /**
   * Cleans up all resources (camera stream, animation frame requests, and MediaPipe instance).
   */
  destroy() {
    this.isDestroyed = true;

    if (this.camera) {
      try {
        this.camera.stop();
      } catch (e) {
        console.error('Error stopping Camera utility:', e);
      }
      this.camera = null;
    }

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.stream) {
      try {
        this.stream.getTracks().forEach((track) => track.stop());
      } catch (e) {
        console.error('Error stopping media stream tracks:', e);
      }
      this.stream = null;
    }

    // Force release tracks bound to the HTMLVideoElement
    if (this.videoElement && this.videoElement.srcObject) {
      try {
        const activeStream = this.videoElement.srcObject;
        if (activeStream && typeof activeStream.getTracks === 'function') {
          activeStream.getTracks().forEach((track) => track.stop());
        }
        this.videoElement.srcObject = null;
      } catch (e) {
        console.error('Error force stopping video element stream tracks:', e);
      }
    }
    this.videoElement = null;

    if (this.hands) {
      try {
        this.hands.close();
      } catch (e) {
        console.error('Error closing MediaPipe hands instance:', e);
      }
      this.hands = null;
    }
  }
}
