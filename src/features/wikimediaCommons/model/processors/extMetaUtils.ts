export type ExtMetaValue = string | Record<string, unknown> | undefined;

export function pickLang(
  value: ExtMetaValue,
  language: string,
): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value[language] === 'string') {
    return value[language] as string;
  }

  if (typeof value['en'] === 'string') {
    return value['en'] as string;
  }

  for (const [k, v] of Object.entries(value)) {
    if (k !== '_type' && typeof v === 'string') {
      return v;
    }
  }

  return undefined;
}

export function stripHtml(html: string | undefined): string | undefined {
  if (!html) {
    return undefined;
  }

  const tmp = document.createElement('div');

  tmp.innerHTML = html;

  return tmp.textContent?.trim() || undefined;
}
