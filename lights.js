// ==========================================
// ModelForge 3D - Studio Lighting Setup
// ==========================================

import * as THREE from 'three';

export function setupLights(scene) {
    // 1. Ambient Light (বেস এনভায়রনমেন্ট লাইট)
    // পুরো সিনকে হালকাভাবে আলোকিত করবে যেন শ্যাডো একদম কালো না হয়ে যায়
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); 
    scene.add(ambientLight);

    // 2. Key Light (প্রধান ডিরেকশনাল লাইট - সূর্যের মতো)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(10, 15, 10);
    keyLight.castShadow = true;

    // হাই-কোয়ালিটি শ্যাডো কনফিগারেশন (Blender Style)
    keyLight.shadow.mapSize.width = 2048; // শার্প শ্যাডোর জন্য
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 50;
    
    // শ্যাডো কাস্টিং এরিয়া নির্ধারণ
    const d = 15;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    
    keyLight.shadow.bias = -0.0005; // শ্যাডো একনে (Shadow Acne) বা গ্লিচ দূর করার জন্য
    scene.add(keyLight);

    // 3. Fill Light (বিপরীত দিকের সফট লাইট)
    // মডেলের অন্ধকার দিকগুলোর ডিটেইলস বোঝানোর জন্য হালকা নীলচে/শীতল আলো
    const fillLight = new THREE.DirectionalLight(0x90b0d0, 0.6); 
    fillLight.position.set(-10, 10, -10);
    scene.add(fillLight);

    // 4. Rim / Back Light (পেছনের লাইট)
    // মডেলকে ব্যাকগ্রাউন্ড থেকে আলাদা করে ডেপথ (Depth) তৈরি করার জন্য
    const rimLight = new THREE.DirectionalLight(0xffeedd, 0.4);
    rimLight.position.set(0, 10, -15);
    scene.add(rimLight);
    
    console.log("💡 Professional Studio Lighting Configured");
}
