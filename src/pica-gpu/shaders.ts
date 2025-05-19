import { ResizeOptions } from './resize.js';

export const vsSource = `#version 300 es
 precision highp float;
 in vec2 a_position;
 in vec2 a_texCoord;
 out vec2 v_texCoord;
 void main(){
   v_texCoord = a_texCoord;
   gl_Position = vec4(a_position, 0.0, 1.0);
 }
 `;

const fsHorizontal = `#version 300 es
 precision highp float;
 in vec2 v_texCoord;
 out vec4 outColor;

 uniform sampler2D u_image;
 uniform float u_textureWidth;
 uniform float u_scale;
 uniform float u_radius;

 const float PI = 3.141592653589793;

 /* FILTER_FUNCTION */

 void main(){
   float srcX = (v_texCoord.x * u_textureWidth);
   float left = srcX - u_radius;
   float right = srcX + u_radius;
   int start = int(floor(left));
   int end   = int(ceil(right));

   float sum = 0.0;
   vec4 color = vec4(0.0);
   for(int i = start; i <= end; i++){
     float weight = resizeFilter(((float(i) + 0.5) - srcX) * u_scale);
     float texX = (float(i) + 0.5) / u_textureWidth;
     vec4 sampleValue = texture(u_image, vec2(texX, v_texCoord.y));
     color += sampleValue * weight;
     sum += weight;
   }
   outColor = color / sum;
 }
 `;

const fsVertical = `#version 300 es
 precision mediump float;
 in vec2 v_texCoord;
 out vec4 outColor;

 uniform sampler2D u_image;
 uniform float u_textureWidth;
 uniform float u_textureHeight;
 uniform float u_scale;
 uniform float u_radius;
 const float PI = 3.141592653589793;

 /* FILTER_FUNCTION */

 void main(){
   float srcY = (v_texCoord.y * u_textureHeight);
   float top = srcY - u_radius;
   float bottom = srcY + u_radius;
   int start = int(floor(top));
   int end   = int(ceil(bottom));

   float sum = 0.0;
   vec4 color = vec4(0.0);
   for(int j = start; j <= end; j++){
     float weight = resizeFilter(((float(j) + 0.5) - srcY) * u_scale);
     float texY = (float(j) + 0.5) / u_textureHeight;
     vec4 sampleValue = texture(u_image, vec2(v_texCoord.x, texY));
     color += sampleValue * weight;
     sum += weight;
   }
   outColor = color / sum;
 }
 `;

const boxFilter = `float resizeFilter(float x) {
    x = abs(x);
    return (x < 0.5) ? 1.0 : 0.0;
 }`;

const hammingFilter = `float resizeFilter(float x) {
    x = abs(x);
    if(x >= 1.0) return 0.0;
    if(x < 1.19209290E-7) return 1.0;
    float xpi = x * PI;
    return ((sin(xpi) / xpi) * (0.54 + 0.46 * cos(xpi / 1.0)));
 }`;

const lanczos2Filter = `float resizeFilter(float x) {
   x = abs(x);
   if(x >= 2.0) return 0.0;
   if(x < 1.19209290E-7) return 1.0;
   float xpi = x * PI;
   return (sin(xpi) / xpi) * (sin(xpi / 2.0) / (xpi / 2.0));
 }`;

const lanczos3Filter = `float resizeFilter(float x) {
    x = abs(x);
    if(x >= 3.0) return 0.0;
    if(x < 1.19209290E-7) return 1.0;
    float xpi = x * PI;
    return (sin(xpi) / xpi) * sin(xpi / 3.0) / (xpi / 3.0);
  }`;

const mks2013Filter = `float resizeFilter(float x) {
    x = abs(x);
    if (x >= 2.5) { return 0.0; }
    if (x >= 1.5) { return -0.125 * (x - 2.5) * (x - 2.5); }
    if (x >= 0.5) { return 0.25 * (4.0 * x * x - 11.0 * x + 7.0); }
    return 1.0625 - 1.75 * x * x;
  }`;

const filters = {
  box: boxFilter,
  hamming: hammingFilter,
  lanczos2: lanczos2Filter,
  lanczos3: lanczos3Filter,
  mks2013: mks2013Filter,
};

const windows = {
  box: 0.5,
  hamming: 1.0,
  lanczos2: 2.0,
  lanczos3: 3.0,
  mks2013: 8.0,
};

export function generateHorizontalShader(
  filterFunction: ResizeOptions['filter'],
) {
  return fsHorizontal.replace('/* FILTER_FUNCTION */', filters[filterFunction]);
}

export function generateVerticalShader(
  filterFunction: ResizeOptions['filter'],
) {
  return fsVertical.replace('/* FILTER_FUNCTION */', filters[filterFunction]);
}

export function getResizeWindow(filterFunction: ResizeOptions['filter']) {
  return windows[filterFunction];
}
