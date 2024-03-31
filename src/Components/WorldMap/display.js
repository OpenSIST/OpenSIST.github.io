import UnivList from '../../Data/UnivList.json';
import cachedData from './globe.geo.json'
import * as d3 from 'd3';

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
img.src = "airplane_light.svg";

async function drawMap(static_container) {
    const static_ctx = static_container.getContext("2d");
    static_ctx.clearRect(0, 0, static_container.width, static_container.height);

    projection = d3.geoNaturalEarth1()
        .fitSize([width, height], cachedData);

    const path = d3.geoPath()
        .projection(projection)
        .context(static_ctx);

    static_ctx.fillStyle = "#243347";
    static_ctx.strokeStyle = "#405A80";

    static_ctx.globalAlpha = 1.0;
    static_ctx.filter = "none";
    cachedData.features.forEach(feature => {
        static_ctx.beginPath();
        path(feature);
        static_ctx.fill();
        static_ctx.stroke();
    });
}

function redraw() {
    cancelAnimationFrame(animationId);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

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

    animationId = requestAnimationFrame(redraw);
}

function init_canvas(container) {
    let devicePixelRatio = window.devicePixelRatio || 1;
    container.width = width * devicePixelRatio;
    container.height = height * devicePixelRatio;
    container.style.width = `${width}px`;
    container.style.height = `${height}px`;
    container.getContext("2d").scale(devicePixelRatio, devicePixelRatio);
}

export function init_map(static_container, dynamic_container, with_width, with_height) {
    if (animationId !== null) {
        cancelAnimationFrame(animationId);
    }
    canvas = dynamic_container;
    const resizeObserver = new ResizeObserver(async entries => {
        const containerEntry = entries.find(entry => entry.target === canvas);
        if (containerEntry) {
            drawMap(static_container);
            redraw();
        }
    });
    resizeObserver.observe(canvas);

    width = with_width;
    height = with_height;
    init_canvas(static_container);
    init_canvas(dynamic_container);
    ctx = canvas.getContext("2d");
    drawMap(static_container);
    redraw();
}
