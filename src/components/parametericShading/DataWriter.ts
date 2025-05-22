export class DataWriter {
  view: DataView;

  offset: number;

  constructor(buffer: ArrayBuffer) {
    this.view = new DataView(buffer);

    this.offset = 0;
  }

  u8(v: number) {
    this.view.setUint8(this.offset++, v);
  }

  u16(v: number) {
    this.view.setUint16(this.offset, v, true);

    this.offset += 2;
  }

  u32(v: number) {
    this.view.setUint32(this.offset, v, true);

    this.offset += 4;
  }

  f32(v: number) {
    this.view.setFloat32(this.offset, v, true);

    this.offset += 4;
  }

  pad(n: number) {
    this.offset += n;
  }
}
