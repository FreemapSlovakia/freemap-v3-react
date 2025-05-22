export const cache = new WeakMap<{}, HTMLCanvasElement>();

export function loadPreview(
  file: File,
  targetWidth: number,
  cb: (err: Error | undefined, key?: {}) => void,
) {
  const img = new Image();

  const url = URL.createObjectURL(file);

  img.onerror = () => {
    URL.revokeObjectURL(url);

    cb(new Error());
  };

  img.onload = () => {
    URL.revokeObjectURL(url);

    const canvas = document.createElement('canvas');

    const ratio = targetWidth / img.naturalWidth;

    const width = img.naturalWidth * ratio * devicePixelRatio;

    const height = img.naturalHeight * ratio * devicePixelRatio;

    canvas.width = width;

    canvas.height = height;

    const ctx = canvas.getContext('2d')!;

    ctx.drawImage(img, 0, 0, width, height);

    const key = {};

    cache.set(key, canvas);

    cb(undefined, key);
  };

  img.src = url;
}

export function getPreview(key: {}) {
  return cache.get(key);
}
