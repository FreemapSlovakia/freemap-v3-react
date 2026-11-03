/**
 * A decimal number, as `<input type="number">` reports one: a point, never a
 * comma (`1,000` would be a thousand or one) and no `0x10`.
 */
export function parseDecimal(text: string): number | undefined {
  const n = /^\s*[+-]?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?\s*$/i.test(text)
    ? Number(text)
    : NaN;

  return Number.isFinite(n) ? n : undefined;
}

/**
 * Whether `<input type="number">` shows the text as it is: no spaces, no `+`,
 * no trailing `.`. It blanks anything else, so the value goes unseen.
 */
export const isInputNumber = (text: string) =>
  /^-?(\d+(\.\d+)?|\.\d+)(e[+-]?\d+)?$/i.test(text);

function parseInt10(value: string) {
  return /^\s*[+-]?(0|\d+)\s*$/.test(value) ? parseInt(value, 10) : NaN;
}

export function isInvalidInt(
  val: string,
  required: boolean,
  min?: number,
  max?: number,
) {
  return isInvalidNumber(parseInt10, val, required, min, max);
}

export function isInvalidFloat(
  val: string,
  required: boolean,
  min?: number,
  max?: number,
) {
  return isInvalidNumber(parseFloat, val, required, min, max);
}

function isInvalidNumber(
  toNumber: (val: string) => number,
  val: string,
  required: boolean,
  min?: number,
  max?: number,
) {
  if (!required && !val) {
    return false;
  }

  const value = toNumber(val);

  return (
    Number.isNaN(value) ||
    (min !== undefined && value < min) ||
    (max !== undefined && value > max)
  );
}
