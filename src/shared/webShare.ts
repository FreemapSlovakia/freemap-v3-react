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
