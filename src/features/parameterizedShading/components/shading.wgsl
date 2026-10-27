const HALF_PI = radians(90.0);

const PI = radians(180.0);

const TAU = radians(360.0);

const EQUATOR_M: f32 = TAU * 6378137.0;

const NUM_STOPS = 16u;

struct Shading {
    component_count: u32,
    zoom: u32,
    tile_y: u32,
    _pad: f32,
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
    exaggeration: f32,
    color_count: u32,
    interval: f32,
    line_width: f32,
    _pad1: f32,
    _pad2: vec2<f32>,
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

// Height change per pixel, by Horn's method.
fn get_gradient(pos: vec2<i32>) -> vec2<f32> {
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

    return vec2(dzdx, dzdy) / 8.0;
}

fn get_normal(gradient: vec2<f32>, pos: vec2<i32>, exaggeration: f32) -> vec3<f32> {
    let g = gradient / (ground_px(pos.y) / exaggeration);

    let normal = normalize(vec3(-g.x, -g.y, 1.0));

    return select(normal, vec3(0.0, 0.0, 0.0), sign(normal.z) == 0.0);
}

// Ground size of a pixel shrinks with cos(latitude); the row's latitude comes
// from the tile's Web Mercator y. The texture is the tile plus a 2 px buffer.
fn ground_px(y: i32) -> f32 {
    let tiles = f32(1u << shading.zoom);

    let rows = f32(textureDimensions(elev, 0).y - 4u);

    let merc_y = PI * (1.0 - 2.0 * (f32(shading.tile_y) + (f32(y - 2) + 0.5) / rows) / tiles);

    let lat = atan(sinh(merc_y));

    return EQUATOR_M * cos(lat) / rows / tiles;
}

// How far the 5×5 neighbourhood's mean lies above the centre, per pixel of
// ground: positive in hollows, negative on ridges. Steady across zooms for sharp
// creases, growing with pixel size on smooth ground. NaN when any of it has no data.
fn get_curvature(pos: vec2<i32>, exaggeration: f32) -> f32 {
    var sum = 0.0;

    for (var dy = -2; dy <= 2; dy++) {
        for (var dx = -2; dx <= 2; dx++) {
            sum += get_elev(pos + vec2(dx, dy));
        }
    }

    let centre = get_elev(pos);

    return ((sum - centre) / 24.0 - centre) / ground_px(pos.y) * exaggeration;
}

@fragment
fn fs_main(@builtin(position) pos: vec4<f32>) -> @location(0) vec4<f32> {
    let pos2 = vec2<i32>(i32(pos.x + 2), i32(pos.y + 2));

    var elev = get_elev(pos2); // TODO make lazy-memo

    let is_nan = !(get_elev(pos2) < 0.0 || get_elev(pos2) > -1.0);

    if is_nan {
        elev = 0;
    }

    var sum_rgb = vec3<f32>(0.0);
    var sum_alpha = 0.0;
    var alpha_product = 1.0;

    // Read once, on the first layer that needs it.
    var gradient = vec2<f32>(0.0);

    var has_gradient = false;

    var normal = vec3(0.0, 0.0, 1.0);

    // Exaggeration the normal was computed with; reused while it stays the same.
    var normal_exaggeration = -1.0;

    for (var i = 0u; i < shading.component_count; i = i + 1u) {
        let component = shading.components[i];

        var intensity = 0.0;

        let needs_normal = component.method < 4u || component.method == 5u;

        if (needs_normal || component.method == 7u) && !has_gradient {
            gradient = get_gradient(pos2);

            has_gradient = true;
        }

        if !is_nan && needs_normal && component.exaggeration != normal_exaggeration {
            normal = get_normal(gradient, pos2, component.exaggeration);

            normal_exaggeration = component.exaggeration;

            if !(normal.x > -10.0 || normal.x < 10.0) {
                normal = vec3(0.0, 0.0, 1.0);
            }
        }

        var color: vec4<f32>;

        // hillshade-igor
        if component.method == 0u {
            var aspect_diff = abs(normalize_angle(atan2(normal.y, normal.x)) - normalize_angle(component.azimuth - HALF_PI));

            if aspect_diff > PI {
                aspect_diff = TAU - aspect_diff;
            }

            let aspect_strength = 1.0 - aspect_diff / PI;

            let slope_angle = acos(normal.z); // radians from vertical

            intensity = slope_angle / HALF_PI * 2.0 * aspect_strength;

            color = component.colors[0].color;
        // hillshade-classic
        } else if component.method == 1u {
            let zenith = HALF_PI - component.altitude;

            let light = vec3(
                sin(component.azimuth) * sin(zenith),
                -cos(component.azimuth) * sin(zenith),
                cos(zenith)
            );

            intensity = dot(normal, light);

            color = component.colors[0].color;
        // slope-igor
        } else if component.method == 2u {
            intensity = acos(normal.z) / HALF_PI;

            color = component.colors[0].color;
        // slope-classic
        } else if component.method == 3u {
            let zenith = HALF_PI - component.altitude;

            intensity = cos(zenith) * normal.z + sin(zenith) * length(normal.xy);

            color = component.colors[0].color;
        // color-relief
        } else if component.method == 4u {
            // Relief
            intensity = 1.0;

            color = interpolate_color(component.colors, component.color_count, elev);
        // aspect
        } else if component.method == 5u {
            intensity = 1.0;

            if normal.z > 0.9999     {
                color = vec4(0.0,0.0,0.0,0.0);
            } else {
                let angle = atan2(normal.x, -normal.y); // TODO maybe lazy-memo; but multiple such layers are barely possible

                let angle_0_2pi = select(angle, angle + TAU, angle < 0.0);

                color = interpolate_color(component.colors, component.color_count, angle_0_2pi);
            }
        // curvature
        } else if component.method == 6u {
            intensity = 1.0;

            let curvature = get_curvature(pos2, component.exaggeration);

            if curvature < 0.0 || curvature >= 0.0 {
                color = interpolate_color(component.colors, component.color_count, curvature);
            } else {
                color = vec4(0.0);
            }
        // contours
        } else if component.method == 7u {
            // Pixels to the nearest contour: its height away over the gradient.
            let off = abs(fract(elev / component.interval + 0.5) - 0.5) * component.interval;

            let px = off / length(gradient);

            // Antialiased over one pixel; NaN (no data, or flat on the line) draws nothing.
            intensity = select(0.0, clamp(component.line_width * 0.5 + 0.5 - px, 0.0, 1.0), !is_nan && px >= 0.0);

            color = component.colors[0].color;
        }

        // Contours take contrast and brightness on the line only, faded by its
        // antialiasing; off it they must stay clear, not tint or erase the tile.
        let modulated = select(
            component.contrast * (intensity - 0.5) + 0.5 + component.brightness,
            intensity * max(component.contrast * 0.5 + 0.5 + component.brightness, 0.0),
            component.method == 7u
        );

        let alpha = color.a * modulated;

        sum_rgb = sum_rgb + alpha * color.rgb;

        sum_alpha = sum_alpha + alpha;

        alpha_product = alpha_product * (1.0 - alpha);
    }

    let fg = vec4(
        select(
            clamp(sum_rgb / sum_alpha, vec3(0.0), vec3(1.0)),
            vec3(0.0),
            sum_alpha == 0.0
        ),
        1.0 - clamp(alpha_product, 0.0, 1.0)
    );

    let bg = shading.background_color;

    return vec4(
        fg.rgb * fg.a + bg.rgb * bg.a * (1.0 - fg.a),
        fg.a + bg.a * (1.0 - fg.a)
    );
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
