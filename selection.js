// ==========================================
// ModelForge 3D - Selection & Inspector System
// ==========================================

import * as THREE from 'three';
import { attachTransformControls, detachTransformControls } from './transform.js';

export let selectedObject = null;
export let selectedObjects = []; // Multi-selection support

export function initSelection(scene, camera, domElement) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    domElement.addEventListener('pointerdown', (event) => {
        // শুধুমাত্র মাউসের বাম ক্লিক এলাও করা হলো
        if (event.button !== 0) return;

        // ভিউপোর্টের সাপেক্ষে মাউসের সঠিক পজিশন ক্যালকুলেশন
        const rect = domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        // সিন-এর সমস্ত অবজেক্টের সাথে রে ইন্টারসেকশন চেক
        const intersects = raycaster.intersectObjects(scene.children, true);

        if (intersects.length > 0) {
            let target = intersects[0].object;

            // গ্রিড বা অ্যাক্সিস হ্যালপার ইগনোর করার লজিক
            while (target && target.parent && target !== scene) {
                if (target.userData && target.userData.selectable === true) {
                    break;
                }
                if (target.isGridHelper || target.isAxesHelper) {
                    target = null;
                    break;
                }
                target = target.parent;
            }

            if (target && target.userData && target.userData.selectable === true) {
                selectObject(target, event.ctrlKey, scene);
            } else if (!event.ctrlKey) {
                clearSelection();
            }
        } else {
            if (!event.ctrlKey) {
                clearSelection();
            }
        }
    });

    console.log("🖱️ Selection & Raycasting System Initialized");
}

export function selectObject(object, isMultiSelect = false) {
    if (!isMultiSelect) {
        selectedObjects = [object];
        selectedObject = object;
        attachTransformControls(object);
    } else {
        if (!selectedObjects.includes(object)) {
            selectedObjects.push(object);
        }
    }

    updateInspector(selectedObject);
    highlightSceneTree(selectedObject);
}

export function clearSelection() {
    selectedObject = null;
    selectedObjects = [];
    detachTransformControls();
    updateInspector(null);
}

// ==========================================
// Blender Style Inspector Property Binder
// ==========================================

function updateInspector(object) {
    const container = document.getElementById('inspectorContent');
    if (!container) return;

    if (!object) {
        container.innerHTML = `<p class="empty-msg">No object selected</p>`;
        return;
    }

    container.innerHTML = `
        <div class="inspector-group">
            <label>Object Name</label>
            <input type="text" id="inspectorName" value="${object.name || 'Unnamed'}">
            
            <hr>
            <label>Transform (Position)</label>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px;">
                <div><small style="color:var(--text-muted)">X</small><input type="number" id="inspectorPosX" value="${object.position.x.toFixed(2)}" step="0.1"></div>
                <div><small style="color:var(--text-muted)">Y</small><input type="number" id="inspectorPosY" value="${object.position.y.toFixed(2)}" step="0.1"></div>
                <div><small style="color:var(--text-muted)">Z</small><input type="number" id="inspectorPosZ" value="${object.position.z.toFixed(2)}" step="0.1"></div>
            </div>
        </div>
    `;

    // Live binding for Name change
    document.getElementById('inspectorName')?.addEventListener('input', (e) => {
        object.name = e.target.value;
    });

    // Live binding for Position X, Y, Z
    ['X', 'Y', 'Z'].forEach((axis, idx) => {
        const input = document.getElementById(`inspectorPos${axis}`);
        input?.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            if (!isNaN(val)) {
                if (idx === 0) object.position.x = val;
                if (idx === 1) object.position.y = val;
                if (idx === 2) object.position.z = val;
            }
        });
    });
}

function highlightSceneTree(object) {
    window.dispatchEvent(new CustomEvent('objectSelected', { detail: object }));
}
