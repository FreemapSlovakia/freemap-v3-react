/**
 * The little language a drawing label and a toposcope ray template are both
 * written in.
 *
 * - `{key}` is a placeholder. What a key may name is the caller's business.
 * - `[…]` is a group: it is written only if every placeholder inside it had
 *   something to say. `{label}[ ({elevation})]` on a point with no elevation is
 *   just the label — no empty brackets left behind. Groups nest.
 * - `\[`, `\]`, `\{`, `\}` and `\\` write that character rather than mean it. A
 *   backslash before anything else is just a backslash, so a label that has one
 *   for its own reasons is left alone.
 *
 * Groups exist because guessing doesn't work. Dropping the punctuation around a
 * value that vanished cannot tell a joiner from a caption: in `{a} - {b}` the
 * dash belongs to neither and may go with either, while in
 * `Name: {a}, Surname {b}` the `, Surname ` belongs to `b` and has to survive
 * `a` going missing. The two look identical, so the author says which by
 * bracketing it.
 */

type Node =
  | { kind: 'text'; text: string }
  | { kind: 'key'; key: string }
  | { kind: 'group'; nodes: Node[] };

/** `undefined` for a name the caller doesn't know; `''` for one it has no value for. */
export type ResolveKey = (key: string) => string | undefined;

const literal = (text: string): Node => ({ kind: 'text', text });

function holdsKey(nodes: Node[]): boolean {
  return nodes.some(
    (node) =>
      node.kind === 'key' || (node.kind === 'group' && holdsKey(node.nodes)),
  );
}

/**
 * A group that holds no placeholder can never be empty, so it isn't a group —
 * it's the `[1]` or `[closed]` somebody wrote, and it gets its brackets back.
 * That covers nearly every literal bracket without an escape; `\[` covers the
 * rest, including brackets meant to wrap a placeholder.
 */
function unwrapPlain(nodes: Node[]): Node[] {
  return nodes.flatMap((node): Node[] => {
    if (node.kind !== 'group') {
      return [node];
    }

    const inner = unwrapPlain(node.nodes);

    return holdsKey(inner)
      ? [{ kind: 'group', nodes: inner }]
      : [literal('['), ...inner, literal(']')];
  });
}

function parse(text: string): Node[] {
  const root: Node[] = [];

  const stack = [root];

  let pending = '';

  const flush = () => {
    if (pending) {
      stack.at(-1)!.push(literal(pending));

      pending = '';
    }
  };

  for (let i = 0; i < text.length; i++) {
    const c = text[i]!;

    if (c === '\\' && i + 1 < text.length && '[]{}\\'.includes(text[i + 1]!)) {
      pending += text[i + 1];

      i++;
    } else if (c === '[') {
      flush();

      const nodes: Node[] = [];

      stack.at(-1)!.push({ kind: 'group', nodes });

      stack.push(nodes);
    } else if (c === ']' && stack.length > 1) {
      flush();

      stack.pop();
    } else if (c === '{' && text.includes('}', i)) {
      flush();

      const end = text.indexOf('}', i);

      stack.at(-1)!.push({ kind: 'key', key: text.slice(i + 1, end) });

      i = end;
    } else {
      pending += c;
    }
  }

  flush();

  // A `[` never closed opens nothing; give it and everything after it back as
  // the text it is, innermost first.
  while (stack.length > 1) {
    const orphan = stack.pop()!;

    const parent = stack.at(-1)!;

    parent.pop();

    parent.push(literal('['), ...orphan);
  }

  return unwrapPlain(root);
}

/**
 * Renders `text`, asking `resolve` for each placeholder.
 *
 * A key `resolve` doesn't know stays on screen as it was written, so a typo is
 * visible — and it counts as something said, so the group around it survives. A
 * key it knows but has no value for empties, and takes its group with it.
 */
export function renderTemplate(text: string, resolve: ResolveKey): string {
  // Nothing to expand and nothing escaped: the overwhelmingly common label.
  if (!text.includes('{') && !text.includes('\\')) {
    return text;
  }

  const render = (nodes: Node[]): { text: string; empty: boolean } => {
    let out = '';

    let empty = false;

    for (const node of nodes) {
      if (node.kind === 'text') {
        out += node.text;
      } else if (node.kind === 'key') {
        const value = resolve(node.key);

        if (value === undefined) {
          out += `{${node.key}}`;
        } else if (value) {
          out += value;
        } else {
          empty = true;
        }
      } else {
        const group = render(node.nodes);

        if (!group.empty) {
          out += group.text;
        }
      }
    }

    return { text: out, empty };
  };

  return render(parse(text)).text;
}
