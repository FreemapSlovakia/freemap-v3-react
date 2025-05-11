const MAX_LAYERS: u32 = 8;

const HALF_PI = radians(90.0);

const PI = radians(180.0);

const TAU = radians(360.0);

const SCALE_CONST: f32 = 256.0 / 6378137.0 / TAU / cos(radians(49.0)) / 16.0;

struct ShadingLayer {
  method: u32,
  azimuth: f32,
  altitude: f32,
  contrast: f32,
  brightness: f32,
  weight: f32,
  color: vec4<f32>, // RGBA
};

struct Config {
  layer_count: u32,
  zoom: u32
};

@group(0) @binding(0) var samp: sampler;
@group(0) @binding(1) var elev: texture_2d<f32>;
@group(0) @binding(2) var<uniform> config: Config;
@group(0) @binding(3) var<uniform> layers: array<ShadingLayer, MAX_LAYERS>;

fn get_elev(coord: vec2<i32>) -> f32 {
  let texSize = vec2<f32>(textureDimensions(elev, 0));

  let uv = (vec2<f32>(coord) + 0.5) / texSize;

  return textureSampleLevel(elev, samp, uv, 0.0).r;
}

@vertex
fn vs_main(@builtin(vertex_index) i: u32) -> @builtin(position) vec4<f32> {
  let pos = array<vec2<f32>, 6>(
    vec2(-1.0, -1.0), vec2(1.0, -1.0), vec2(-1.0, 1.0),
    vec2(-1.0, 1.0), vec2(1.0, -1.0), vec2(1.0, 1.0)
  );

  return vec4<f32>(pos[i], 0.0, 1.0);
}

fn normalize_angle(angle: f32) -> f32 {
    let ang = angle % TAU;

    return select(ang, TAU + ang, ang < 0.0);
}

@fragment
fn fs_main(@builtin(position) pos: vec4<f32>) -> @location(0) vec4<f32> {
  let px = vec2<i32>(i32(pos.x + 2), i32(pos.y + 2));

  let nn = get_elev(px + vec2(-1, -1));
  let nz = get_elev(px + vec2(-1,  0));
  let np = get_elev(px + vec2(-1,  1));
  let zn = get_elev(px + vec2( 0, -1));
  let zp = get_elev(px + vec2( 0,  1));
  let pn = get_elev(px + vec2( 1, -1));
  let pz = get_elev(px + vec2( 1,  0));
  let pp = get_elev(px + vec2( 1,  1));

  let dzdx = -nn + pn
             - 2.0 * nz + 2.0 * pz
             - np + pp;

  let dzdy = -nn - 2.0 * zn - pn
             + np + 2.0 * zp + pp;


  let scale = SCALE_CONST * f32(1 << config.zoom);

  var normal = normalize(vec3(-dzdx * scale, -dzdy * scale, 1.0));

  normal = select(normal, vec3(0.0, 0.0, 1.0), sign(normal.z) == 0.0);

  var sum_rgb = vec3<f32>(0.0);
  var sum_alpha_weight = 0.0;
  var alpha_product = 1.0;

  for (var i = 0u; i < MAX_LAYERS && i < config.layer_count; i = i + 1u) {
    let layer = layers[i];

    var intensity = 0.0;

    if (layer.method == 0u) {
      // Igor
      var aspect_diff = abs(normalize_angle(atan2(normal.y, normal.x)) - normalize_angle(layer.azimuth - HALF_PI));

      if (aspect_diff > PI) {
        aspect_diff = TAU - aspect_diff;
      }

      let aspect_strength = 1.0 - aspect_diff / PI;

      let slope_angle = acos(normal.z); // radians from vertical

      intensity = slope_angle / HALF_PI * 2.0 * aspect_strength;
    } else if (layer.method == 1u) {
      // Oblique
      let zenith = HALF_PI - layer.altitude;

      let light = vec3(
        sin(layer.azimuth) * sin(zenith),
        -cos(layer.azimuth) * sin(zenith),
        cos(zenith)
      );

      intensity = dot(normal, light);
    } else if (layer.method == 2u) {
      intensity = acos(normal.z) / HALF_PI;
    } else if (layer.method == 3u) {
      let zenith = HALF_PI - layer.altitude;

      intensity = cos(zenith) * normal.z + sin(zenith) * length(normal.xy);
    }

    let modulated = layer.contrast * (intensity - 0.5) + 0.5 + layer.brightness;
    let alpha = layer.color.a * modulated;
    let weighted_alpha = alpha * layer.weight;

    sum_rgb = sum_rgb + weighted_alpha * layer.color.rgb;
    sum_alpha_weight = sum_alpha_weight + weighted_alpha;
    alpha_product = alpha_product * (1.0 - weighted_alpha);
  }

  let rgb = select(sum_rgb / sum_alpha_weight, vec3(0.0), sum_alpha_weight == 0.0);

  let alpha = 1.0 - clamp(alpha_product, 0.0, 1.0);

  let rgb_p = clamp(rgb, vec3(0.0), vec3(1.0));

  return vec4(rgb_p * alpha, alpha);

  // let shade = dot(
  //   normal,
  //   normalize(config.light)
  // );

  // return vec4<f32>(vec3(shade * 0.5 + 0.5), 1.0);
}
