import { Messages } from 'fm3/translations/messagesInterface';
import { useCallback } from 'react';
import { FileRejection } from 'react-dropzone';

export function useGpxDropHandler(
  onDrop: (gpx: string) => void,
  onLoadError: (msg: string) => void,
  m?: Messages,
): (acceptedFiles: File[], fileRejections?: FileRejection[]) => void {
  return useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[] = []) => {
      if (fileRejections.length) {
        onLoadError(m?.trackViewer.wrongFormat ?? 'wrong format');

        return;
      }

      if (acceptedFiles.length !== 1) {
        onLoadError(m?.trackViewer.onlyOne ?? 'many files');

        return;
      }

      const reader = new FileReader();

      reader.readAsText(acceptedFiles[0], 'UTF-8');

      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onDrop(reader.result);
        } else {
          onLoadError(m?.trackViewer.loadingError ?? 'loading error');
        }
      };

      reader.onerror = () => {
        onLoadError(m?.trackViewer.loadingError ?? 'loading error');

        reader.abort();
      };
    },
    [onDrop, onLoadError, m],
  );
}
