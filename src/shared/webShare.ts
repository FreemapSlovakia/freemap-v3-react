/**
 * Whether the browser would put a file of this name and type on the OS share sheet.
 *
 * `navigator.canShare` existing says only that the browser knows the API — Firefox has it and
 * shares no files at all, and Chromium shares them only on the platforms where it implements a
 * share sheet. It also refuses whole classes of file: Chromium checks the name's extension *and*
 * the MIME type against a safelist (images, audio, video, PDF, plain text) that no geo format is
 * on. Probing with a real `File` carrying the name and type in question is the only answer that
 * covers all of it — and asking before offering a share is what keeps the offer honest.
 */
export function canShareFile(name: string, mime: string): boolean {
  return (
    typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: [new File([], name, { type: mime })] })
  );
}

/**
 * `navigator.share`, taking a sheet that is already open for an answer rather
 * than a failure.
 *
 * Every caller reaches a share behind work that takes a while — building an
 * export, filling elevations, fetching a picture — while the UI that started it
 * stays put, so asking twice is easy; the two requests need not even come from
 * the same menu entry. A share made over one still open rejects with
 * `InvalidStateError`, and the sheet on screen is the one the user asked for,
 * so a later call reports that it shared nothing.
 *
 * Asking the browser beats tracking it here. A flag of our own would have to
 * guess when a sheet closed, and a share promise that never settles would latch
 * it for the life of the page — turning every later share into silence.
 *
 * Resolves `true` when the sheet opened and the share settled, `false` when one
 * was already open. Rejects with whatever the share rejects with, so a
 * dismissal still arrives as `AbortError` for callers that tell it apart from a
 * real failure.
 */
export async function shareViaSheet(data: ShareData): Promise<boolean> {
  try {
    await navigator.share(data);
  } catch (e) {
    if (e instanceof DOMException && e.name === 'InvalidStateError') {
      return false;
    }

    throw e;
  }

  return true;
}
