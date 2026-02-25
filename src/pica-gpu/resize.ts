/* biome-ignore-all lint/correctness/useHookAtTopLevel: this is not react */
import {
  createDefaultQuadBuffer,
  createEmptyTexture,
  createFramebuffer,
  createProgram,
  createTextureFromImage,
  useDefaultQuadBuffer,
} from './gl-helper.js';
import {
  generateHorizontalShader,
  generateVerticalShader,
  getResizeWindow,
  vsSource,
} from './shaders.js';

export interface ResizeOptions {
  targetWidth: number;
  targetHeight: number;
  filter: 'box' | 'hamming' | 'lanczos2' | 'lanczos3' | 'mks2013';
}

export function resize(
  from:
    | ImageBitmap
    | ImageData
    | HTMLImageElement
    | HTMLCanvasElement
    | OffscreenCanvas,
  to: HTMLCanvasElement,
  options: ResizeOptions,
) {
  if (from.width === 0 || from.height === 0) {
    throw new Error('source canvas width or height is 0');
  }

  if (to.width === 0 || to.height === 0) {
    throw new Error('target canvas width or height is 0');
  }

  const gl = to.getContext('webgl2');

  if (!gl) {
    throw new Error('webgl2 context not found');
  }

  const targetWidth = Math.round(options.targetWidth);

  const targetHeight = Math.round(options.targetHeight);

  const srcWidth = from.width;

  const srcHeight = from.height;

  const scaleX = targetWidth / srcWidth;

  const scaleY = targetHeight / srcHeight;

  const windowSize = getResizeWindow(options.filter);

  const sourceTexture = createTextureFromImage(gl, from as TexImageSource);

  const quadBuffer = createDefaultQuadBuffer(gl);

  const horizontalTexture = createEmptyTexture(gl, targetWidth, srcHeight);

  const horizontalFramebuffer = createFramebuffer(gl, horizontalTexture);

  const compiledHorizontal = createProgram(
    gl,
    vsSource,
    generateHorizontalShader(options.filter),
  )!;

  const horizontalProgram = compiledHorizontal.program;

  gl.useProgram(horizontalProgram);

  useDefaultQuadBuffer(
    gl,
    horizontalProgram,
    quadBuffer,
    'a_position',
    'a_texCoord',
  );

  gl.uniform1i(gl.getUniformLocation(horizontalProgram, 'u_image'), 0);

  gl.uniform1f(
    gl.getUniformLocation(horizontalProgram, 'u_textureWidth'),
    srcWidth,
  );

  gl.uniform1f(gl.getUniformLocation(horizontalProgram, 'u_scale'), scaleX);

  gl.uniform1f(
    gl.getUniformLocation(horizontalProgram, 'u_radius'),
    windowSize,
  );

  gl.activeTexture(gl.TEXTURE0);

  gl.bindTexture(gl.TEXTURE_2D, sourceTexture);

  gl.viewport(0, 0, targetWidth, srcHeight);

  gl.bindFramebuffer(gl.FRAMEBUFFER, horizontalFramebuffer);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  const compiledVertical = createProgram(
    gl,
    vsSource,
    generateVerticalShader(options.filter),
  )!;

  const verticalProgram = compiledVertical.program;

  gl.useProgram(verticalProgram);

  useDefaultQuadBuffer(
    gl,
    verticalProgram,
    quadBuffer,
    'a_position',
    'a_texCoord',
  );

  gl.uniform1i(gl.getUniformLocation(verticalProgram, 'u_image'), 0);

  gl.uniform1f(
    gl.getUniformLocation(verticalProgram, 'u_textureWidth'),
    targetWidth,
  );

  gl.uniform1f(
    gl.getUniformLocation(verticalProgram, 'u_textureHeight'),
    srcHeight,
  );

  gl.uniform1f(gl.getUniformLocation(verticalProgram, 'u_scale'), scaleY);

  gl.uniform1f(gl.getUniformLocation(verticalProgram, 'u_radius'), windowSize);

  gl.activeTexture(gl.TEXTURE0);

  gl.bindTexture(gl.TEXTURE_2D, horizontalTexture);

  gl.viewport(0, 0, targetWidth, targetHeight);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  gl.deleteTexture(sourceTexture);

  gl.deleteTexture(horizontalTexture);

  gl.deleteProgram(compiledHorizontal.program);

  gl.deleteProgram(compiledVertical.program);

  gl.deleteShader(compiledHorizontal.vertexShader);

  gl.deleteShader(compiledHorizontal.fragmentShader);

  gl.deleteShader(compiledVertical.vertexShader);

  gl.deleteShader(compiledVertical.fragmentShader);

  gl.deleteFramebuffer(horizontalFramebuffer);

  gl.deleteBuffer(quadBuffer);
}
