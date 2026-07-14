// Component: LoadingOverlay

/**
 * LoadingOverlay component to render loading indicators or errors when accessing the webcam.
 * @param {object} props
 * @param {boolean} props.isLoading
 * @param {string|null} props.error
 */
export default function LoadingOverlay({ isLoading, error }) {
  if (!isLoading && !error) return null;

  return (
    <div id="loading-msg" style={error ? { color: '#ff4444' } : undefined}>
      {error ? (
        error
      ) : (
        <>
          Saturn Yükleniyor...
          <br />
          <small>Kameraya izin verin</small>
        </>
      )}
    </div>
  );
}
