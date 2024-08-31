// jQuery for WhatsApp Ballon (Optional, if used)
$(document).ready(function() {
    $("#ackapa").click(function() {
        $(".trwpwhatsappballon").toggle(1000);
    });
    $("#kapatac").click(function() {
        $(".trwpwhatsappballon").toggle(1000);
    });
});

// Variables for text and canvas
const textBehind = document.getElementById('text-behind');
const textFront = document.getElementById('text-front');
const textBehindBlur = document.getElementById('text-behind-blur');
const canvasRect = document.getElementById('canvas');

// Parallax Scaling Values
const parallaxScaling1 = 0.0005; // Text scaling
const parallaxScaling2 = 0.00025; // Canvas scaling
const parallaxScaling3 = 0.0000001; // Camera rotation speed

// Scroll and animation values
let currentScroll = 0;
let targetScroll = 0;
let ease = 0.001;
let theta1 = 0;

// Update scale function
function updateScale() {
    let rect = canvasRect.getBoundingClientRect();
    let startScrollPosition = window.pageYOffset + rect.top;
    let endScrollPosition = window.pageYOffset + rect.bottom;

    if (targetScroll + window.innerHeight < startScrollPosition || targetScroll > endScrollPosition) {
        return;
    }

    currentScroll += (targetScroll - currentScroll) * ease;

    let scaleValue1 = 1 + (currentScroll * parallaxScaling1);
    let scaleValue2 = 1 + (currentScroll * parallaxScaling2);

    textBehind.style.transform = `scale(${scaleValue1})`;
    textFront.style.transform = `scale(${scaleValue1})`;
    textBehindBlur.style.transform = `scale(${scaleValue1})`;
    canvasRect.style.transform = `scale(${scaleValue2})`;

    theta1 += currentScroll * parallaxScaling3;

    setTimeout(updateScale, 1000 / 60); // approximately 60 times per second
}

window.addEventListener('scroll', () => {
    targetScroll = window.pageYOffset;
    updateScale();
});

updateScale();

// Three.js Setup
import * as THREE from 'https://cdn.skypack.dev/three@0.124.0';
import { RGBELoader } from 'https://cdn.skypack.dev/three@0.124.0/examples/jsm/loaders/RGBELoader.js';
import { OBJLoader } from 'https://cdn.skypack.dev/three@0.134.0/examples/jsm/loaders/OBJLoader.js';

// Renderer Setup
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas'), antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

// Scene Setup
const scene = new THREE.Scene();
const hdrEquirect = new RGBELoader()
    .setPath('https://raw.githubusercontent.com/miroleon/gradient_hdr_freebie/main/Gradient_HDR_Freebies/')
    .load('ml_gradient_freebie_01.hdr', function () {
        hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;
    });
scene.environment = hdrEquirect;
scene.fog = new THREE.FogExp2(0x2A6F8E, 0.15);

const group = new THREE.Group();
scene.add(group);

// Lights Setup
const pointlight = new THREE.PointLight(0x85ccb8, 7.5, 20);
pointlight.position.set(0, 3, 2);
group.add(pointlight);

const pointlight2 = new THREE.PointLight(0x9f85cc, 7.5, 20);
pointlight2.position.set(0, 3, 2);
group.add(pointlight2);

// Camera Setup
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 10;
group.add(camera);

// Material Setup
const material1 = new THREE.MeshStandardMaterial({
    color: 0x1fffff,
    roughness: 0,
    metalness: 0.5,
    envMapIntensity: 10
});

// Load 3D Model
const objloader = new OBJLoader();
objloader.load(
    'https://raw.githubusercontent.com/miroleon/peace-of-mind/main/assets/buddha.obj',
    (object) => {
        object.children[0].material = material1;
        object.scale.setScalar(20);
        object.position.set(0, -0.25, 0);
        group.add(object);
    }
);

// Resize Handler
window.addEventListener('resize', onWindowResize);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation Update Function
function update() {
    theta1 += 0.0025;

    camera.position.x = Math.sin(theta1) * 10;
    camera.position.z = Math.cos(theta1) * 10;
    camera.position.y = Math.cos(theta1);

    pointlight.position.x = Math.sin(theta1 + 1) * 11;
    pointlight.position.z = Math.cos(theta1 + 1) * 11;
    pointlight.position.y = 2 * Math.cos(theta1 - 3) + 3;

    pointlight2.position.x = -Math.sin(theta1 + 1) * 11;
    pointlight2.position.z = -Math.cos(theta1 + 1) * 11;
    pointlight2.position.y = 2 * -Math.cos(theta1 - 3) - 6;

    group.rotation.y += 0.01;
    camera.lookAt(0, 0, 0);
}

// Animation Loop
function animate() {
    update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
