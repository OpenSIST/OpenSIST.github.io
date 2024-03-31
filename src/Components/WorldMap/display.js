import UnivList from '../../Data/UnivList.json';
import cachedData from './globe.geo.json'
import * as d3 from 'd3';
import plane_svg from './airplane_light.svg';

UnivList.forEach(univ => {
    univ.hash = ((univ.latitude + univ.longitude) % 1).toFixed(2);
});

let projection = null;
let canvas = null;
let ctx = null;
let animationId = null;
let width = null;
let height = null;

let flights = [];
let lastTimestamp = Date.now();
let img = new Image();
img.src = String(plane_svg);


// Settings
const shanghai = [121.48, 31.13];
const longest_tail = 16000;
const color = {
    'light': {
        'country_fill': '#E1E3E5',
        'country_border': '#969799'
    },
    'dark': {
        'country_fill': '#243347',
        'country_border': '#405A80'
    },
}

function drawMap(static_container, mode) {
    const static_ctx = static_container.getContext("2d");
    static_ctx.clearRect(0, 0, static_container.width, static_container.height);

    projection = d3.geoNaturalEarth1()
        .fitSize([width, height], cachedData);

    const path = d3.geoPath()
        .projection(projection)
        .context(static_ctx);

    static_ctx.fillStyle = color[mode].country_fill;
    static_ctx.strokeStyle = color[mode].country_border;

    static_ctx.globalAlpha = 1.0;
    static_ctx.filter = "none";
    cachedData.features.forEach(feature => {
        static_ctx.beginPath();
        path(feature);
        static_ctx.fill();
        static_ctx.stroke();
    });
}

/**
 * Based on snap.svg bezlen() function
 * https://github.com/adobe-webplatform/Snap.svg/blob/master/dist/snap.svg.js#L5786
 */
function cubicBezierLength(p0, cp1, cp2, p, t = 1) {
    if (t === 0) {
        return 0;
    }
    const base3 = (t, p1, p2, p3, p4) => {
        let t1 = -3 * p1 + 9 * p2 - 9 * p3 + 3 * p4,
            t2 = t * t1 + 6 * p1 - 12 * p2 + 6 * p3;
        return t * t2 - 3 * p1 + 3 * p2;
    };
    t = t > 1 ? 1 : t < 0 ? 0 : t;
    let t2 = t / 2;
    let Tvalues = [-.1252, .1252, -.3678, .3678, -.5873, .5873, -.7699, .7699, -.9041, .9041, -.9816, .9816];
    let Cvalues = [0.2491, 0.2491, 0.2335, 0.2335, 0.2032, 0.2032, 0.1601, 0.1601, 0.1069, 0.1069, 0.0472, 0.0472];


    let n = Tvalues.length;
    let sum = 0;
    for (let i = 0; i < n; i++) {
        let ct = t2 * Tvalues[i] + t2,
            xbase = base3(ct, p0[0], cp1[0], cp2[0], p[0]),
            ybase = base3(ct, p0[1], cp1[1], cp2[1], p[1]),
            comb = xbase * xbase + ybase * ybase;
        sum += Cvalues[i] * Math.sqrt(comb);
    }
    return t2 * sum;
}

function drawFlight(ctx, projection, flight, fps) {
    flight.progress += (10 + 0.001 * flight.total) * (60 / fps);
    const gradient_start_position = projection(shanghai);
    const flight_end_position = projection([flight.longitude, flight.latitude]);

    const gradient_end_progress = flight.progress / flight.total;
    const gradient_end_position = [
        gradient_start_position[0] + (flight_end_position[0] - gradient_start_position[0]) * gradient_end_progress,
        gradient_start_position[1] + (flight_end_position[1] - gradient_start_position[1]) * gradient_end_progress
    ];
    const gradient_tail_progress = (flight.progress - longest_tail) / flight.total;
    const gradient_tail_position = [
        gradient_start_position[0] + (flight_end_position[0] - gradient_start_position[0]) * gradient_tail_progress,
        gradient_start_position[1] + (flight_end_position[1] - gradient_start_position[1]) * gradient_tail_progress
    ];
    const linear_gradient = ctx.createLinearGradient(...gradient_end_position, ...gradient_tail_position);
    linear_gradient.addColorStop(0, "rgba(255, 172, 41, 1)");
    linear_gradient.addColorStop(1, "rgba(255, 172, 41, 0)");

    // Create a mapping, [360, 0] => shanghai, [0, 0] => flight_end_position
    const coord_x = [
        (gradient_start_position[0] - flight_end_position[0]) / 360,
        (gradient_start_position[1] - flight_end_position[1]) / 360
    ];
    const coord_y = [-coord_x[1], coord_x[0]];

    function get_position([x, y]) {
        return [
            flight_end_position[0] + coord_x[0] * x + coord_y[0] * y,
            flight_end_position[1] + coord_x[1] * x + coord_y[1] * y
        ];
    }

    const control_point_1_coord = get_position([260, 40]);
    const control_point_2_coord = get_position([100, 40]);

    function get_position_slope(t) {
        const t_3_0 = (1 - t) ** 3;
        const t_3_1 = 3 * (1 - t) ** 2 * t;
        const t_3_2 = 3 * (1 - t) * t ** 2;
        const t_3_3 = t ** 3;
        const position = [
            t_3_0 * gradient_start_position[0] + t_3_1 * control_point_1_coord[0] + t_3_2 * control_point_2_coord[0] + t_3_3 * flight_end_position[0],
            t_3_0 * gradient_start_position[1] + t_3_1 * control_point_1_coord[1] + t_3_2 * control_point_2_coord[1] + t_3_3 * flight_end_position[1]
        ]
        const t_2_0 = -3 * (1 - t) ** 2;
        const t_2_1 = 3 * (1 - 4 * t + 3 * t ** 2);
        const t_2_2 = 3 * (2 * t - 3 * t ** 2);
        const t_2_3 = 3 * t ** 2;
        const direction = Math.atan2(
            -(t_2_0 * gradient_start_position[1] + t_2_1 * control_point_1_coord[1] + t_2_2 * control_point_2_coord[1] + t_2_3 * flight_end_position[1]),
            -(t_2_0 * gradient_start_position[0] + t_2_1 * control_point_1_coord[0] + t_2_2 * control_point_2_coord[0] + t_2_3 * flight_end_position[0])
        );
        return [position, direction];
    }

    const distance = cubicBezierLength(
        gradient_start_position,
        control_point_1_coord,
        control_point_2_coord,
        flight_end_position,
        (flight.total - flight.progress) / flight.total
    );

    ctx.save();
    ctx.setLineDash([3400]);
    ctx.lineDashOffset = -distance;
    ctx.strokeStyle = linear_gradient;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(...flight_end_position);
    ctx.bezierCurveTo(...control_point_2_coord, ...control_point_1_coord, ...projection([shanghai[0], shanghai[1]]));
    ctx.stroke();
    ctx.restore();

    const plane_position = flight.progress / flight.total;
    const [[x1, y1], direction] = get_position_slope(Math.min(1, plane_position));
    const opacity = Math.max(0, Math.min(1, 1 - (flight.progress - flight.total) / longest_tail));
    return [x1, y1, direction, opacity, flight.total !== 1];
}

function lightModeRedraw() {
    for (let i = 0; i < flights.length; i++) {
        if (flights[i].progress >= flights[i].total + longest_tail) {
            flights[i].progress = 0;
            const new_flight = UnivList[Math.floor(Math.random() * UnivList.length)];
            flights[i].latitude = new_flight.latitude;
            flights[i].longitude = new_flight.longitude;
            const longitude = flights[i].longitude < 0 ? flights[i].longitude + 360 : flights[i].longitude;
            flights[i].total = (flights[i].latitude - shanghai[1]) ** 2 + (longitude - shanghai[0]) ** 2;
        }
    }

    const now = Date.now();
    const fps = 1000 / (now - lastTimestamp);
    lastTimestamp = now;

    const all_plane_info = flights.map(flight => {
        return drawFlight(ctx, projection, flight, fps);
    });

    all_plane_info.forEach(plane_info => {
        const [x, y, direction, opacity, display] = plane_info;
        if (display) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(direction);
            ctx.globalAlpha = opacity;
            const proportion = width / 1700;
            ctx.drawImage(img, -10 * proportion, -10 * proportion, 20 * proportion, 20 * proportion);
            ctx.restore();
        }
    });

    const [x1, y1] = projection(shanghai);
    ctx.beginPath();
    ctx.arc(x1, y1, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "#FF2600";
    ctx.fill();
}

function darkModeRedraw() {
    UnivList.forEach(univ => {
        const [x, y] = projection([univ.longitude, univ.latitude]);
        const speed = 0.001 + univ.hash * 0.001;
        univ.size = Math.abs(Math.sin((Date.now() + univ.hash * 1000) * speed)) * 4 + 3;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(x, y, univ.size, 0, 2 * Math.PI);

        let gradient = ctx.createRadialGradient(x, y, 0, x, y, univ.size);
        gradient.addColorStop(1.0, 'rgba(255, 183, 64, 0.00155)');
        gradient.addColorStop(0.8, 'rgba(255, 183, 64, 0.12185)');
        gradient.addColorStop(0.6, 'rgba(255, 183, 64, 0.35375)');
        gradient.addColorStop(0.4, 'rgba(255, 183, 64, 0.57965)');
        gradient.addColorStop(0.2, 'rgba(255, 183, 64, 0.68195)');
        gradient.addColorStop(0.0, 'rgba(255, 183, 64, 0.70000)');

        ctx.fillStyle = gradient;
        ctx.fill();
    });
}

function redraw(mode) {
    cancelAnimationFrame(animationId);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (mode === 'light') {
        lightModeRedraw();
    } else {
        darkModeRedraw();
    }

    animationId = requestAnimationFrame(redraw.bind(null, mode));
}

function init_canvas(container) {
    let devicePixelRatio = window.devicePixelRatio || 1;
    container.width = width * devicePixelRatio;
    container.height = height * devicePixelRatio;
    container.style.width = `${width}px`;
    container.style.height = `${height}px`;
    container.getContext("2d").scale(devicePixelRatio, devicePixelRatio);
}

export function init_map(static_container, dynamic_container, with_width, with_height, mode) {
    if (animationId !== null) {
        cancelAnimationFrame(animationId);
    }
    canvas = dynamic_container;
    const resizeObserver = new ResizeObserver(async entries => {
        const containerEntry = entries.find(entry => entry.target === canvas);
        if (containerEntry) {
            drawMap(static_container, mode);
            redraw(mode);
        }
    });
    resizeObserver.observe(canvas);

    width = with_width;
    height = with_height;
    init_canvas(static_container);
    init_canvas(dynamic_container);
    ctx = canvas.getContext("2d");
    if (flights.length === 0) {
        flights = Array.from({length: 5}, () => {
            return {
                latitude: 31.13,
                longitude: 121.48,
                total: 1,
                progress: (1 - Math.random() / 5) * longest_tail
            }
        });
    }
    drawMap(static_container, mode);
    redraw(mode);
}
