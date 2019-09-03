export type SplitItem =
  | string
  | {
      variable: string;
      token: string;
    };

function splitByVars(input: string, special: boolean): SplitItem[] {
  const re = /(\{([a-zA-Z][a-zA-Z0-9]*)\})/g;
  let last = 0;
  const ret: SplitItem[] = [];

  for (;;) {
    const result = re.exec(input);
    if (!result) {
      break;
    }

    if (result.index - last > 1) {
      ret.push(input.substring(last, result.index));
    }

    last = re.lastIndex;
    ret.push(special ? { variable: result[2], token: result[1] } : result[1]);
  }

  if (last < input.length) {
    ret.push(input.substring(last));
  }

  return ret;
}

function exec(x: any): any {
  return typeof x === 'function' ? x() : x;
}

// for 'foo {a} bar {b} baz' and { a: 'A', b: <Lol /> } returns ['foo A bar ', <Lol />, ' baz']
// for 'foo {a} bar' and { a: 'A' } returns 'foo A bar'
export function splitAndSubstitute(
  input: string,
  params: { [k: string]: any } = {},
) {
  const x = splitByVars(input, true)
    .map(part =>
      typeof part === 'string' ? part : exec(params[part.variable]),
    )
    .reduce(
      (a, b) =>
        typeof b === 'string' && a.length && typeof a[a.length - 1] === 'string'
          ? [...a.slice(0, -1), a[a.length - 1] + b]
          : [...a, b],
      '',
    );
  return x.length === 1 ? x[0] : x;
}

export interface Translations {
  [key: string]: Translations | string | ((...params: any[]) => string);
}

export function translate(
  translations: Translations | undefined,
  key: string,
  dflt: string = '',
): string | ((...params: any[]) => string) {
  if (!translations) {
    return '…';
  }
  let curr: Translations = translations;
  const keys = key.split('.');
  for (;;) {
    const part = keys.shift();
    if (part === undefined) {
      return dflt;
    }
    const item = curr[part];
    if (typeof item === 'string' || typeof item === 'function') {
      if (keys.length) {
        throw new Error(
          `sub-key refers to string or function; ; key=${key}; type=${typeof item}`,
        );
      }
      return item;
    } else if (typeof item !== 'object') {
      throw new Error(
        `sub-key refers to non-string and non-function; key=${key}; type=${typeof item}`,
      );
    }
    curr = item;
  }
}

// console.log('XXXXXXXXXXXX', splitAndSubstitute('foo {a} bar {b} baz', { a: 'A', b: undefined }));

export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
