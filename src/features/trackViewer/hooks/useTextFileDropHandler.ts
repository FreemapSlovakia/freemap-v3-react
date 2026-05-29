import { useCallback } from 'react';
import { FileRejection } from 'react-dropzone';
import { Messages } from '@/translations/messagesInterface.js';

export function useTextFileDropHandler(
  onDrop: (text: string, file: File) => void,
  onLoadError: (msg: string) => void,
  m?: Messages,
): (acceptedFiles: File[], fileRejections?: FileRejection[]) => void {
  return useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[] = []) => {
      if (fileRejections.length) {
        onLoadError(m?.trackViewer.invalidFormat ?? 'invalid format');

        return;
      }

      if (acceptedFiles.length !== 1) {
        onLoadError(m?.trackViewer.onlyOne ?? 'many files');

        return;
      }

      const file = acceptedFiles[0];

      const reader = new FileReader();

      reader.readAsText(file, 'UTF-8');

      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onDrop(reader.result, file);
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
