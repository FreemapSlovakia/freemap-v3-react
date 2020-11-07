import { useCallback } from 'react';
import { Translator } from 'fm3/l10nInjector';
import { FileRejection } from 'react-dropzone';

export function useGpxDropHandler(
  onDrop: (gpx: string) => void,
  onLoadError: (msg: string) => void,
  t: Translator,
): (acceptedFiles: File[], fileRejections?: FileRejection[]) => void {
  return useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[] = []) => {
      if (fileRejections.length) {
        onLoadError(t('trackViewer.wrongFormat'));
        return;
      }

      if (acceptedFiles.length !== 1) {
        onLoadError(t('trackViewer.onlyOne'));
        return;
      }

      const reader = new FileReader();
      reader.readAsText(acceptedFiles[0], 'UTF-8');
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onDrop(reader.result);
        } else {
          onLoadError(t('trackViewer.loadingError'));
        }
      };

      reader.onerror = () => {
        onLoadError(t('trackViewer.loadingError'));
        reader.abort();
      };
    },
    [onDrop, onLoadError, t],
  );
}
