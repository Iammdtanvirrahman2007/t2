// ==========================================
// ModelForge 3D - Scene Save & Load System
// ==========================================

import * as THREE from 'three';
import { clearSelection } from './selection.js';

// ==========================================
// 1. Save Scene to JSON (.json)
// ==========================================
export function handleSave(scene) {
    const sceneData = {
        version: 1.0,
        created: new Date().toISOString(),
        objects: []
    };

    scene.traverse((object) => {
        if (object.userData && object.userData.selectable === true) {
            const objData = {
                name: object.name || "Unnamed",
                type: object.geometry ? object.geometry.type : "BoxGeometry",
                position: object.position.toArray(),
                rotation: [object.rotation.x, object.rotation.y, object.rotation.z],
                scale: object.scale.toArray(),
                userData: object.userData
            };

            // Save material properties
            if (object.material) {
                objData.material = {
                    color: object.material.color ? object.material.color.getHexString() : "cccccc",
                    roughness: object.material.roughness ?? 0.4,
                    metalness: object.material.metalness ?? 0.1
                };
            }

            sceneData.objects.push(objData);
        }
    });

    const jsonString = JSON.stringify(sceneData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'scene.json';
    link.click();

    URL.revokeObjectURL(url);
    console.log("💾 Scene Saved Successfully");
    alert("Scene Saved as scene.json 📁");
}

// ==========================================
// 2. Load Scene from JSON (.json)
// ==========================================
export function handleLoad(scene) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';

    fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                
                // Clear existing selectable objects first[cite: 27]
                clearExistingObjects(scene);
                clearSelection();

                // Restore objects from JSON[cite: 27]
                if (data.objects && Array.isArray(data.objects)) {
                    data.objects.forEach(objData => {
                        restoreObject(objData, scene);
                    });
                }

                window.dispatchEvent(new CustomEvent('sceneUpdated', { detail: scene }));
                console.log("📂 Scene Loaded Successfully:", data);
                alert("Scene Loaded Successfully 🚀");
            } catch (err) {
                console.error("Failed to parse scene JSON:", err);
                alert("Failed to Load Scene ❌");
            }
        };
        reader.readAsText(file);
    };

    fileInput.click();
}

// Helper: Clear current scene objects before loading new ones[cite: 27]
function clearExistingObjects(scene) {
    const toRemove = [];
    scene.traverse((child) => {
        if (child.userData && child.userData.selectable === true) {
            toRemove.push(child);
        }
    });

    toRemove.forEach(obj => {
        scene.remove(obj);
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
    });
}

// Helper: Restore individual geometries and materials[cite: 27]
function restoreObject(objData, scene) {
    let geometry;
    switch (objData.type) {
        case 'SphereGeometry':
            geometry = new THREE.SphereGeometry(0.7, 32, 32);
            break;
        case 'CylinderGeometry':
            geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
            break;
        case 'ConeGeometry':
            geometry = new THREE.ConeGeometry(0.6, 1, 32);
            break;
        case 'PlaneGeometry':
            geometry = new THREE.PlaneGeometry(2, 2);
            break;
        case 'BoxGeometry':
        default:
            geometry = new THREE.BoxGeometry(1, 1, 1);
            break;
    }

    const matConfig = objData.material || {};
    const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(`#${matConfig.color || 'cccccc'}`),
        roughness: matConfig.roughness ?? 0.4,
        metalness: matConfig.metalness ?? 0.1
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = objData.name || "LoadedObject";
    
    if (objData.position) mesh.position.fromArray(objData.position);
    if (objData.rotation) mesh.rotation.set(...objData.rotation);
    if (objData.scale) mesh.scale.fromArray(objData.scale);

    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = objData.userData || { selectable: true, partType: "Mesh", category: "Primitive", mass: 1 };

    scene.add(mesh);
}
