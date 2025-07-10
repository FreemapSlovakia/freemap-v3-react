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
    isNaN(value) ||
    (min !== undefined && value < min) ||
    (max !== undefined && value > max)
  );
}
