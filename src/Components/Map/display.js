import UnivList from '../../Data/UnivList.json';
import cachedData from './globe.geo.json'
import * as d3 from 'd3';

UnivList.forEach(univ => {
    univ.hash = ((univ.latitude + univ.longitude) % 1).toFixed(2);
});

// let cachedData = null;
let projection = null;
let canvas = null;
let ctx = null;
let animationId = null;
let container = null;

async function redraw() {
    console.log("redraw!")

    cancelAnimationFrame(animationId);

    let width = container.clientWidth;
    let height = container.clientHeight;

    let devicePixelRatio = window.devicePixelRatio || 1;

    if (canvas === null) {
        canvas = document.createElement("canvas");
        canvas.width = width * devicePixelRatio;
        canvas.height = height * devicePixelRatio;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        container.appendChild(canvas);
        ctx = canvas.getContext("2d");
        ctx.scale(devicePixelRatio, devicePixelRatio);
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    projection = d3.geoNaturalEarth1()
        .fitSize([width, height], cachedData);

    const path = d3.geoPath()
        .projection(projection)
        .context(ctx);

    ctx.fillStyle = "#243347";
    ctx.strokeStyle = "#405A80";

    ctx.globalAlpha = 1.0;
    ctx.filter = "none";
    cachedData.features.forEach(feature => {
        ctx.beginPath();
        path(feature);
        ctx.fill();
        ctx.stroke();
    });

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

export async function init_map(at_container) {
    console.log("init_map")
    if (animationId !== null) {
        cancelAnimationFrame(animationId);
    }
    container = at_container;
    container.style.background = '#1A1E24';
    const resizeObserver = new ResizeObserver(async entries => {
        const containerEntry = entries.find(entry => entry.target === container);
        if (containerEntry) {
            await redraw();
        }
    });
    resizeObserver.observe(container);
    await redraw();
}
