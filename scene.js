// ==========================================
// ModelForge 3D - Scene & Viewport Environment
// ==========================================

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export let scene, camera, renderer, controls;

export function initScene() {
    const container = document.getElementById('app');
    if (!container) return;

    // 1. Create Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1e1e1e); // Blender dark viewport background

    // 2. Create Camera (Perspective)
    camera = new THREE.PerspectiveCamera(
        45, 
        container.clientWidth / container.clientHeight, 
        0.1, 
        1000
    );
    camera.position.set(5, 5, 5);

    // 3. Create WebGL Renderer (Blender high-quality settings)
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    
    container.appendChild(renderer.domElement);

    // 4. Orbit Controls (Blender navigation style)
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = true;

    // 5. Add Grid & Axes Helper (Blender Studio Grid)
    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x2c2c2c);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // 6. Add a Default Starting Cube (Blender Default Scene)
    addDefaultCube();

    // 7. Handle Window Resize
    window.addEventListener('resize', onWindowResize);

    // 8. Start Animation Loop
    animate();

    console.log("🎬 Scene Initialized Successfully");
}

function addDefaultCube() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        roughness: 0.4,
        metalness: 0.1
    });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, 0.5, 0);
    cube.castShadow = true;
    cube.receiveShadow = true;
    cube.name = "Cube_Default";
    
    // Set custom metadata for inspector/selection compatibility
    cube.userData = {
        selectable: true,
        partType: "Mesh",
        category: "Primitive",
        mass: 1
    };

    scene.add(cube);
}

function onWindowResize() {
    const container = document.getElementById('app');
    if (!container) return;

    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// Render Loop
function animate() {
    requestAnimationFrame(animate);

    controls.update();
    renderer.render(scene, camera);
}
