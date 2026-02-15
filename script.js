// ------------------------------------------------------------
// IMPORTS
// ------------------------------------------------------------
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';

// ------------------------------------------------------------
// GUI PANEL
// ------------------------------------------------------------
const gui = new GUI();

// ------------------------------------------------------------
// SCENE & CANVAS
// ------------------------------------------------------------
const canvas = document.querySelector('.webgl');
const scene = new THREE.Scene();
scene.fog = new THREE.Fog('#262837', 4, 50);  

// ------------------------------------------------------------
// CAMERA
// ------------------------------------------------------------
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 22, 22);
scene.add(camera);

// ------------------------------------------------------------
// RENDERER + SHADOWS
// ------------------------------------------------------------
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor('#262837');
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// ------------------------------------------------------------
// ORBIT CONTROLS
// ------------------------------------------------------------
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// ------------------------------------------------------------
// TEXTURES
// ------------------------------------------------------------
const loader = new THREE.TextureLoader();

// Door
const doorColor = loader.load('./textures/wooden_garage_door_diff_4k.jpg');
doorColor.colorSpace = THREE.SRGBColorSpace;
const doorDisp = loader.load('./textures/wooden_garage_door_disp_4k.png');

// Walls
const brick = loader.load('./textures/broken_brick_wall_diff_4k.jpg');
brick.colorSpace = THREE.SRGBColorSpace;
brick.wrapS = brick.wrapT = THREE.RepeatWrapping;
brick.repeat.set(2, 1);

// Roof
const roofTex = loader.load('./textures/clay_roof_tiles_02_diff_4k.jpg');
roofTex.colorSpace = THREE.SRGBColorSpace;

// Grass (no displacement for stable shadow)
const ground = loader.load('./textures/forrest_ground_01_diff_4k.jpg');
ground.colorSpace = THREE.SRGBColorSpace;
ground.wrapS = ground.wrapT = THREE.RepeatWrapping;
ground.repeat.set(6, 6);

// ------------------------------------------------------------
// HOUSE GROUP
// ------------------------------------------------------------
const house = new THREE.Group();
scene.add(house);

// Walls
const walls = new THREE.Mesh(
    new THREE.BoxGeometry(10, 6, 10),
    new THREE.MeshStandardMaterial({ map: brick, roughness: 0.5, metalness: 0.1 })
);
walls.position.y = 3;
walls.castShadow = true;
walls.receiveShadow = true;
house.add(walls);

// Roof
const roof = new THREE.Mesh(
    new THREE.ConeGeometry(10, 6, 4),
    new THREE.MeshStandardMaterial({ map: roofTex })
);
roof.position.y = 9;
roof.rotation.y = Math.PI * 0.25;
roof.castShadow = true;
house.add(roof);

// Door
const door = new THREE.Mesh(
    new THREE.PlaneGeometry(6, 3, 100, 100),
    new THREE.MeshStandardMaterial({
        map: doorColor,
        displacementMap: doorDisp,
        displacementScale: 0.22,
        roughness: 0.6,
        metalness: 0.15
    })
);
door.position.set(0, 1.5, 5.01);
door.material.side = THREE.DoubleSide;
door.castShadow = true;
house.add(door);

// ------------------------------------------------------------
// BUSHES
// ------------------------------------------------------------
const bushGeo = new THREE.SphereGeometry(0.9, 16, 16);
const bushMat = new THREE.MeshStandardMaterial({ color: '#89c854' });

function bush(x, y, z, scale = 1) {
    const b = new THREE.Mesh(bushGeo, bushMat);
    b.position.set(x, y, z);
    b.scale.set(scale, scale, scale);
    b.castShadow = true;
    house.add(b);
}
bush(3, 0.9, 6);
bush(4, 0.6, 5.5, 0.75);
bush(-3, 0.9, 6);
bush(-4, 0.6, 5.5, 0.75);

// ------------------------------------------------------------
// GRAVESTONES
// ------------------------------------------------------------
const graves = new THREE.Group();
scene.add(graves);

const graveGeo = new THREE.BoxGeometry(0.6, 2, 2);
const graveMat = new THREE.MeshStandardMaterial({ color: '#6b6b6b', roughness: 1 });

for (let i = 0; i < 50; i++) {
    const angle = Math.random() * Math.PI * 2 + 0.6;
    const radius = 14 + Math.random() * 6;
    const x = Math.sin(angle) * radius;
    const z = Math.cos(angle) * radius;
    const g = new THREE.Mesh(graveGeo, graveMat);
    g.position.set(x, 1, z);
    g.rotation.y = (Math.random() - 0.5) * 0.4;
    g.rotation.z = (Math.random() - 0.5) * 0.4;
    g.castShadow = true;
    graves.add(g);
}

// ------------------------------------------------------------
// FLOOR + SHADOW PLANE
// ------------------------------------------------------------
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshStandardMaterial({
        map: ground,
        roughness: 0.9
    })
);
floor.rotation.x = -Math.PI * 0.5;
floor.receiveShadow = true;
scene.add(floor);

const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.ShadowMaterial({ opacity: 0.35 })
);
shadowPlane.rotation.x = -Math.PI * 0.5;
shadowPlane.position.y = 0.06; // lifted for non-flicker shadow
shadowPlane.receiveShadow = true;
scene.add(shadowPlane);

// ------------------------------------------------------------
// LIGHTS
// ------------------------------------------------------------
const ambient = new THREE.AmbientLight('#b9d5ff', 0.12);
scene.add(ambient);

const moon = new THREE.DirectionalLight('#b9d5ff', 0.12);
moon.position.set(4, 5, -2);
moon.castShadow = true;
moon.shadow.mapSize.set(1024, 1024);
scene.add(moon);

// Door lights
const dl1 = new THREE.PointLight('#ff7d46', 7, 7);
dl1.position.set(2.2, 3.3, 6.7);
dl1.castShadow = true;

const dl2 = new THREE.PointLight('#ff7d46', 7, 7);
dl2.position.set(-2.2, 3.3, 6.7);
dl2.castShadow = true;
house.add(dl1, dl2);

// Ghost lights
const ghost1 = new THREE.PointLight('#ff00ff', 6, 15);
const ghost2 = new THREE.PointLight('#00ffff', 6, 15);
const ghost3 = new THREE.PointLight('#ffff00', 6, 15);
ghost1.castShadow = ghost2.castShadow = ghost3.castShadow = true;

ghost1.shadow.mapSize.set(1024, 1024);
ghost2.shadow.mapSize.set(1024, 1024);
ghost3.shadow.mapSize.set(1024, 1024);
scene.add(ghost1, ghost2, ghost3);

// ------------------------------------------------------------
// ANIMATION
// ------------------------------------------------------------
const clock = new THREE.Clock();

function tick() {
    const t = clock.getElapsedTime();

    ghost1.position.set(Math.cos(t * 0.2) * 16, Math.sin(t * 3) + 2, Math.sin(t * 0.2) * 16);
    ghost2.position.set(Math.cos(t * 0.4) * 10, Math.sin(t * 4) + 2, Math.sin(t * 0.4) * 12);
    ghost3.position.set(Math.cos(-t * 0.3) * (12 + Math.sin(t * 0.32)), Math.sin(t * 4) + 2, Math.sin(-t * 0.3) * (12 + Math.sin(t * 0.5)));

    // Dynamic fog
    scene.fog.near = 3 + Math.sin(t * 0.25) * 0.6;
    scene.fog.far = 45 + Math.sin(t * 0.15) * 2.5;

    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
}
tick();

// ------------------------------------------------------------
// RESIZE
// ------------------------------------------------------------
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// hey i am just practicing the use of git revert "mai yeha double inverted comma me likh rha hu lekin eaisa nhi likhna hota hai direct likhna hoga kya -> commit id-> yeh jo humne update kiya hai wo delete ho jayega comment me"
