const HALF_PI = radians(90.0);

const PI = radians(180.0);

const TAU = radians(360.0);

// zoom 0 tile - meter per pixel
const METER_PER_PIXEL_Z0: f32 = (TAU * 6378137.0 * cos(radians(49.0))) / 256.0;

const NUM_STOPS = 16u;

struct Shading {
    component_count: u32,
    zoom: u32,
    _pad: vec2<f32>,
    background_color: vec4<f32>,
    components: array<ShadingComponent, 8>,
};

struct ColorStop {
    value: f32,
    _pad1: f32,
    _pad2: vec2<f32>,
    color: vec4<f32>,
}

struct ShadingComponent {
    method: u32,
    azimuth: f32,
    altitude: f32,
    contrast: f32,
    brightness: f32,
    color_count: u32,
    _pad: vec2<f32>,
    colors: array<ColorStop, NUM_STOPS>
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

fn get_normal(pos: vec2<i32>) -> vec3<f32> {
    let nn = get_elev(pos + vec2(-1, -1));
    let nz = get_elev(pos + vec2(-1, 0));
    let np = get_elev(pos + vec2(-1, 1));
    let zn = get_elev(pos + vec2(0, -1));
    let zp = get_elev(pos + vec2(0, 1));
    let pn = get_elev(pos + vec2(1, -1));
    let pz = get_elev(pos + vec2(1, 0));
    let pp = get_elev(pos + vec2(1, 1));

    let dzdx = -nn + pn - 2.0 * nz + 2.0 * pz - np + pp;

    let dzdy = -nn - 2.0 * zn - pn + np + 2.0 * zp + pp;

    let meter_per_pixel = METER_PER_PIXEL_Z0 / f32(1 << shading.zoom) * 8;

    let normal = normalize(vec3(-dzdx / meter_per_pixel, -dzdy / meter_per_pixel, 1.0));

    return select(normal, vec3(0.0, 0.0, 1.0), sign(normal.z) == 0.0);
}

@fragment
fn fs_main(@builtin(position) pos: vec4<f32>) -> @location(0) vec4<f32> {
    let pos2 = vec2<i32>(i32(pos.x + 2), i32(pos.y + 2));

    let elev = get_elev(pos2); // TODO make lazy-memo

    var sum_rgb = vec3<f32>(0.0);
    var sum_alpha = 0.0;
    var alpha_product = 1.0;

    var normal = vec3<f32>(0.0);

    for (var i = 0u; i < shading.component_count; i = i + 1u) {
        let component = shading.components[i];

        var intensity = 0.0;

        if component.method != 4u && all(normal == vec3<f32>(0.0)) {
            normal = get_normal(pos2);
        }

        var color: vec4<f32>;

        if component.method == 0u {
            // Igor
            var aspect_diff = abs(normalize_angle(atan2(normal.y, normal.x)) - normalize_angle(component.azimuth - HALF_PI));

            if aspect_diff > PI {
                aspect_diff = TAU - aspect_diff;
            }

            let aspect_strength = 1.0 - aspect_diff / PI;

            let slope_angle = acos(normal.z); // radians from vertical

            intensity = slope_angle / HALF_PI * 2.0 * aspect_strength;

            color = component.colors[0].color;
        } else if component.method == 1u {
            // Oblique
            let zenith = HALF_PI - component.altitude;

            let light = vec3(
                sin(component.azimuth) * sin(zenith),
                -cos(component.azimuth) * sin(zenith),
                cos(zenith)
            );

            intensity = dot(normal, light);

            color = component.colors[0].color;
        } else if component.method == 2u {
            intensity = acos(normal.z) / HALF_PI;

            color = component.colors[0].color;
        } else if component.method == 3u {
            let zenith = HALF_PI - component.altitude;

            intensity = cos(zenith) * normal.z + sin(zenith) * length(normal.xy);

            color = component.colors[0].color;
        } else if component.method == 4u {
            // Relief
            intensity = 1.0;

            color = interpolate_color(component.colors, component.color_count, elev);
        } else if component.method == 5u {
            // Aspect
            intensity = 1.0;

            let angle = atan2(normal.x, -normal.y); // TODO maybe lazy-memo; but multiple such layers are barely possible

            let angle_0_2pi = select(angle, angle + TAU, angle < 0.0);

            color = interpolate_color(component.colors, component.color_count, angle_0_2pi);
        }

        let modulated = component.contrast * (intensity - 0.5) + 0.5 + component.brightness;

        let alpha = color.a * modulated;

        sum_rgb = sum_rgb + alpha * color.rgb;

        sum_alpha = sum_alpha + alpha;

        alpha_product = alpha_product * (1.0 - alpha);
    }

    let rgb = select(sum_rgb / sum_alpha, vec3(0.0), sum_alpha == 0.0);

    let alpha = 1.0 - clamp(alpha_product, 0.0, 1.0);

    let rgb_p = clamp(rgb, vec3(0.0), vec3(1.0));

    let fg = vec4(rgb_p * alpha, alpha);

    let bg = shading.background_color;

    let out_rgb = fg.rgb * fg.a + bg.rgb * (1.0 - fg.a);

    let out_a = fg.a + bg.a * (1.0 - fg.a);

    return vec4(out_rgb, out_a);
}

fn interpolate_color(stops: array<ColorStop, NUM_STOPS>, count: u32, t: f32) -> vec4<f32> {
    if count == 0 {
        return vec4<f32>(0.0, 0.0, 0.0, 0.0);
    }

    if count == 1 || t < stops[0].value {
        return stops[0].color;
    }

    var i = 0u;

    loop {
        let s1 = stops[i + 1];

        if t < s1.value {
            let s0 = stops[i];

            return mix(s0.color, s1.color, (t - s0.value) / (s1.value - s0.value));
        }

        i = i + 1;

        if i == count - 1 {
            return stops[i].color;
        }
    }

    // unreachable fallback to satisfy validator
    return vec4<f32>(0.0, 0.0, 0.0, 0.0);
}
