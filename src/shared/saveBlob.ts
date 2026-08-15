// The presence of `showSaveFilePicker` says the browser implements it, not that
// it can deliver a file: no Android browser implements the writes, and Samsung
// Internet opens the dialog and then rejects `createWritable`. The anchor below
// is how Android saves files anyway.
const pickerSupported =
  'showSaveFilePicker' in window && !/Android/i.test(navigator.userAgent);

/** Refusals that mean "no picker here" rather than a failed save. */
function isPlatformRefusal(err: unknown): boolean {
  return (
    err instanceof DOMException &&
    (err.name === 'SecurityError' || err.name === 'NotAllowedError')
  );
}

/**
 * Saves a blob to a file the user picks. Prefers the File System Access API
 * (a native "Save as" dialog that streams straight to disk) and falls back to a
 * synthesized `<a download>` where it's unavailable (Firefox, Safari, Android).
 *
 * `accept` maps a MIME type to its file extensions and, when given, populates
 * the picker's file-type filter.
 *
 * The picker rejects with an `AbortError` `DOMException` when the user cancels;
 * that rejection is propagated so callers can distinguish a cancel from a real
 * failure.
 */
export async function saveBlob(
  blob: Blob,
  suggestedName: string,
  accept?: Record<string, string[]>,
): Promise<void> {
  if (pickerSupported) {
    let handle: FileSystemFileHandle | undefined;

    // A cross-origin iframe (the map embed) is refused with a `SecurityError`,
    // and a missing user gesture or a policy restriction with a
    // `NotAllowedError`.
    try {
      handle = await showSaveFilePicker({
        suggestedName,
        // The FS Access types demand template-literal MIME/extension types; the
        // plainer `Record<string, string[]>` is friendlier for callers.
        types: accept
          ? [
              {
                description: blob.type || 'File',
                accept: accept as FilePickerAcceptType['accept'],
              },
            ]
          : undefined,
      });
    } catch (err) {
      if (!isPlatformRefusal(err)) {
        throw err;
      }
    }

    if (handle) {
      let writable: FileSystemWritableFileStream | undefined;

      // The net for a browser that offers a picker it cannot write through and
      // isn't gated above. Only opening the stream may fall through — nothing
      // is written yet, so
      // the anchor still saves the file (at the cost of the empty file the
      // picker may have created). A failure once writing has started must
      // surface instead, or the picked file is left half-written and a second
      // copy lands in the download folder.
      try {
        writable = await handle.createWritable();
      } catch (err) {
        if (!isPlatformRefusal(err)) {
          throw err;
        }
      }

      if (writable) {
        await writable.write(blob);

        await writable.close();

        return;
      }
    }
  }

  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = suggestedName;
  a.rel = 'noopener';
  a.style.display = 'none';

  // Some browsers only fire a synthetic click for a connected element, and need
  // the object URL kept alive until the download starts — hence the deferred
  // revoke.
  document.body.append(a);

  a.click();
  a.remove();

  setTimeout(() => URL.revokeObjectURL(url), 0);
}
