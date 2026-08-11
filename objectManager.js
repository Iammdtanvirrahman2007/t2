// ==========================================
// ModelForge 3D - Object & Primitive Manager
// ==========================================

import * as THREE from 'three';
import { selectObject } from './selection.js';

export const ObjectManager = {
    
    // Add Primitive Shapes to Scene (Blender Style)
    addPrimitive(type, scene) {
        let geometry, material, mesh;

        // Blender-style default metallic/roughness material
        material = new THREE.MeshStandardMaterial({
            color: 0xcccccc,
            roughness: 0.4,
            metalness: 0.1
        });

        switch (type) {
            case 'cube':
                geometry = new THREE.BoxGeometry(1, 1, 1);
                mesh = new THREE.Mesh(geometry, material);
                mesh.name = "Cube";
                break;
            case 'sphere':
                geometry = new THREE.SphereGeometry(0.7, 32, 32);
                mesh = new THREE.Mesh(geometry, material);
                mesh.name = "Sphere";
                break;
            case 'cylinder':
                geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
                mesh = new THREE.Mesh(geometry, material);
                mesh.name = "Cylinder";
                break;
            case 'cone':
                geometry = new THREE.ConeGeometry(0.6, 1, 32);
                mesh = new THREE.Mesh(geometry, material);
                mesh.name = "Cone";
                break;
            case 'plane':
                geometry = new THREE.PlaneGeometry(2, 2);
                mesh = new THREE.Mesh(geometry, material);
                mesh.rotation.x = -Math.PI / 2; // Flat on ground grid
                mesh.name = "Plane";
                break;
            default:
                console.warn("Unknown primitive type:", type);
                return;
        }

        // Set Default Position & Shadows
        mesh.position.set(0, 0.5, 0);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // Custom metadata for inspector and hierarchy tracking
        mesh.userData = {
            selectable: true,
            partType: "Mesh",
            category: "Primitive",
            mass: 1
        };

        scene.add(mesh);

        // Automatically select the newly created object
        selectObject(mesh);

        // Notify UI / Outliner to refresh
        window.dispatchEvent(new CustomEvent('sceneUpdated', { detail: scene }));

        console.log(`➕ Added Primitive: ${mesh.name}`);
    },

    // Remove Specific Object and Clean Memory
    removeObject(object, scene) {
        if (!object) return;

        scene.remove(object);
        
        // Dispose geometries and materials to prevent memory leaks
        object.traverse((child) => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(mat => mat.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });

        window.dispatchEvent(new CustomEvent('sceneUpdated', { detail: scene }));
        console.log(`🗑️ Removed Object: ${object.name}`);
    },

    // Clear All User Objects from Scene
    clearScene(scene) {
        const toRemove = [];
        scene.traverse((child) => {
            if (child.userData && child.userData.selectable === true) {
                toRemove.push(child);
            }
        });

        toRemove.forEach(obj => this.removeObject(obj, scene));
        console.log("🧹 Scene Cleared");
    }
};
