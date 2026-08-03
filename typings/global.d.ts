/**
 * Chrome's Local Network Access opt-in: naming the target space makes the
 * permission check resolve (and prompt) instead of blocking the request.
 * Not in lib.dom yet.
 */
interface RequestInit {
  targetAddressSpace?: 'local' | 'private' | 'public' | 'loopback';
}

declare module '*.wgsl' {
  const value: string;
  export default value;
}

declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.jpeg' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  const value: string;
  export default value;
}

declare module '*.wasm' {
  const value: string;
  export default value;
}

declare module '*.css' {
  const classes: Record<string, string>;
  export default classes;
}

declare module '*.scss' {
  const classes: Record<string, string>;
  export default classes;
}

declare module '@mapbox/togeojson';

declare module 'pannellum';

declare module 'virtual/markdown-dict.js' {
  import { ReactNode } from 'react';

  export interface MarkdownEntry {
    title: string;
    lang: string;
    key: string;
    listed?: boolean;
    icon: ReactNode;
    order?: number;
  }

  const dict: MarkdownEntry[];

  export default dict;
}

/**
 * `Intl.DurationFormat` (ECMA-402), which turns `{ hours, minutes }` into a
 * localized "5h 54m" / "5 h, 54 min" / "5 ó és 54 p" and drops zero-valued
 * fields on its own. Recent enough — Chrome 129, Safari 18.4 — that callers
 * still need a fallback, and not in TypeScript's lib yet.
 */
declare namespace Intl {
  type DurationFormatStyle = 'long' | 'short' | 'narrow' | 'digital';

  interface DurationInput {
    years?: number;
    months?: number;
    weeks?: number;
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
  }

  class DurationFormat {
    constructor(
      locales?: string | string[],
      options?: { style?: DurationFormatStyle },
    );
    format(duration: DurationInput): string;
  }
}
