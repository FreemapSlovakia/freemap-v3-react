export function splitByVars(input) {
  const re = /(\{[a-zA-Z][a-zA-Z0-9]*\})/g;
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
    ret.push(result[1]);
  }

  if (last < input.length) {
    ret.push(input.substring(last));
  }

  return ret;
}
