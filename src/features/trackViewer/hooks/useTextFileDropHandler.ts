import { useCallback } from 'react';
import { FileRejection } from 'react-dropzone';

/** Keys into `TrackViewerMessages` for file-drop failures. */
export type TextFileDropError = 'invalidFormat' | 'onlyOne' | 'loadingError';

export function useTextFileDropHandler(
  onDrop: (text: string, file: File) => void,
  onLoadError: (messageKey: TextFileDropError) => void,
): (acceptedFiles: File[], fileRejections?: FileRejection[]) => void {
  return useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[] = []) => {
      if (fileRejections.length) {
        onLoadError('invalidFormat');

        return;
      }

      if (acceptedFiles.length !== 1) {
        onLoadError('onlyOne');

        return;
      }

      const file = acceptedFiles[0]!;

      const reader = new FileReader();

      reader.readAsText(file, 'UTF-8');

      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onDrop(reader.result, file);
        } else {
          onLoadError('loadingError');
        }
      };

      reader.onerror = () => {
        onLoadError('loadingError');

        reader.abort();
      };
    },
    [onDrop, onLoadError],
  );
}
