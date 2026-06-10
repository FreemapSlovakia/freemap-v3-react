import { useCallback } from 'react';
import { FileRejection } from 'react-dropzone';
import { TrackViewerMessages } from '../translations/TrackViewerMessages.js';

export function useTextFileDropHandler(
  onDrop: (text: string, file: File) => void,
  onLoadError: (msg: string) => void,
  tvm?: TrackViewerMessages,
): (acceptedFiles: File[], fileRejections?: FileRejection[]) => void {
  return useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[] = []) => {
      if (fileRejections.length) {
        onLoadError(tvm?.invalidFormat ?? 'invalid format');

        return;
      }

      if (acceptedFiles.length !== 1) {
        onLoadError(tvm?.onlyOne ?? 'many files');

        return;
      }

      const file = acceptedFiles[0]!;

      const reader = new FileReader();

      reader.readAsText(file, 'UTF-8');

      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onDrop(reader.result, file);
        } else {
          onLoadError(tvm?.loadingError ?? 'loading error');
        }
      };

      reader.onerror = () => {
        onLoadError(tvm?.loadingError ?? 'loading error');

        reader.abort();
      };
    },
    [onDrop, onLoadError, tvm],
  );
}
