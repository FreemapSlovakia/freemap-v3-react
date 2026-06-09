// react-qr-code ships types at types/index.d.ts but its package.json `exports`
// map has no `types` entry, so `nodenext` resolution can't find them.
declare module 'react-qr-code' {
  import * as React from 'react';

  export interface QRCodeProps extends React.SVGProps<SVGSVGElement> {
    value: string;
    size?: number; // defaults to 128
    bgColor?: React.CSSProperties['backgroundColor']; // defaults to "#FFFFFF"
    fgColor?: React.CSSProperties['color']; // defaults to "#000000"
    level?: 'L' | 'M' | 'H' | 'Q'; // defaults to "L"
    title?: string;
  }

  export class QRCode extends React.Component<QRCodeProps> {
    render(): React.ReactNode;
  }

  export default QRCode;
}
