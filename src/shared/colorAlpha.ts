import Color from 'color';

export type RgbAlpha = { color: string; opacity: number };

export function splitColorAlpha(input: string | undefined): RgbAlpha {
  if (!input) {
    return { color: '', opacity: 1 };
  }

  if (/^#[0-9a-fA-F]{8}$/.test(input)) {
    return {
      color: input.slice(0, 7).toLowerCase(),
      opacity: parseInt(input.slice(7), 16) / 255,
    };
  }

  if (/^#[0-9a-fA-F]{6}$/.test(input)) {
    return { color: input.toLowerCase(), opacity: 1 };
  }

  try {
    const c = Color(input);
    return { color: c.hex().toLowerCase(), opacity: c.alpha() };
  } catch {
    return { color: input, opacity: 1 };
  }
}

export function joinColorAlpha(color: string, opacity: number): string {
  const lc = color.toLowerCase();

  if (opacity >= 1) {
    return lc;
  }

  const a = Math.round(Math.max(0, Math.min(1, opacity)) * 255)
    .toString(16)
    .padStart(2, '0');

  return lc + a;
}

export function toRgbaString(color: string | undefined): string {
  if (!color) {
    return 'rgba(0,0,0,1)';
  }

  try {
    const c = Color(color);

    return `rgba(${c.red()},${c.green()},${c.blue()},${c.alpha()})`;
  } catch {
    return 'rgba(0,0,0,1)';
  }
}

export function rgbaStringToHexa(value: string): string {
  try {
    const c = Color(value);

    return c.alpha() < 1 ? c.hexa().toLowerCase() : c.hex().toLowerCase();
  } catch {
    return value;
  }
}
