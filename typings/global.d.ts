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

declare module '*.gif' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  const value: string;
  export default value;
}

declare module '*.overpass' {
  const value: string;
  export default value;
}

declare module '*.wasm' {
  const value: string;
  export default value;
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
