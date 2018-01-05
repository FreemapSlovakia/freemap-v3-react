export function splitByVars(input, special) {
  const re = /(\{([a-zA-Z][a-zA-Z0-9]*)\})/g;
  let last = 0;
  const ret = [];

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

function exec(x) {
  return typeof x === 'function' ? x() : x;
}

// for 'foo {a} bar {b} baz' and { a: 'A', b: <Lol /> } returns ['foo A bar ', <Lol />, ' baz']
// for 'foo {a} bar' and { a: 'A' } returns 'foo A bar'
export function splitAndSubstitute(input, params = {}) {
  const x = splitByVars(input, true).map(part => (part.variable ? exec(params[part.variable]) : part))
    .reduce((a, b) => (typeof b === 'string' && a.length && typeof a[a.length - 1] === 'string' ? [...a.slice(0, -1), a[a.length - 1] + b] : [...a, b]), '');
  return x.length === 1 ? x[0] : x;
}

export function translate(translations, key, dflt = '') {
  return (key && key.split('.').reduce((a, b) => (typeof a === 'object' && b in a ? a[b] : dflt), translations));
}

// console.log('XXXXXXXXXXXX', splitAndSubstitute('foo {a} bar {b} baz', { a: 'A', b: undefined }));
