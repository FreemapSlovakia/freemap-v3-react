@group(0) @binding(0) var samp: sampler;
@group(0) @binding(1) var elev: texture_2d<f32>;

fn get_elev(coord: vec2<i32>) -> f32 {
  return textureSampleLevel(elev, samp, (vec2<f32>(coord) + 0.5) / vec2<f32>(textureDimensions(elev, 0)), 0.0).r;
}

@vertex
fn vs_main(@builtin(vertex_index) i: u32) -> @builtin(position) vec4<f32> {
  var pos = array<vec2<f32>, 6>(
    vec2(-1.0, -1.0), vec2(1.0, -1.0), vec2(-1.0, 1.0),
    vec2(-1.0, 1.0), vec2(1.0, -1.0), vec2(1.0, 1.0)
  );
  return vec4<f32>(pos[i], 0.0, 1.0);
}

struct Config {
  zoom: u32,
}

@group(0) @binding(2)
var<uniform> config: Config;

@fragment
fn fs_main(@builtin(position) pos: vec4<f32>) -> @location(0) vec4<f32> {
  let texSize = textureDimensions(elev, 0);
  let px = vec2<i32>(i32(pos.x + 2), i32(pos.y + 2));

  let dzdx =
    -1.0 * get_elev(px + vec2(-1, -1)) + 1.0 * get_elev(px + vec2(1, -1)) +
    -2.0 * get_elev(px + vec2(-1,  0)) + 2.0 * get_elev(px + vec2(1,  0)) +
    -1.0 * get_elev(px + vec2(-1,  1)) + 1.0 * get_elev(px + vec2(1,  1));

  let dzdy =
    -1.0 * get_elev(px + vec2(-1, -1)) + -2.0 * get_elev(px + vec2(0, -1)) + -1.0 * get_elev(px + vec2(1, -1)) +
     1.0 * get_elev(px + vec2(-1,  1)) +  2.0 * get_elev(px + vec2(0,  1)) +  1.0 * get_elev(px + vec2(1,  1));

  let scale = f32(1 << config.zoom) / 200000.0;
  let normal = normalize(vec3(-dzdx * scale, -dzdy * scale, 1.0));

  let light = normalize(vec3(0.0, 0.0, 1.0));
  let shade = dot(normal, light);

  return vec4<f32>(vec3(shade * 0.5 + 0.5), 1.0);
}
