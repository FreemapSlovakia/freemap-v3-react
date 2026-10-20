import type { StringLeaves } from '@shared/types/common.js';
import type { ReactNode } from 'react';
import type { Messages } from '@/translations/messagesInterface.js';
import { getMessageByKey, useMessages } from './l10nInjector.js';
import classes from './Text.module.css';

type Content<T> =
  | { k: StringLeaves<NoInfer<T>>; children?: never }
  | { k?: never; children: (m: NoInfer<T>) => ReactNode };

type Props<T> = {
  /** A per-feature bundle; global messages when omitted. */
  m?: T | undefined;
} & Content<T>;

/** Stands in for text whose messages haven't loaded yet. */
export function TextPlaceholder(): ReactNode {
  return <span className={classes.loading} />;
}

function render<T>(m: T | undefined, content: Content<T>): ReactNode {
  if (m === undefined) {
    return <TextPlaceholder />;
  }

  return content.children
    ? content.children(m)
    : (getMessageByKey(m, content.k as string) as string);
}

// A component of its own, so that only text reading the global messages subscribes to them.
function GlobalText(content: Content<Messages>): ReactNode {
  return render(useMessages(), content);
}

/** A message, or a placeholder until its bundle has loaded. */
export function Text<T = Messages>(props: Props<T>): ReactNode {
  return 'm' in props ? (
    render(props.m, props)
  ) : (
    <GlobalText {...(props as Content<Messages>)} />
  );
}
