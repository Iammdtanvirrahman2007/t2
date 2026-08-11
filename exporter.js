// ==========================================
// ModelForge 3D - GLTF Exporter Module
// ==========================================

import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

export function exportScene(scene) {
    return new Promise((resolve, reject) => {
        const exporter = new GLTFExporter();

        // Exclude helpers and non-mesh objects from export
        const options = {
            binary: true, // Export as .glb binary format
            trs: true,    // Include position, rotation, scale
            animations: [],
            excludeScenes: [],
            onlyVisible: true,
            embedImages: true,
            transform: (object) => {
                // Skip helper objects during export
                if (object.isGridHelper || object.isAxesHelper) {
                    return null;
                }
                return object;
            }
        };

        exporter.parse(
            scene,
            (gltfBuffer) => {
                console.log("📦 Scene successfully exported to GLTF binary buffer");
                resolve(gltfBuffer);
            },
            (error) => {
                console.error("An error occurred while exporting GLTF:", error);
                reject(error);
            },
            options
        );
    });
}
