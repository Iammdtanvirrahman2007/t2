// ==========================================
// ModelForge 3D - GLTF/GLB Model Importer
// ==========================================

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { selectObject } from './selection.js';

export function setupImporter(scene) {
    const importBtn = document.getElementById('importBtn');
    const fileInput = document.getElementById('fileInput');

    if (!importBtn || !fileInput) return;

    // Trigger hidden file input on menu click
    importBtn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (event) {
            const contents = event.target.result;

            const loader = new GLTFLoader();
            loader.parse(contents, '', (gltf) => {
                const model = gltf.scene;
                model.name = file.name.replace(/\.[^/.]+$/, "");

                // Process meshes for shadows, color spaces, and selection metadata
                model.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;

                        // Fix texture color spaces for accurate rendering
                        if (child.material) {
                            if (child.material.map) child.material.map.colorSpace = THREE.SRGBColorSpace;
                            if (child.material.emissiveMap) child.material.emissiveMap.colorSpace = THREE.SRGBColorSpace;
                            child.material.needsUpdate = true;
                        }
                    }

                    // Assign selectable properties for inspector/raycasting compatibility
                    child.userData = {
                        selectable: true,
                        partType: "ImportedMesh",
                        category: "Model",
                        mass: 1
                    };
                });

                // Center/Position model in the viewport
                model.position.set(0, 0, 0);
                
                scene.add(model);
                selectObject(model);

                // Dispatch event to refresh UI/Outliner
                window.dispatchEvent(new CustomEvent('sceneUpdated', { detail: scene }));

                console.log("📦 Model Imported Successfully:", model.name);
                alert("Model Imported Successfully 🚀");

                // Clear file input value to allow re-importing the same file if needed
                fileInput.value = '';
            }, (error) => {
                console.error("An error happened during GLTF parsing:", error);
                alert("Import Failed ❌");
            });
        };

        reader.readAsArrayBuffer(file);
    });

    console.log("📥 Importer System Initialized");
}
