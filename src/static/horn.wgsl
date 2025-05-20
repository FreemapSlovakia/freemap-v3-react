const HALF_PI = radians(90.0);

const PI = radians(180.0);

const TAU = radians(360.0);

// zoom 0 tile - meter per pixel
const METER_PER_PIXEL_Z0: f32 = (TAU * 6378137.0 * cos(radians(49.0))) / 256.0;

const MAX_COMPONENTS: u32 = 8;

struct Shading {
    component_count: u32,
    zoom: u32,
    background_color: vec4<f32>,
    components: array<ShadingComponent, MAX_COMPONENTS>,
};

struct ShadingComponent {
    method: u32,
    azimuth: f32,
    altitude: f32,
    contrast: f32,
    brightness: f32,
    weight: f32,
    color: vec4<f32>,
};

@group(0) @binding(0) var samp: sampler;

@group(0) @binding(1) var elev: texture_2d<f32>;

@group(0) @binding(2) var<uniform> shading: Shading;

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

const NUM_STOPS = 6u;

@fragment
fn fs_main(@builtin(position) pos: vec4<f32>) -> @location(0) vec4<f32> {
    let px = vec2<i32>(i32(pos.x + 2), i32(pos.y + 2));

    let elev = get_elev(px);

    // if true {
    //     return interpolate_color(
    //         array<f32, NUM_STOPS>(0, 300, 600, 900, 1200, 3000),
    //         array<vec4<f32>, NUM_STOPS>(
    //             vec4(0, 0, 1, 1),
    //             vec4(0, 1, 0, 1),
    //             vec4(1, 0, 0, 1),
    //             vec4(1, 1, 0, 1),
    //             vec4(1, 0, 1, 1),
    //             vec4(1, 1, 1, 1)
    //         ), elev
    //     );
    // }

    let nn = get_elev(px + vec2(-1, -1));
    let nz = get_elev(px + vec2(-1, 0));
    let np = get_elev(px + vec2(-1, 1));
    let zn = get_elev(px + vec2(0, -1));
    let zp = get_elev(px + vec2(0, 1));
    let pn = get_elev(px + vec2(1, -1));
    let pz = get_elev(px + vec2(1, 0));
    let pp = get_elev(px + vec2(1, 1));

    let dzdx = -nn + pn - 2.0 * nz + 2.0 * pz - np + pp;

    let dzdy = -nn - 2.0 * zn - pn + np + 2.0 * zp + pp;


    let meter_per_pixel = METER_PER_PIXEL_Z0 / f32(1 << shading.zoom) * 8;

    var normal = normalize(vec3(-dzdx / meter_per_pixel, -dzdy / meter_per_pixel, 1.0));

    normal = select(normal, vec3(0.0, 0.0, 1.0), sign(normal.z) == 0.0);

    var sum_rgb = vec3<f32>(0.0);
    var sum_alpha_weight = 0.0;
    var alpha_product = 1.0;

    for (var i = 0u; i < MAX_COMPONENTS && i < shading.component_count; i = i + 1u) {
        let component = shading.components[i];

        var intensity = 0.0;

        if component.method == 0u {
            // Igor
            var aspect_diff = abs(normalize_angle(atan2(normal.y, normal.x)) - normalize_angle(component.azimuth - HALF_PI));

            if aspect_diff > PI {
                aspect_diff = TAU - aspect_diff;
            }

            let aspect_strength = 1.0 - aspect_diff / PI;

            let slope_angle = acos(normal.z); // radians from vertical

            intensity = slope_angle / HALF_PI * 2.0 * aspect_strength;
        } else if component.method == 1u {
            // Oblique
            let zenith = HALF_PI - component.altitude;

            let light = vec3(
                sin(component.azimuth) * sin(zenith),
                -cos(component.azimuth) * sin(zenith),
                cos(zenith)
            );

            intensity = dot(normal, light);
        } else if component.method == 2u {
            intensity = acos(normal.z) / HALF_PI;
        } else if component.method == 3u {
            let zenith = HALF_PI - component.altitude;

            intensity = cos(zenith) * normal.z + sin(zenith) * length(normal.xy);
        }

        let modulated = component.contrast * (intensity - 0.5) + 0.5 + component.brightness;
        let alpha = component.color.a * modulated;
        let weighted_alpha = alpha * component.weight;

        sum_rgb = sum_rgb + weighted_alpha * component.color.rgb;
        sum_alpha_weight = sum_alpha_weight + weighted_alpha;
        alpha_product = alpha_product * (1.0 - weighted_alpha);
    }

    let rgb = select(sum_rgb / sum_alpha_weight, vec3(0.0), sum_alpha_weight == 0.0);

    let alpha = 1.0 - clamp(alpha_product, 0.0, 1.0);

    let rgb_p = clamp(rgb, vec3(0.0), vec3(1.0));

    let fg = vec4(rgb_p * alpha, alpha);

    let bg = shading.background_color;

    let out_rgb = fg.rgb * fg.a + bg.rgb * (1.0 - fg.a);
    let out_a = fg.a + bg.a * (1.0 - fg.a);

    return vec4(out_rgb, out_a);
}

fn interpolate_color(stops: array<f32, NUM_STOPS>, colors: array<vec4<f32>, NUM_STOPS>, t: f32) -> vec4<f32> {
    var i: u32 = 0u;

    loop {
        if i >= NUM_STOPS - 1u || t < stops[i + 1u] {
            break;
        }
        i = i + 1u;
    }

    let t0 = stops[i];
    let t1 = stops[i + 1u];
    let c0 = colors[i];
    let c1 = colors[i + 1u];
    let local_t = clamp((t - t0) / (t1 - t0), 0.0, 1.0);

    return mix(c0, c1, local_t);
}
