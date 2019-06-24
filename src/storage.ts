import storage from 'local-storage-fallback';

let s: StorageFallback;

try {
  if (!window.localStorage) {
    throw new Error();
  }
  s = window.localStorage;
} catch (e) {
  s = storage;
}

const ss = s;

export default ss;
