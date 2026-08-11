// ==========================================
// ModelForge 3D - Main Entry Module
// ==========================================

import { initScene, scene, camera, renderer } from './scene.js';
import { setupLights } from './lights.js';
import { initTransformControls, setTransformMode } from './transform.js';
import { initSelection } from './selection.js';
import { handleLoad, handleSave } from './load.js'; // Assuming save/load logic
import { setupUpload } from './upload.js';
import { setupImporter } from './importer.js';
import { ObjectManager } from './objectManager.js';

// Initialize Core Systems
document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 Initializing ModelForge 3D Workspace...");

    // 1. Initialize Three.js Scene & Renderer
    initScene();
    
    // 2. Setup Lighting (World/Environment)
    setupLights(scene);
    
    // 3. Initialize Core Tools
    initTransformControls(scene, camera, renderer.domElement);
    initSelection(scene, camera, renderer.domElement);
    
    // 4. Setup File Operations
    setupFileOperations();

    // 5. Setup UI Event Listeners (Blender Style)
    setupUIControls();
    setupPropertyTabs();
    setupShadingModes();

    // Setup Custom .rkp Export
    setupUpload(scene);
});

// ==========================================
// UI Control Bindings
// ==========================================

function setupUIControls() {
    // Transform Tools Overlay
    const tools = {
        'moveBtn': 'translate',
        'rotateBtn': 'rotate',
        'scaleBtn': 'scale'
    };

    for (const [id, mode] of Object.entries(tools)) {
        document.getElementById(id)?.addEventListener('click', (e) => {
            // Update Active Class
            Object.keys(tools).forEach(btnId => document.getElementById(btnId).classList.remove('active'));
            e.currentTarget.classList.add('active');
            
            // Set Transform Mode
            setTransformMode(mode);
        });
    }

    // Keyboard Shortcuts (W, E, R for Transform)
    window.addEventListener('keydown', (e) => {
        switch(e.key.toLowerCase()) {
            case 'w': document.getElementById('moveBtn')?.click(); break;
            case 'e': document.getElementById('rotateBtn')?.click(); break;
            case 'r': document.getElementById('scaleBtn')?.click(); break;
        }
    });

    // Primitive Shapes Binding
    const primitives = ['cubeBtn', 'sphereBtn', 'cylinderBtn', 'coneBtn', 'planeBtn'];
    primitives.forEach(id => {
        document.getElementById(id)?.addEventListener('click', () => {
            const shapeType = id.replace('Btn', '');
            ObjectManager.addPrimitive(shapeType, scene);
        });
    });

    // Snapping Toggle
    const snapBtn = document.getElementById('snapBtn');
    if(snapBtn) {
        snapBtn.addEventListener('click', (e) => {
            const isActive = e.currentTarget.classList.toggle('active');
            e.currentTarget.innerHTML = isActive ? 
                '<i class="fa-solid fa-magnet"></i> Snap On' : 
                '<i class="fa-solid fa-magnet"></i> Snap Off';
            // Toggle Snap Logic in transform.js
            window.dispatchEvent(new CustomEvent('toggleSnap', { detail: isActive }));
        });
    }
}

// ==========================================
// Viewport Shading Modes
// ==========================================

function setupShadingModes() {
    const shadingBtns = ['wireframeModeBtn', 'solidModeBtn', 'materialModeBtn', 'renderedModeBtn'];
    
    shadingBtns.forEach(id => {
        document.getElementById(id)?.addEventListener('click', (e) => {
            shadingBtns.forEach(btnId => document.getElementById(btnId).classList.remove('active'));
            e.currentTarget.classList.add('active');
            
            const mode = id.replace('ModeBtn', '');
            window.dispatchEvent(new CustomEvent('changeShading', { detail: mode }));
        });
    });
}

// ==========================================
// Properties Panel Tabs (Blender Style)
// ==========================================

function setupPropertyTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            // Remove active from all
            tabs.forEach(t => t.classList.remove('active'));
            // Add to current
            e.currentTarget.classList.add('active');
            
            const tabName = e.currentTarget.dataset.tab;
            // Dispatch event to update Inspector UI based on active tab
            window.dispatchEvent(new CustomEvent('tabChanged', { detail: tabName }));
        });
    });
}

// ==========================================
// File Operations
// ==========================================

function setupFileOperations() {
    document.getElementById('newBtn')?.addEventListener('click', handleLoad);
    document.getElementById('saveBtn')?.addEventListener('click', () => handleSave(scene));
    
    // Import GLTF/GLB setup
    setupImporter(scene);
}
