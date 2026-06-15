// Tiny 2×2 HEIC sample used to feature-detect whether the browser can decode
// HEIC/HEIF. Browsers without a decoder (Chrome, Firefox) fire `<img>` onerror;
// Safari decodes it and reports a non-zero natural size.
const SAMPLE_HEIC =
  'data:image/heic;base64,AAAAHGZ0eXBoZWl4AAAAAG1pZjFoZWl4bWlhZgAAAWNtZXRhAAAAAAAAACFoZGxyAAAAAAAAAABwaWN0AAAAAAAAAAAAAAAAAAAAAA5waXRtAAAAAAABAAAAImlsb2MAAAAAREAAAQABAAAAAAGHAAEAAAAAAAAAIgAAACNpaW5mAAAAAAABAAAAFWluZmUCAAAAAAEAAGh2YzEAAAAA42lwcnAAAADEaXBjbwAAAHJodmNDAQQIAAAAAAAAAAAAHvAA/Pz8/AAADwNgAAEAF0ABDAH//wQIAAADAJn4AAADAAAeugJAYQABACdCAQEECAAAAwCZ+AAAAwAAHsCCBBFKW6q6a5sCAAADADIAAAMAAhBiAAEABkQBwXPBiQAAABRpc3BlAAAAAAAAAEAAAABAAAAAKGNsYXAAAAACAAAAAQAAAAIAAAAB////wgAAAAL////CAAAAAgAAAA5waXhpAAAAAAEMAAAAF2lwbWEAAAAAAAAAAQABBIECBIMAAAAqbWRhdAAAAB4oAa4mQkIk59lPH+4rF2FVc1OybCBiRCkSgGP19K4=';

let support: Promise<boolean> | undefined;

/** Resolves to whether the browser can decode HEIC/HEIF images. Cached. */
export function isHeicSupported(): Promise<boolean> {
  if (!support) {
    support = new Promise<boolean>((resolve) => {
      if (typeof Image === 'undefined') {
        resolve(false);

        return;
      }

      const img = new Image();

      img.onload = () => resolve(img.naturalWidth > 0);
      img.onerror = () => resolve(false);
      img.src = SAMPLE_HEIC;
    });
  }

  return support;
}

/** Whether a file is HEIC/HEIF, by MIME type or extension. */
export function isHeicFile(file: File): boolean {
  return /image\/hei[cf]/.test(file.type) || /\.(heic|heif)$/i.test(file.name);
}
