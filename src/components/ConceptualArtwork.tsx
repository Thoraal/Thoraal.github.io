import React, { useEffect, useRef } from 'react';
import type { ConceptualProject } from '../config/portfolio';

interface ConceptualArtworkProps {
  artworkId: ConceptualProject['artworkId'];
  wireframe?: boolean;
}

/**
 * Renderiza láminas dimensionales de estudio en HTML5 Canvas de alta densidad
 * con iluminación volumétrica rasante, sombreado cilíndrico/esférico anodizado,
 * grano superficial granallado, penumbra de contacto y halo incandescente ocluido.
 */
export const ConceptualArtwork: React.FC<ConceptualArtworkProps> = ({
  artworkId,
  wireframe = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 960;
    const H = 600;
    canvas.width = W;
    canvas.height = H;

    // 1. Fondo arquitectónico dividido con luz de estudio
    ctx.fillStyle = '#0F1218';
    ctx.fillRect(0, 0, W, H);

    const rightSplitX = artworkId === 'aero-shutter' ? 500 : 480;
    const slateGrad = ctx.createLinearGradient(rightSplitX, 0, W, H);
    slateGrad.addColorStop(0, '#181D26');
    slateGrad.addColorStop(1, '#12161E');
    ctx.fillStyle = slateGrad;
    ctx.fillRect(rightSplitX, 0, W - rightSplitX, H);

    // Haz diagonal arquitectónico sutil
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(W * 0.34, 0);
    ctx.lineTo(W * 0.68, 0);
    ctx.lineTo(W * 0.48, H);
    ctx.lineTo(W * 0.14, H);
    ctx.closePath();
    const beamGrad = ctx.createLinearGradient(W * 0.2, 0, W * 0.6, H);
    beamGrad.addColorStop(0, 'rgba(238, 232, 223, 0.025)');
    beamGrad.addColorStop(1, 'rgba(11, 13, 17, 0.18)');
    ctx.fillStyle = beamGrad;
    ctx.fill();
    ctx.restore();

    // Costura vertical de 1px
    ctx.strokeStyle = 'rgba(238, 232, 223, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(rightSplitX, 0);
    ctx.lineTo(rightSplitX, H);
    ctx.stroke();

    // Helper: Halo incandescente cobre-naranja con luminancia térmica
    const drawThermalHalo = (cx: number, cy: number, radius: number, thickness: number) => {
      if (wireframe) {
        ctx.save();
        ctx.strokeStyle = '#E85D24';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        return;
      }

      // Resplandor ambiental cálido controlado
      const ambient = ctx.createRadialGradient(cx, cy, radius * 0.55, cx, cy, radius * 1.55);
      ambient.addColorStop(0, 'rgba(232, 93, 36, 0.24)');
      ambient.addColorStop(0.65, 'rgba(232, 93, 36, 0.07)');
      ambient.addColorStop(1, 'rgba(232, 93, 36, 0)');
      ctx.fillStyle = ambient;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.55, 0, Math.PI * 2);
      ctx.fill();

      // Anillo forjado con gradiente térmico núcleo -> brasa
      const ringGrad = ctx.createLinearGradient(
        cx - radius,
        cy - radius,
        cx + radius,
        cy + radius
      );
      ringGrad.addColorStop(0, '#FFD4B2');
      ringGrad.addColorStop(0.28, '#F46E35');
      ringGrad.addColorStop(0.7, '#E85D24');
      ringGrad.addColorStop(1, '#7D2809');

      ctx.strokeStyle = ringGrad;
      ctx.lineWidth = thickness;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();
    };

    // Helper: Penumbra de contacto en mesa de estudio
    const drawContactShadow = (cx: number, cy: number, rx: number, ry: number) => {
      if (wireframe) return;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(rx, ry);
      const sg = ctx.createRadialGradient(0, 0, 0.1, 0, 0, 1);
      sg.addColorStop(0, 'rgba(4, 5, 8, 0.88)');
      sg.addColorStop(0.55, 'rgba(4, 5, 8, 0.42)');
      sg.addColorStop(1, 'rgba(4, 5, 8, 0)');
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.arc(0, 0, 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    // Helper: Cuerpo anodizado con luz rasante fría izquierda + rebote cálido cobre derecho
    const createAnodizedCylinderFill = (x: number, w: number) => {
      const g = ctx.createLinearGradient(x, 0, x + w, 0);
      g.addColorStop(0, '#364050');
      g.addColorStop(0.08, '#232A35');
      g.addColorStop(0.42, '#13171E');
      g.addColorStop(0.78, '#0D1015');
      g.addColorStop(0.94, '#2A1915');
      g.addColorStop(1, '#6E2D15');
      return g;
    };

    if (artworkId === 'monolith-chrono') {
      drawContactShadow(480, 500, 185, 26);
      drawThermalHalo(575, 222, 108, 20);

      // Caja tridimensional biselada del cronógrafo
      const cx = 468;
      const cy = 304;
      const outerR = 166;

      if (!wireframe) {
        const bezelGrad = ctx.createLinearGradient(
          cx - outerR,
          cy - outerR,
          cx + outerR,
          cy + outerR
        );
        bezelGrad.addColorStop(0, '#384252');
        bezelGrad.addColorStop(0.35, '#191E27');
        bezelGrad.addColorStop(0.78, '#0E1117');
        bezelGrad.addColorStop(1, '#592512');

        ctx.fillStyle = bezelGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
        ctx.fill();

        const dialGrad = ctx.createRadialGradient(cx - 36, cy - 42, 16, cx, cy, 134);
        dialGrad.addColorStop(0, '#1E242F');
        dialGrad.addColorStop(0.65, '#11141B');
        dialGrad.addColorStop(1, '#090B0F');
        ctx.fillStyle = dialGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 134, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.strokeStyle = '#EEE8DF';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy, 134, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Índices mecanizados en relieve
      for (let i = 0; i < 60; i++) {
        const ang = (i * 6 * Math.PI) / 180 - Math.PI / 2;
        const major = i % 5 === 0;
        const r1 = major ? 108 : 117;
        const r2 = 125;
        ctx.strokeStyle =
          i === 0 ? '#F46E35' : major ? 'rgba(238,232,223,0.86)' : 'rgba(238,232,223,0.22)';
        ctx.lineWidth = major ? 2.4 : 1;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1);
        ctx.lineTo(cx + Math.cos(ang) * r2, cy + Math.sin(ang) * r2);
        ctx.stroke();
      }

      // Subesfera hundida
      ctx.strokeStyle = 'rgba(238, 232, 223, 0.16)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(cx, cy + 52, 32, 0, Math.PI * 2);
      ctx.stroke();

      // Agujas biseladas con luminova hueso y segundero naranja forjado
      ctx.strokeStyle = '#EEE8DF';
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.moveTo(cx - 14, cy + 12);
      ctx.lineTo(cx + 68, cy - 58);
      ctx.stroke();

      ctx.strokeStyle = '#B8B1A7';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(cx + 12, cy + 6);
      ctx.lineTo(cx - 64, cy - 26);
      ctx.stroke();

      ctx.strokeStyle = '#F46E35';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(cx - 24, cy + 24);
      ctx.lineTo(cx + 88, cy - 88);
      ctx.stroke();

      ctx.fillStyle = '#E85D24';
      ctx.beginPath();
      ctx.arc(cx, cy, 7, 0, Math.PI * 2);
      ctx.fill();
    } else if (artworkId === 'acoustic-field') {
      drawContactShadow(480, 522, 155, 22);
      drawThermalHalo(542, 168, 56, 13);

      const bx = 382;
      const by = 112;
      const bw = 196;
      const bh = 396;

      if (!wireframe) {
        ctx.fillStyle = createAnodizedCylinderFill(bx, bw);
        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, 14);
        ctx.fill();
      }
      ctx.strokeStyle = wireframe ? '#E85D24' : 'rgba(238, 232, 223, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, bh, 14);
      ctx.stroke();

      // Transductores cóncavos sombreados
      const drawDriver = (cy: number, outer: number) => {
        if (!wireframe) {
          const cone = ctx.createRadialGradient(480 - 14, cy - 14, 6, 480, cy, outer);
          cone.addColorStop(0, '#2A313E');
          cone.addColorStop(0.55, '#12161D');
          cone.addColorStop(0.88, '#090B0E');
          cone.addColorStop(1, '#262D39');
          ctx.fillStyle = cone;
          ctx.beginPath();
          ctx.arc(480, cy, outer, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.strokeStyle = 'rgba(238,232,223,0.22)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(480, cy, outer, 0, Math.PI * 2);
        ctx.stroke();

        // Domo central cobre anodizado
        const capGrad = ctx.createRadialGradient(475, cy - 5, 2, 480, cy, outer * 0.3);
        capGrad.addColorStop(0, '#FFA878');
        capGrad.addColorStop(0.5, '#E85D24');
        capGrad.addColorStop(1, '#5E1E08');
        ctx.fillStyle = wireframe ? 'transparent' : capGrad;
        ctx.strokeStyle = '#E85D24';
        ctx.beginPath();
        ctx.arc(480, cy, outer * 0.3, 0, Math.PI * 2);
        if (!wireframe) ctx.fill();
        ctx.stroke();
      };

      drawDriver(228, 56);
      drawDriver(386, 72);
    } else if (artworkId === 'aero-shutter') {
      // Haz cónico volumétrico estilo LUMIER DARK
      if (!wireframe) {
        const coneGrad = ctx.createLinearGradient(420, 250, 210, 560);
        coneGrad.addColorStop(0, 'rgba(238, 232, 223, 0.14)');
        coneGrad.addColorStop(0.6, 'rgba(238, 232, 223, 0.035)');
        coneGrad.addColorStop(1, 'rgba(238, 232, 223, 0)');
        ctx.fillStyle = coneGrad;
        ctx.beginPath();
        ctx.moveTo(350, 210);
        ctx.lineTo(505, 345);
        ctx.lineTo(340, 580);
        ctx.lineTo(95, 520);
        ctx.closePath();
        ctx.fill();
      }

      drawThermalHalo(556, 158, 46, 12);

      // Brazo tubular pavonado
      ctx.strokeStyle = wireframe ? '#EEE8DF' : '#1E242F';
      ctx.lineWidth = wireframe ? 2 : 20;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(548, 206);
      ctx.bezierCurveTo(648, 206, 668, 270, 668, 580);
      ctx.stroke();

      // Campana óptica esculpida
      ctx.save();
      ctx.translate(454, 266);
      ctx.rotate(-0.56);
      if (!wireframe) {
        const hoodGrad = ctx.createLinearGradient(-130, -90, 130, 40);
        hoodGrad.addColorStop(0, '#3B4658');
        hoodGrad.addColorStop(0.32, '#1A2029');
        hoodGrad.addColorStop(0.8, '#0D1016');
        hoodGrad.addColorStop(1, '#582411');
        ctx.fillStyle = hoodGrad;
      }
      ctx.strokeStyle = wireframe ? '#E85D24' : 'rgba(238,232,223,0.22)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-132, 26);
      ctx.bezierCurveTo(-128, -98, 128, -98, 132, 26);
      ctx.closePath();
      if (!wireframe) ctx.fill();
      ctx.stroke();

      // Difusor interior marfil cálido
      if (!wireframe) {
        const diffGrad = ctx.createRadialGradient(0, 26, 8, 0, 26, 130);
        diffGrad.addColorStop(0, '#EEE8DF');
        diffGrad.addColorStop(0.7, '#B8B1A7');
        diffGrad.addColorStop(1, '#5D5852');
        ctx.fillStyle = diffGrad;
      }
      ctx.beginPath();
      ctx.ellipse(0, 26, 132, 26, 0, 0, Math.PI * 2);
      if (!wireframe) ctx.fill();
      ctx.strokeStyle = '#E85D24';
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.restore();
    } else {
      // solar-aperture: Monolitos arquitectónicos escalonados ocluyendo eclipse térmico
      drawContactShadow(475, 492, 235, 24);
      drawThermalHalo(538, 256, 132, 22);

      const drawSlab = (x: number, y: number, w: number, h: number) => {
        if (!wireframe) {
          ctx.fillStyle = createAnodizedCylinderFill(x, w);
          ctx.fillRect(x, y, w, h);
        }
        ctx.strokeStyle = wireframe ? '#E85D24' : 'rgba(238, 232, 223, 0.2)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, w, h);
      };

      drawSlab(272, 126, 168, 356);
      drawSlab(458, 168, 194, 314);

      // Ranura lumínica cobre entre volúmenes
      ctx.strokeStyle = '#F46E35';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(458, 264);
      ctx.lineTo(652, 264);
      ctx.stroke();
    }

    // Capa final de grano anodizado fino en toda la lámina para cohesión material
    if (!wireframe) {
      const img = ctx.getImageData(0, 0, W, H);
      const d = img.data;
      for (let i = 0; i < d.length; i += 16) {
        const n = ((Math.sin(i * 12.9898) * 43758.5453) % 1) * 7 - 3.5;
        d[i] = Math.max(0, Math.min(255, d[i] + n));
        d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n));
        d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n));
      }
      ctx.putImageData(img, 0, 0);
    }
  }, [artworkId, wireframe]);

  return <canvas ref={canvasRef} className="project-artwork" aria-hidden="true" />;
};
