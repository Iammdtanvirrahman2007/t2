// ==========================================
// ModelForge 3D - Transform & Gizmo System
// ==========================================

import * as THREE from 'three';
import { TransformControls } from 'three/addons/controls/TransformControls.js';

let transformControls = null;
let isSnapEnabled = false;

export function initTransformControls(scene, camera, domElement) {
    transformControls = new TransformControls(camera, domElement);
    
    // গিজমো ড্র্যাগ করার সময় OrbitControls ডিজেবল করার জন্য ইভেন্ট ডিসপ্যাচ
    transformControls.addEventListener('dragging-changed', (event) => {
        window.dispatchEvent(new CustomEvent('transformDragging', { detail: event.value }));
    });

    // অবজেক্ট ট্রান্সফর্ম হওয়ার সময় লাইভ আপডেট পাঠানো
    transformControls.addEventListener('change', () => {
        const obj = transformControls.object;
        if (obj) {
            window.dispatchEvent(new CustomEvent('objectTransformed', { detail: obj }));
        }
    });

    scene.add(transformControls);

    // স্ন্যাপ টগল ইভেন্ট লিসেনার
    window.addEventListener('toggleSnap', (e) => {
        isSnapEnabled = e.detail;
        updateSnapSettings();
    });

    console.log("🛠️ Transform & Gizmo System Initialized");
}

export function attachTransformControls(object) {
    if (transformControls && object) {
        transformControls.attach(object);
    }
}

export function detachTransformControls() {
    if (transformControls) {
        transformControls.detach();
    }
}

export function setTransformMode(mode) {
    if (transformControls) {
        transformControls.setMode(mode); // 'translate', 'rotate', 'scale'
    }
}

// ==========================================
// Snapping Configuration (Blender Style)
// ==========================================

function updateSnapSettings() {
    if (!transformControls) return;
    
    if (isSnapEnabled) {
        transformControls.setTranslationSnap(0.5); // ০.৫ ইউনিট পজিশন স্ন্যাপ
        transformControls.setRotationSnap(THREE.MathUtils.degToRad(15)); // ১৫ ডিগ্রি রোটেশন স্ন্যাপ
        transformControls.setScaleSnap(0.1); // ০.১ স্কেল স্ন্যাপ
    } else {
        transformControls.setTranslationSnap(null);
        transformControls.setRotationSnap(null);
        transformControls.setScaleSnap(null);
    }
}
