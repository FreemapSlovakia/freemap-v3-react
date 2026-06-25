export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Like escapeHtml but emits the canonical XML `&apos;` for apostrophes; use for
// XML/SVG/KML element text and attribute values.
export function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function removeAccents(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function objectToURLSearchParams(query: Record<string, unknown>) {
  const res: [string, string][] = [];

  for (const [k, v] of Object.entries(query)) {
    if (Array.isArray(v)) {
      for (const item of v) {
        if (item !== undefined) {
          res.push([k, item === null ? '' : String(item)]);
        }
      }
    } else if (v !== undefined) {
      res.push([k, v === null ? '' : String(v)]);
    }
  }

  return new URLSearchParams(res);
}
