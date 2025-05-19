function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
) {
  const shader = gl.createShader(type)!;

  gl.shaderSource(shader, source);

  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('compile shader error:', gl.getShaderInfoLog(shader));

    gl.deleteShader(shader);

    throw new Error('compile shader error');
  }

  return shader;
}

export function createProgram(
  gl: WebGL2RenderingContext,
  vsSource: string,
  fsSource: string,
) {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vsSource)!;

  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fsSource)!;

  const program = gl.createProgram();

  gl.attachShader(program, vertexShader);

  gl.attachShader(program, fragmentShader);

  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('link program error:', gl.getProgramInfoLog(program));

    throw new Error('link program error');
  }

  return {
    program,
    vertexShader,
    fragmentShader,
  };
}

export function createTextureFromImage(
  gl: WebGL2RenderingContext,
  image: TexImageSource,
) {
  const texture = gl.createTexture();

  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  return texture;
}

export function createEmptyTexture(
  gl: WebGL2RenderingContext,
  width: number,
  height: number,
) {
  const texture = gl.createTexture();

  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    width,
    height,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    null,
  );

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  return texture;
}

export function createFramebuffer(
  gl: WebGL2RenderingContext,
  texture: WebGLTexture,
) {
  const fb = gl.createFramebuffer();

  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    texture,
    0,
  );

  return fb;
}

export function createDefaultQuadBuffer(gl: WebGL2RenderingContext) {
  const quadBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);

  const quadVertices = new Float32Array([
    // x, y, u, v
    -1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1, 1, 1, 1, 1,
  ]);

  gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);

  return quadBuffer;
}

export function useDefaultQuadBuffer(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  quadBuffer: WebGLBuffer,
  position: string,
  textCoord: string,
) {
  const posLoc = gl.getAttribLocation(program, position);

  const texLoc = gl.getAttribLocation(program, textCoord);

  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);

  gl.enableVertexAttribArray(posLoc);

  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 4 * 4, 0);

  gl.enableVertexAttribArray(texLoc);

  gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 4 * 4, 2 * 4);
}
