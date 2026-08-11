// ==========================================
// ModelForge 3D - Rocket Part (.rkp) Exporter
// ==========================================

import { exportScene } from "./exporter.js";

export function setupUpload(scene) {
    const uploadBtn = document.getElementById("uploadBtn");
    if (!uploadBtn) return;

    uploadBtn.onclick = async () => {
        try {
            console.log("========== Exporting Rocket Part (.rkp) ==========");

            // 1. Export GLTF Scene Data
            const gltf = await exportScene(scene);

            // 2. Collect Selectable Parts & Metadata
            const parts = [];

            scene.traverse(object => {
                if (object.userData && object.userData.selectable === true) {
                    parts.push({
                        uuid: object.uuid,
                        name: object.name || "Unnamed Part",
                        type: object.userData.partType || "Mesh",
                        category: object.userData.category || "Default",
                        manufacturer: object.userData.manufacturer || "",
                        mass: object.userData.mass ?? 1,
                        description: object.userData.description || "",
                        version: object.userData.version || "1.0",
                        position: object.position.toArray(),
                        rotation: [
                            object.rotation.x,
                            object.rotation.y,
                            object.rotation.z
                        ],
                        scale: object.scale.toArray()
                    });
                }
            });

            if (parts.length === 0) {
                alert("No selectable parts found in the scene to export! ❌");
                return;
            }

            // 3. Construct Rocket Part Package
            const rocketPart = {
                format: "RocketPart",
                version: 1,
                created: new Date().toISOString(),
                metadata: {
                    name: parts[0]?.name || "RocketModule",
                    type: parts[0]?.type || "Unknown",
                    category: parts[0]?.category || "Default",
                    manufacturer: parts[0]?.manufacturer || "",
                    mass: parts[0]?.mass ?? 1,
                    description: parts[0]?.description || "",
                    version: parts[0]?.version || "1.0"
                },
                parts,
                gltf
            };

            // 4. Generate JSON Blob and Trigger Download
            const jsonString = JSON.stringify(rocketPart, null, 2);
            const blob = new Blob([jsonString], { type: "application/json" });
            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = (rocketPart.metadata.name || "RocketPart") + ".rkp";
            link.click();

            URL.revokeObjectURL(url);

            console.log("🚀 Rocket Part Successfully Exported");
            alert("Rocket Part Downloaded Successfully 🚀");

        } catch (err) {
            console.error("Rocket Part Export Error:", err);
            alert("Export Failed ❌ Check console for details.");
        }
    };

    console.log("📤 Upload / .rkp Exporter Initialized");
}
