/**
 * Chrome's Local Network Access opt-in: naming the target space makes the
 * permission check resolve (and prompt) instead of blocking the request.
 * Not in lib.dom yet.
 */
interface RequestInit {
  targetAddressSpace?: 'local' | 'private' | 'public' | 'loopback';
}

/** User-Agent Client Hints; Chromium-only, so its presence is itself a signal. */
interface NavigatorUAData {
  readonly brands: readonly { brand: string; version: string }[];
  readonly mobile: boolean;
  readonly platform: string;
}

interface Navigator {
  readonly userAgentData?: NavigatorUAData;
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
