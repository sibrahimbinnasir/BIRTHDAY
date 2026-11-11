import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeCanvasProps {
  currentSlide: number; // 0 = Welcome, 1 = SlideOne, 2 = SlideTwo, 3 = SlideThree
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({ currentSlide }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const slideTargetRef = useRef(currentSlide);
  slideTargetRef.current = currentSlide;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0c12, 0.045);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 11);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // Ambient & Directional Lighting
    const ambientLight = new THREE.AmbientLight(0xfff1d0, 0.7);
    scene.add(ambientLight);

    const warmLight = new THREE.PointLight(0xe8c170, 3, 25);
    warmLight.position.set(3, 4, 5);
    scene.add(warmLight);

    const coolRimLight = new THREE.PointLight(0x7590b0, 1.5, 30);
    coolRimLight.position.set(-6, -4, 2);
    scene.add(coolRimLight);

    // 1. Shimmering Golden Dust / Champagne Petals Particle System
    const particleCount = 420;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);
    const opacities = new Float32Array(particleCount);
    const speeds = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 26;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

      scales[i] = Math.random() * 0.12 + 0.04;
      opacities[i] = Math.random() * 0.6 + 0.3;

      speeds[i * 3] = (Math.random() - 0.5) * 0.003;
      speeds[i * 3 + 1] = Math.random() * 0.005 + 0.002; // slow gentle rise
      speeds[i * 3 + 2] = (Math.random() - 0.5) * 0.003;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Canvas-generated soft round particle texture
    const particleCanvas = document.createElement('canvas');
    particleCanvas.width = 64;
    particleCanvas.height = 64;
    const pctx = particleCanvas.getContext('2d');
    if (pctx) {
      const gradient = pctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255, 248, 220, 1)');
      gradient.addColorStop(0.3, 'rgba(235, 195, 115, 0.85)');
      gradient.addColorStop(0.7, 'rgba(190, 140, 60, 0.25)');
      gradient.addColorStop(1, 'rgba(10, 12, 18, 0)');
      pctx.fillStyle = gradient;
      pctx.fillRect(0, 0, 64, 64);
    }
    const particleTexture = new THREE.CanvasTexture(particleCanvas);

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.26,
      map: particleTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: 0xf5dfa0,
    });

    const particles = new THREE.Points(geometry, particleMaterial);
    scene.add(particles);

    // 2. Floating 3D Geometric Ring / Ethereal Aura in Background
    const ringGroup = new THREE.Group();
    const torusGeo = new THREE.TorusGeometry(3.6, 0.018, 16, 120);
    const torusMat = new THREE.MeshStandardMaterial({
      color: 0xdeb35e,
      roughness: 0.3,
      metalness: 0.85,
      transparent: true,
      opacity: 0.35,
    });
    const torus = new THREE.Mesh(torusGeo, torusMat);
    torus.rotation.x = Math.PI / 3;
    ringGroup.add(torus);

    const innerTorusGeo = new THREE.TorusGeometry(2.4, 0.012, 16, 100);
    const innerTorusMat = new THREE.MeshStandardMaterial({
      color: 0xffe29a,
      roughness: 0.2,
      metalness: 0.9,
      transparent: true,
      opacity: 0.25,
    });
    const innerTorus = new THREE.Mesh(innerTorusGeo, innerTorusMat);
    innerTorus.rotation.y = Math.PI / 4;
    ringGroup.add(innerTorus);

    ringGroup.position.set(0, 0, -2);
    scene.add(ringGroup);

    // Mouse Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 1.6;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 1.6;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        targetMouseX = (e.touches[0].clientX / window.innerWidth - 0.5) * 1.6;
        targetMouseY = (e.touches[0].clientY / window.innerHeight - 0.5) * 1.6;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const targetCameraPos = { x: 0, y: 0, z: 11 };
    const targetRingPos = { x: 0, y: 0, z: -2 };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth mouse lerp
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      // Dynamic Slide Camera Setup
      const slide = slideTargetRef.current;
      if (slide === 0) {
        // Welcome
        targetCameraPos.x = mouseX * 1.2;
        targetCameraPos.y = -mouseY * 0.9;
        targetCameraPos.z = 11.2;
        targetRingPos.x = 0;
        targetRingPos.y = 0;
      } else if (slide === 1) {
        // Why You're Special: closer, subtle upward tilt
        targetCameraPos.x = mouseX * 0.9 + 0.4;
        targetCameraPos.y = -mouseY * 0.7 - 0.2;
        targetCameraPos.z = 9.4;
        targetRingPos.x = 1.2;
        targetRingPos.y = -0.5;
      } else if (slide === 2) {
        // Memories Gallery: wide vista, gentle side offset
        targetCameraPos.x = mouseX * 1.3 - 0.6;
        targetCameraPos.y = -mouseY * 0.8 + 0.3;
        targetCameraPos.z = 10.6;
        targetRingPos.x = -1.5;
        targetRingPos.y = 0.8;
      } else if (slide === 3) {
        // Letter: intimate golden candlelight warmth
        targetCameraPos.x = mouseX * 0.8;
        targetCameraPos.y = -mouseY * 0.6 - 0.4;
        targetCameraPos.z = 8.8;
        targetRingPos.x = 0;
        targetRingPos.y = -1.0;
      }

      // Camera Position Interpolation
      camera.position.x += (targetCameraPos.x - camera.position.x) * 0.035;
      camera.position.y += (targetCameraPos.y - camera.position.y) * 0.035;
      camera.position.z += (targetCameraPos.z - camera.position.z) * 0.035;
      camera.lookAt(0, 0, 0);

      // Rotate 3D Rings
      ringGroup.rotation.x = elapsed * 0.08;
      ringGroup.rotation.y = elapsed * 0.12;
      ringGroup.position.x += (targetRingPos.x - ringGroup.position.x) * 0.025;
      ringGroup.position.y += (targetRingPos.y - ringGroup.position.y) * 0.025;

      // Particle update
      const posArray = geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        // gently float up
        posArray[i * 3 + 1] += speeds[i * 3 + 1];
        posArray[i * 3] += Math.sin(elapsed + i) * 0.0015;
        posArray[i * 3 + 2] += Math.cos(elapsed * 0.5 + i) * 0.0015;

        // Reset if float out of bounds
        if (posArray[i * 3 + 1] > 11) {
          posArray[i * 3 + 1] = -11;
        }
      }
      geometry.attributes.position.needsUpdate = true;

      // Gentle warm light pulse
      warmLight.intensity = 2.6 + Math.sin(elapsed * 1.5) * 0.6;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      particleMaterial.dispose();
      particleTexture.dispose();
      torusGeo.dispose();
      torusMat.dispose();
      innerTorusGeo.dispose();
      innerTorusMat.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
};
