import { useAppSettings } from '../../context/useAppSettings';
import './StorageWarningBanner.css';

export function StorageWarningBanner() {
  const { storageWarning, clearStorageWarning } = useAppSettings();

  if (!storageWarning) {
    return null;
  }

  return (
    <div className="storage-warning" role="alert">
      <p className="storage-warning__message">{storageWarning}</p>
      <button
        type="button"
        className="storage-warning__dismiss"
        onClick={clearStorageWarning}
      >
        Dismiss
      </button>
    </div>
  );
}

