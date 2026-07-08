/**
 * Saves a blob to a file the user picks. Prefers the File System Access API
 * (a native "Save as" dialog that streams straight to disk) and falls back to a
 * synthesized `<a download>` where it's unavailable (Firefox, Safari).
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
  if ('showSaveFilePicker' in window) {
    const handle = await showSaveFilePicker({
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

    const writable = await handle.createWritable();

    await writable.write(blob);

    await writable.close();

    return;
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
