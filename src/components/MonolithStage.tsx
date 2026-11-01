import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { MaterialPreset } from '../config/portfolio';
import { MonolithFallback } from './MonolithFallback';

interface MonolithStageProps {
  preset: MaterialPreset;
  reducedMotion: boolean;
  scrollProgressRef: React.MutableRefObject<number>;
}

/**
 * Genera una textura procedural micro-granallada y cepillada en un canvas 2D
 * para dotar al metal negro anodizado de micro-relieve realista sin descargas externas.
 */
function createAnodizedGrainTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, size, size);
    const imgData = ctx.getImageData(0, 0, size, size);
    const data = imgData.data;

    for (let y = 0; y < size; y++) {
      const rowStreak = Math.sin(y * 0.7) * 10 + Math.cos(y * 2.1) * 5;
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const hash = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
        const grain = (hash - Math.floor(hash) - 0.5) * 32;
        const val = Math.max(0, Math.min(255, 128 + rowStreak + grain));
        data[idx] = val;
        data[idx + 1] = val;
        data[idx + 2] = val;
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 5);
  return texture;
}

const HALO_VERTEX_SHADER = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const HALO_FRAGMENT_SHADER = /* glsl */ `
  uniform float uTime;
  uniform vec3 uCoreColor;
  uniform vec3 uRimColor;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    float fresnel = pow(1.0 - abs(dot(normal, viewDir)), 1.85);
    float pulse = 0.95 + 0.05 * sin(uTime * 1.6);
    vec3 col = mix(uCoreColor, uRimColor, fresnel * 0.75) * pulse;
    gl_FragColor = vec4(col, 1.0);
  }
`;

const DUST_VERTEX_SHADER = /* glsl */ `
  attribute float aScale;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vAlpha;

  void main() {
    vec3 pos = position;
    pos.y += sin(uTime * 0.35 + position.x * 2.1) * 0.08;
    pos.x += cos(uTime * 0.28 + position.z * 1.7) * 0.05;
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aScale * uPixelRatio * (18.0 / -mvPosition.z);
    vAlpha = smoothstep(7.5, 2.2, -mvPosition.z) * 0.38;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const DUST_FRAGMENT_SHADER = /* glsl */ `
  varying float vAlpha;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float d = length(uv);
    if (d > 0.5) discard;
    float soft = smoothstep(0.5, 0.08, d);
    gl_FragColor = vec4(0.933, 0.910, 0.875, soft * vAlpha);
  }
`;

export const MonolithStage: React.FC<MonolithStageProps> = ({
  preset,
  reducedMotion,
  scrollProgressRef,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const presetRef = useRef<MaterialPreset>(preset);
  const reducedMotionRef = useRef<boolean>(reducedMotion);
  const [webglAvailable, setWebglAvailable] = useState<boolean>(true);

  const materialsRef = useRef<{
    core: THREE.MeshPhysicalMaterial | null;
    collar: THREE.MeshPhysicalMaterial | null;
  }>({ core: null, collar: null });

  useEffect(() => {
    presetRef.current = preset;
    const { core, collar } = materialsRef.current;
    if (!core || !collar) return;

    if (preset === 'wireframe') {
      core.wireframe = true;
      core.color.set('#E85D24');
      core.roughness = 0.25;
      core.metalness = 0.5;
      collar.wireframe = true;
      collar.color.set('#EEE8DF');
    } else if (preset === 'brushed') {
      core.wireframe = false;
      core.color.set('#28303E');
      core.roughness = 0.22;
      core.metalness = 0.9;
      core.clearcoat = 0.52;
      collar.wireframe = false;
      collar.color.set('#333C4D');
      collar.roughness = 0.18;
    } else {
      core.wireframe = false;
      core.color.set('#1B2029');
      core.roughness = 0.34;
      core.metalness = 0.78;
      core.clearcoat = 0.28;
      collar.wireframe = false;
      collar.color.set('#252C38');
      collar.roughness = 0.25;
    }
  }, [preset]);

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
  }, [reducedMotion]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      const isCompact = window.innerWidth < 768;
      renderer = new THREE.WebGLRenderer({
        antialias: !isCompact,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglAvailable(false);
      return;
    }

    const getDpr = () => Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.5 : 2);
    renderer.setPixelRatio(getDpr());
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.24;
    renderer.domElement.className = 'monolith-canvas';
    renderer.domElement.setAttribute('aria-hidden', 'true');
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envRT = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envRT.texture;
    scene.environmentIntensity = 0.58;

    const camera = new THREE.PerspectiveCamera(
      34,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.1,
      30
    );
    camera.position.set(0, 0.08, 6.4);

    const disposables: Array<{ dispose: () => void }> = [envRT, pmremGenerator];

    const grainTex = createAnodizedGrainTexture();
    disposables.push(grainTex);

    const coreMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#1B2029'),
      metalness: 0.78,
      roughness: 0.34,
      bumpMap: grainTex,
      bumpScale: 0.015,
      roughnessMap: grainTex,
      clearcoat: 0.28,
      clearcoatRoughness: 0.32,
    });

    const collarMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#252C38'),
      metalness: 0.88,
      roughness: 0.25,
      bumpMap: grainTex,
      bumpScale: 0.008,
      clearcoat: 0.38,
      clearcoatRoughness: 0.22,
    });

    const copperCoreMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#E85D24'),
      emissive: new THREE.Color('#D14A15'),
      emissiveIntensity: 0.9,
      roughness: 0.24,
      metalness: 0.62,
    });

    materialsRef.current = { core: coreMaterial, collar: collarMaterial };
    disposables.push(coreMaterial, collarMaterial, copperCoreMaterial);

    const rigGroup = new THREE.Group();
    scene.add(rigGroup);

    const monolithGroup = new THREE.Group();
    rigGroup.add(monolithGroup);

    // Escultura arquitectónica original THORAL: Monolito octogonal biselado en tres bloques + corona flotante
    const upperGeo = new THREE.CylinderGeometry(0.62, 0.66, 0.96, 8, 1, false);
    const midGeo = new THREE.CylinderGeometry(0.66, 0.66, 1.24, 8, 1, false);
    const lowerGeo = new THREE.CylinderGeometry(0.66, 0.56, 0.96, 8, 1, false);
    const crownPrismGeo = new THREE.OctahedronGeometry(0.34, 0);
    const innerSpineGeo = new THREE.CylinderGeometry(0.46, 0.46, 3.18, 24);
    const copperSeamTopGeo = new THREE.TorusGeometry(0.54, 0.019, 16, 64);
    const copperSeamBotGeo = new THREE.TorusGeometry(0.54, 0.016, 16, 64);

    disposables.push(
      upperGeo,
      midGeo,
      lowerGeo,
      crownPrismGeo,
      innerSpineGeo,
      copperSeamTopGeo,
      copperSeamBotGeo
    );

    const upperMesh = new THREE.Mesh(upperGeo, coreMaterial);
    upperMesh.position.y = 1.08;
    upperMesh.rotation.y = Math.PI / 8;

    const crownMesh = new THREE.Mesh(crownPrismGeo, collarMaterial);
    crownMesh.position.y = 1.88;
    crownMesh.scale.set(1.15, 0.68, 1.15);

    const midMesh = new THREE.Mesh(midGeo, coreMaterial);
    midMesh.position.y = -0.08;

    const lowerMesh = new THREE.Mesh(lowerGeo, coreMaterial);
    lowerMesh.position.y = -1.24;
    lowerMesh.rotation.y = Math.PI / 8;

    const spineMesh = new THREE.Mesh(innerSpineGeo, collarMaterial);
    spineMesh.position.y = -0.06;

    const seamTop = new THREE.Mesh(copperSeamTopGeo, copperCoreMaterial);
    seamTop.rotation.x = Math.PI / 2;
    seamTop.position.y = 0.57;

    const seamBot = new THREE.Mesh(copperSeamBotGeo, copperCoreMaterial);
    seamBot.rotation.x = Math.PI / 2;
    seamBot.position.y = -0.73;

    // Costillas arquitectónicas fresadas CNC en el núcleo central
    const finGeo = new THREE.BoxGeometry(0.055, 1.12, 1.38);
    disposables.push(finGeo);
    for (let i = 0; i < 4; i++) {
      const fin = new THREE.Mesh(finGeo, collarMaterial);
      fin.position.y = -0.08;
      fin.rotation.y = (i * Math.PI) / 4;
      monolithGroup.add(fin);
    }

    monolithGroup.add(
      spineMesh,
      upperMesh,
      crownMesh,
      midMesh,
      lowerMesh,
      seamTop,
      seamBot
    );

    // Anillos giroscópicos orbitales calibrados
    const outerCollarGroup = new THREE.Group();
    const outerRingGeo = new THREE.TorusGeometry(1.06, 0.026, 20, 96);
    const innerRingGeo = new THREE.TorusGeometry(0.9, 0.015, 16, 84);
    const notchGeo = new THREE.BoxGeometry(0.09, 0.028, 0.045);
    disposables.push(outerRingGeo, innerRingGeo, notchGeo);

    const outerRingMesh = new THREE.Mesh(outerRingGeo, collarMaterial);
    outerRingMesh.rotation.x = Math.PI * 0.41;
    outerRingMesh.rotation.y = -0.26;
    outerCollarGroup.add(outerRingMesh);

    const innerRingMesh = new THREE.Mesh(innerRingGeo, copperCoreMaterial);
    innerRingMesh.rotation.x = Math.PI * 0.57;
    innerRingMesh.rotation.y = 0.34;
    outerCollarGroup.add(innerRingMesh);

    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const notch = new THREE.Mesh(notchGeo, i === 0 ? copperCoreMaterial : collarMaterial);
      notch.position.set(Math.cos(angle) * 1.06, Math.sin(angle) * 0.26, Math.sin(angle) * 1.01);
      notch.lookAt(0, 0, 0);
      outerCollarGroup.add(notch);
    }

    monolithGroup.add(outerCollarGroup);
    monolithGroup.rotation.z = 0.03;
    monolithGroup.rotation.x = 0.08;

    // Anillo luminoso naranja señal OCLUIDO detrás del hombro superior derecho
    const haloUniforms = {
      uTime: { value: 0 },
      uCoreColor: { value: new THREE.Color('#E85D24') },
      uRimColor: { value: new THREE.Color('#FFA273') },
    };
    const haloMaterial = new THREE.ShaderMaterial({
      uniforms: haloUniforms,
      vertexShader: HALO_VERTEX_SHADER,
      fragmentShader: HALO_FRAGMENT_SHADER,
    });
    const haloGeo = new THREE.TorusGeometry(0.72, 0.092, 32, 96);
    disposables.push(haloGeo, haloMaterial);

    const haloMesh = new THREE.Mesh(haloGeo, haloMaterial);
    haloMesh.position.set(0.68, 0.96, -0.88);
    rigGroup.add(haloMesh);

    // Sombra de contacto suave bajo la escultura
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(64, 64, 6, 64, 64, 62);
      grad.addColorStop(0, 'rgba(4, 5, 8, 0.85)');
      grad.addColorStop(0.55, 'rgba(4, 5, 8, 0.35)');
      grad.addColorStop(1, 'rgba(4, 5, 8, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 128, 128);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeo = new THREE.PlaneGeometry(3.4, 3.4);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
    disposables.push(shadowTex, shadowGeo, shadowMat);
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1.94;
    rigGroup.add(shadowPlane);

    // Partículas atmosféricas sutiles
    const particleCount = 42;
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      const seedA = Math.sin(i * 19.31) * 0.5 + 0.5;
      const seedB = Math.cos(i * 41.17) * 0.5 + 0.5;
      const seedC = Math.sin(i * 73.93) * 0.5 + 0.5;
      positions[i * 3] = (seedA - 0.5) * 4.8;
      positions[i * 3 + 1] = (seedB - 0.5) * 4.2;
      positions[i * 3 + 2] = (seedC - 0.5) * 3.4 - 0.4;
      scales[i] = 0.6 + seedA * 1.4;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    dustGeo.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    const dustUniforms = {
      uTime: { value: 0 },
      uPixelRatio: { value: getDpr() },
    };
    const dustMat = new THREE.ShaderMaterial({
      uniforms: dustUniforms,
      vertexShader: DUST_VERTEX_SHADER,
      fragmentShader: DUST_FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
    });
    disposables.push(dustGeo, dustMat);
    const dustPoints = new THREE.Points(dustGeo, dustMat);
    scene.add(dustPoints);

    // Iluminación cinematográfica reforzada para esculpir las aristas del octógono negro
    const keyLight = new THREE.DirectionalLight('#E6EEF9', 3.1);
    keyLight.position.set(-3.8, 3.4, 4.2);
    scene.add(keyLight);

    const rimCoolLight = new THREE.DirectionalLight('#9AB2D4', 1.65);
    rimCoolLight.position.set(-3.2, -1.2, -2.2);
    scene.add(rimCoolLight);

    const orangeRimLight = new THREE.PointLight('#E85D24', 13.0, 6.5, 1.65);
    orangeRimLight.position.copy(haloMesh.position);
    orangeRimLight.position.z += 0.42;
    rigGroup.add(orangeRimLight);

    const pointerTarget = { x: 0, y: 0 };
    const pointerCurrent = { x: 0, y: 0 };
    let userYawOffset = 0;
    let isDragging = false;
    let lastDragX = 0;

    const handlePointerMove = (e: PointerEvent) => {
      const nx = (e.clientX / Math.max(window.innerWidth, 1)) * 2 - 1;
      const ny = (e.clientY / Math.max(window.innerHeight, 1)) * 2 - 1;
      pointerTarget.x = nx;
      pointerTarget.y = ny;

      if (isDragging) {
        const dx = e.clientX - lastDragX;
        lastDragX = e.clientX;
        userYawOffset += dx * 0.0075;
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' || e.pointerType === 'pen') {
        isDragging = true;
        lastDragX = e.clientX;
      }
    };

    const clearDrag = () => {
      isDragging = false;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    container.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', clearDrag);
    window.addEventListener('pointercancel', clearDrag);
    window.addEventListener('blur', clearDrag);

    const applyResponsiveFraming = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = Math.max(container.clientHeight, 1);
      renderer.setPixelRatio(getDpr());
      renderer.setSize(w, h);
      dustUniforms.uPixelRatio.value = getDpr();
      camera.aspect = w / h;

      if (w < 480) {
        camera.position.z = 7.15;
        rigGroup.scale.setScalar(0.9);
        rigGroup.position.set(0, 0.02, 0);
      } else if (w < 900) {
        camera.position.z = 6.75;
        rigGroup.scale.setScalar(0.95);
        rigGroup.position.set(0, 0.04, 0);
      } else {
        camera.position.z = 6.3;
        rigGroup.scale.setScalar(1.03);
        rigGroup.position.set(0.05, 0.03, 0);
      }
      camera.updateProjectionMatrix();
    };

    applyResponsiveFraming();
    const resizeObserver = new ResizeObserver(applyResponsiveFraming);
    resizeObserver.observe(container);

    let isVisible = true;
    let isTabActive = !document.hidden;

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.02 }
    );
    intersectionObserver.observe(container);

    const handleVisibility = () => {
      isTabActive = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      setWebglAvailable(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);

    let rafId = 0;
    const clock = new THREE.Clock();

    const renderTick = () => {
      rafId = window.requestAnimationFrame(renderTick);
      if (!isVisible || !isTabActive) return;

      const elapsed = clock.getElapsedTime();
      const scrollP = scrollProgressRef.current;
      const motionAllowed = !reducedMotionRef.current;

      pointerCurrent.x += (pointerTarget.x - pointerCurrent.x) * 0.055;
      pointerCurrent.y += (pointerTarget.y - pointerCurrent.y) * 0.055;

      if (motionAllowed) {
        haloUniforms.uTime.value = elapsed;
        dustUniforms.uTime.value = elapsed;

        const breatheY = Math.sin(elapsed * 0.9) * 0.05;
        monolithGroup.position.y = breatheY;

        const spread = Math.min(scrollP * 1.4, 0.28);
        upperMesh.position.y = 1.08 + spread * 0.42;
        crownMesh.position.y = 1.88 + spread * 0.62 + Math.sin(elapsed * 1.4) * 0.035;
        crownMesh.rotation.y = -elapsed * 0.35;
        lowerMesh.position.y = -1.24 - spread * 0.36;

        monolithGroup.rotation.y =
          0.32 + elapsed * 0.14 + scrollP * Math.PI * 0.85 + pointerCurrent.x * 0.34 + userYawOffset;
        monolithGroup.rotation.x = 0.08 + pointerCurrent.y * 0.14;

        outerCollarGroup.rotation.z = -elapsed * 0.22 - scrollP * 1.1;
        outerCollarGroup.rotation.y = elapsed * 0.18;

        haloMesh.position.x = 0.68 - pointerCurrent.x * 0.19 - scrollP * 0.22;
        haloMesh.position.y = 0.96 + pointerCurrent.y * 0.14 - scrollP * 0.35;
        orangeRimLight.position.set(
          haloMesh.position.x,
          haloMesh.position.y,
          haloMesh.position.z + 0.42
        );
      } else {
        monolithGroup.position.y = 0;
        monolithGroup.rotation.y = 0.42 + userYawOffset;
        monolithGroup.rotation.x = 0.08;
        crownMesh.rotation.y = 0.4;
      }

      renderer.render(scene, camera);
    };

    renderer.render(scene, camera);
    rafId = window.requestAnimationFrame(renderTick);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', clearDrag);
      window.removeEventListener('pointercancel', clearDrag);
      window.removeEventListener('blur', clearDrag);
      document.removeEventListener('visibilitychange', handleVisibility);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();

      disposables.forEach((item) => item.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [scrollProgressRef]);

  if (!webglAvailable) {
    return <MonolithFallback reason="fallback" />;
  }

  return (
    <div
      ref={containerRef}
      className="monolith-stage"
      role="img"
      aria-label="Escultura interactiva 3D THORAL en obsidiana anodizada y halo lumínico naranja. Arrastra horizontalmente o mueve el cursor para inspeccionar."
    />
  );
};

export default MonolithStage;
