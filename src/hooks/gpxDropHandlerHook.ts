import { useCallback } from 'react';

export function useGpxDropHandler(
  onDrop: (gpx: string) => void,
  onLoadError: (msg: string) => void,
) {
  return useCallback(
    (acceptedFiles: File[], rejectedFiles: File[] = []) => {
      if (rejectedFiles.length) {
        onLoadError(
          'Nesprávny formát súboru: Nahraný súbor musí mať príponu .gpx', // TODO translate
        );

        return;
      }

      if (acceptedFiles.length !== 1) {
        onLoadError(
          'Očakáva sa iba jeden GPX súbor.', // TODO translate
        );

        return;
      }

      const reader = new FileReader();
      reader.readAsText(acceptedFiles[0], 'UTF-8');
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onDrop(reader.result);
        } else {
          onLoadError(`Nepodarilo sa načítať súbor.`); // TODO translate
        }
      };

      reader.onerror = () => {
        onLoadError(`Nepodarilo sa načítať súbor.`); // TODO translate
        reader.abort();
      };
    },
    [onDrop, onLoadError],
  );
}
