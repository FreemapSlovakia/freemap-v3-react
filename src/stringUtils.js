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
    ret.push(special ? { variable: result[2] } : result[1]);
  }

  if (last < input.length) {
    ret.push(input.substring(last));
  }

  return ret;
}

export function substitute(input, params = {}) {
  return splitByVars(input, true).map(part => (part.variable in params ? params[part.variable] : part)).join('');
}
