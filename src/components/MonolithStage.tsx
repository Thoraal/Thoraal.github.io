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
 * Textura micro-granallada anodizada de 512x512 para acabado negro mate aterciopelado.
 */
function createSandblastedTexture(): THREE.CanvasTexture {
  const size = 512;
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
      const latheLine = Math.sin(y * 0.85) * 4;
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const hash = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
        const grain = (hash - Math.floor(hash) - 0.5) * 28;
        const val = Math.max(0, Math.min(255, 132 + latheLine + grain));
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
  texture.repeat.set(4, 6);
  return texture;
}

/**
 * Construye un perfil torneado CNC con biseles de 45 grados para segmentos monolíticos suaves.
 */
function createBeveledDrumGeometry(
  radiusTop: number,
  radiusBottom: number,
  height: number,
  bevel: number
): THREE.LatheGeometry {
  const halfH = height / 2;
  const pts = [
    new THREE.Vector2(0.001, -halfH),
    new THREE.Vector2(Math.max(0.05, radiusBottom - bevel), -halfH),
    new THREE.Vector2(radiusBottom, -halfH + bevel),
    new THREE.Vector2(radiusTop, halfH - bevel),
    new THREE.Vector2(Math.max(0.05, radiusTop - bevel), halfH),
    new THREE.Vector2(0.001, halfH),
  ];
  return new THREE.LatheGeometry(pts, 96);
}

const HALO_VERTEX_SHADER = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vLocalPos;

  void main() {
    vLocalPos = position;
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const HALO_FRAGMENT_SHADER = /* glsl */ `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vLocalPos;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    float facing = clamp(abs(dot(normal, viewDir)), 0.0, 1.0);
    float fresnel = pow(1.0 - facing, 1.7);

    // Gradiente térmico incandescente: núcleo cálido -> naranja señal -> cobre brasa
    vec3 emberDeep = vec3(0.52, 0.15, 0.04);
    vec3 signalOrange = vec3(0.91, 0.365, 0.141);
    vec3 hotCore = vec3(1.0, 0.78, 0.56);

    float diag = clamp((vLocalPos.x + vLocalPos.y) * 0.65 + 0.5, 0.0, 1.0);
    vec3 baseGrad = mix(emberDeep, signalOrange, smoothstep(0.05, 0.65, diag));
    vec3 col = mix(baseGrad, hotCore, pow(facing, 2.6) * 0.55 + fresnel * 0.22);

    float pulse = 0.96 + 0.04 * sin(uTime * 1.5);
    gl_FragColor = vec4(col * pulse, 1.0);
  }
`;

const SHADOW_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const SHADOW_FRAGMENT_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    float dist = length(vUv - vec2(0.5)) * 2.0;
    float alpha = pow(clamp(1.0 - dist, 0.0, 1.0), 2.4) * 0.58;
    // Dithering sutil para evitar cualquier bandeado en la costura de planos oscuros
    float noise = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
    alpha = clamp(alpha + (noise - 0.5) * 0.012, 0.0, 1.0);
    gl_FragColor = vec4(0.02, 0.025, 0.035, alpha);
  }
`;

const DUST_VERTEX_SHADER = /* glsl */ `
  attribute float aScale;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vAlpha;

  void main() {
    vec3 pos = position;
    pos.y += sin(uTime * 0.32 + position.x * 2.1) * 0.07;
    pos.x += cos(uTime * 0.25 + position.z * 1.7) * 0.04;
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aScale * uPixelRatio * (16.0 / -mvPosition.z);
    vAlpha = smoothstep(7.5, 2.2, -mvPosition.z) * 0.32;
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
      core.roughness = 0.35;
      core.metalness = 0.45;
      collar.wireframe = true;
      collar.color.set('#EEE8DF');
    } else if (preset === 'brushed') {
      core.wireframe = false;
      core.color.set('#232934');
      core.roughness = 0.42;
      core.metalness = 0.68;
      core.clearcoat = 0.14;
      collar.wireframe = false;
      collar.color.set('#2D3544');
      collar.roughness = 0.34;
    } else {
      // Negro obsidiana granallado mate cohesivo (sin reflejos cromados quemados)
      core.wireframe = false;
      core.color.set('#181C24');
      core.roughness = 0.62;
      core.metalness = 0.44;
      core.clearcoat = 0.06;
      collar.wireframe = false;
      collar.color.set('#212732');
      collar.roughness = 0.48;
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
      renderer = new THREE.WebGLRenderer({
        antialias: true, // Antialiasing activo en escritorio y móvil para aristas limpias
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglAvailable(false);
      return;
    }

    const getDpr = () =>
      Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.75 : 2);
    renderer.setPixelRatio(getDpr());
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.domElement.className = 'monolith-canvas';
    renderer.domElement.setAttribute('aria-hidden', 'true');
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envRT = pmremGenerator.fromScene(new RoomEnvironment(), 0.055);
    scene.environment = envRT.texture;
    // Intensidad ambiental controlada para evitar brillos especulares blancos en el cono inferior
    scene.environmentIntensity = 0.22;

    const camera = new THREE.PerspectiveCamera(
      33,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.1,
      30
    );
    camera.position.set(0, 0.08, 6.2);

    const disposables: Array<{ dispose: () => void }> = [envRT, pmremGenerator];

    const grainTex = createSandblastedTexture();
    disposables.push(grainTex);

    const coreMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#181C24'),
      metalness: 0.44,
      roughness: 0.62,
      bumpMap: grainTex,
      bumpScale: 0.011,
      roughnessMap: grainTex,
      clearcoat: 0.06,
      clearcoatRoughness: 0.55,
    });

    const collarMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#212732'),
      metalness: 0.58,
      roughness: 0.48,
      bumpMap: grainTex,
      bumpScale: 0.007,
      clearcoat: 0.1,
      clearcoatRoughness: 0.45,
    });

    const copperCoreMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#E85D24'),
      emissive: new THREE.Color('#D94E18'),
      emissiveIntensity: 0.95,
      roughness: 0.3,
      metalness: 0.55,
    });

    materialsRef.current = { core: coreMaterial, collar: collarMaterial };
    disposables.push(coreMaterial, collarMaterial, copperCoreMaterial);

    const rigGroup = new THREE.Group();
    scene.add(rigGroup);

    const monolithGroup = new THREE.Group();
    rigGroup.add(monolithGroup);

    // Silueta monolítica cohesiva de alta resolución (96 segmentos torneados con biseles suaves)
    const capCrownGeo = createBeveledDrumGeometry(0.67, 0.71, 0.16, 0.03);
    const upperGeo = createBeveledDrumGeometry(0.69, 0.65, 1.08, 0.035);
    const midGeo = createBeveledDrumGeometry(0.645, 0.61, 1.18, 0.03);
    const lowerGeo = createBeveledDrumGeometry(0.605, 0.54, 1.02, 0.035);
    const innerSpineGeo = new THREE.CylinderGeometry(0.51, 0.49, 3.3, 64);
    const copperSeamTopGeo = new THREE.TorusGeometry(0.57, 0.016, 24, 96);
    const copperSeamBotGeo = new THREE.TorusGeometry(0.545, 0.014, 24, 96);
    const topGrooveRingGeo = new THREE.TorusGeometry(0.68, 0.008, 16, 96);

    disposables.push(
      capCrownGeo,
      upperGeo,
      midGeo,
      lowerGeo,
      innerSpineGeo,
      copperSeamTopGeo,
      copperSeamBotGeo,
      topGrooveRingGeo
    );

    const capCrownMesh = new THREE.Mesh(capCrownGeo, collarMaterial);
    capCrownMesh.position.y = 1.66;

    const topGrooveRing = new THREE.Mesh(topGrooveRingGeo, copperCoreMaterial);
    topGrooveRing.rotation.x = Math.PI / 2;
    topGrooveRing.position.y = 1.56;

    const upperMesh = new THREE.Mesh(upperGeo, coreMaterial);
    upperMesh.position.y = 1.01;

    const midMesh = new THREE.Mesh(midGeo, coreMaterial);
    midMesh.position.y = -0.16;

    const lowerMesh = new THREE.Mesh(lowerGeo, coreMaterial);
    lowerMesh.position.y = -1.3;

    const spineMesh = new THREE.Mesh(innerSpineGeo, collarMaterial);
    spineMesh.position.y = -0.04;

    const seamTop = new THREE.Mesh(copperSeamTopGeo, copperCoreMaterial);
    seamTop.rotation.x = Math.PI / 2;
    seamTop.position.y = 0.45;

    const seamBot = new THREE.Mesh(copperSeamBotGeo, copperCoreMaterial);
    seamBot.rotation.x = Math.PI / 2;
    seamBot.position.y = -0.77;

    monolithGroup.add(
      spineMesh,
      capCrownMesh,
      topGrooveRing,
      upperMesh,
      midMesh,
      lowerMesh,
      seamTop,
      seamBot
    );

    // Anillo orbital ecuatorial minimalista de alta precisión
    const outerCollarGroup = new THREE.Group();
    const outerRingGeo = new THREE.TorusGeometry(0.96, 0.02, 24, 128);
    const innerRingGeo = new THREE.TorusGeometry(0.84, 0.011, 20, 112);
    disposables.push(outerRingGeo, innerRingGeo);

    const outerRingMesh = new THREE.Mesh(outerRingGeo, collarMaterial);
    outerRingMesh.rotation.x = Math.PI * 0.43;
    outerRingMesh.rotation.y = -0.22;
    outerCollarGroup.add(outerRingMesh);

    const innerRingMesh = new THREE.Mesh(innerRingGeo, copperCoreMaterial);
    innerRingMesh.rotation.x = Math.PI * 0.55;
    innerRingMesh.rotation.y = 0.28;
    outerCollarGroup.add(innerRingMesh);

    outerCollarGroup.position.y = -0.08;
    monolithGroup.add(outerCollarGroup);
    monolithGroup.rotation.z = 0.025;
    monolithGroup.rotation.x = 0.06;

    // Halo térmico naranja señal OCLUIDO detrás del hombro superior derecho
    const haloUniforms = {
      uTime: { value: 0 },
    };
    const haloMaterial = new THREE.ShaderMaterial({
      uniforms: haloUniforms,
      vertexShader: HALO_VERTEX_SHADER,
      fragmentShader: HALO_FRAGMENT_SHADER,
    });
    const haloGeo = new THREE.TorusGeometry(0.7, 0.092, 40, 128);
    disposables.push(haloGeo, haloMaterial);

    const haloMesh = new THREE.Mesh(haloGeo, haloMaterial);
    haloMesh.position.set(0.68, 0.96, -0.86);
    rigGroup.add(haloMesh);

    // Sombra de contacto GLSL con dithering sin bandas visibles
    const shadowGeo = new THREE.PlaneGeometry(3.2, 3.2);
    const shadowMat = new THREE.ShaderMaterial({
      vertexShader: SHADOW_VERTEX_SHADER,
      fragmentShader: SHADOW_FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
    });
    disposables.push(shadowGeo, shadowMat);
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1.92;
    rigGroup.add(shadowPlane);

    // Partículas atmosféricas sutiles
    const particleCount = 36;
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      const seedA = Math.sin(i * 19.31) * 0.5 + 0.5;
      const seedB = Math.cos(i * 41.17) * 0.5 + 0.5;
      const seedC = Math.sin(i * 73.93) * 0.5 + 0.5;
      positions[i * 3] = (seedA - 0.5) * 4.6;
      positions[i * 3 + 1] = (seedB - 0.5) * 4.0;
      positions[i * 3 + 2] = (seedC - 0.5) * 3.2 - 0.4;
      scales[i] = 0.55 + seedA * 1.25;
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

    // Iluminación de estudio equilibrada para negro mate (levanta hombros superiores sin quemar la base)
    const hemiLight = new THREE.HemisphereLight('#2C3545', '#0D1016', 1.15);
    scene.add(hemiLight);

    const upperKeyLight = new THREE.DirectionalLight('#DCE7F7', 2.35);
    upperKeyLight.position.set(-3.4, 4.2, 3.1);
    scene.add(upperKeyLight);

    const leftRimLight = new THREE.DirectionalLight('#9AB2D4', 1.45);
    leftRimLight.position.set(-4.2, 1.2, -1.8);
    scene.add(leftRimLight);

    const orangeRimLight = new THREE.PointLight('#F06428', 11.5, 5.8, 1.75);
    orangeRimLight.position.set(0.75, 1.05, -0.35);
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
        camera.position.z = 6.7;
        rigGroup.scale.setScalar(0.95);
        rigGroup.position.set(-0.04, 0.04, 0);
      } else if (w < 900) {
        camera.position.z = 6.5;
        rigGroup.scale.setScalar(0.98);
        rigGroup.position.set(0, 0.05, 0);
      } else {
        camera.position.z = 6.15;
        rigGroup.scale.setScalar(1.04);
        rigGroup.position.set(0.04, 0.04, 0);
      }
      camera.updateProjectionMatrix();
      // setSize() limpia el búfer de dibujo: se re-renderiza en el acto para no dejar
      // un fotograma vacío entre el redimensionado y el siguiente requestAnimationFrame.
      renderer.render(scene, camera);
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

        const breatheY = Math.sin(elapsed * 0.85) * 0.045;
        monolithGroup.position.y = breatheY;

        const spread = Math.min(scrollP * 1.35, 0.24);
        upperMesh.position.y = 1.01 + spread * 0.36;
        capCrownMesh.position.y = 1.66 + spread * 0.44;
        topGrooveRing.position.y = 1.56 + spread * 0.4;
        lowerMesh.position.y = -1.3 - spread * 0.32;

        monolithGroup.rotation.y =
          0.28 + elapsed * 0.12 + scrollP * Math.PI * 0.75 + pointerCurrent.x * 0.32 + userYawOffset;
        monolithGroup.rotation.x = 0.06 + pointerCurrent.y * 0.12;

        outerCollarGroup.rotation.z = -elapsed * 0.2 - scrollP * 1.0;
        outerCollarGroup.rotation.y = elapsed * 0.16;

        haloMesh.position.x = 0.68 - pointerCurrent.x * 0.18 - scrollP * 0.2;
        haloMesh.position.y = 0.96 + pointerCurrent.y * 0.13 - scrollP * 0.3;
        orangeRimLight.position.set(
          haloMesh.position.x + 0.06,
          haloMesh.position.y + 0.06,
          haloMesh.position.z + 0.5
        );
      } else {
        monolithGroup.position.y = 0;
        monolithGroup.rotation.y = 0.32 + userYawOffset;
        monolithGroup.rotation.x = 0.06;
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
      aria-label="Escultura interactiva 3D THORAL en obsidiana anodizada mate y halo lumínico naranja. Arrastra horizontalmente o mueve el cursor para inspeccionar."
    />
  );
};

export default MonolithStage;
