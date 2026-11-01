import React from 'react';

interface MonolithFallbackProps {
  reason?: 'loading' | 'fallback';
}

/**
 * Escultura arquitectónica vectorial de respaldo cuando WebGL está cargando
 * o no está disponible en el dispositivo. Conserva exactamente la composición
 * de obsidiana mate + anillo orbital naranja ocluido sin provocar CLS.
 */
export const MonolithFallback: React.FC<MonolithFallbackProps> = ({ reason = 'fallback' }) => {
  return (
    <div
      className="monolith-fallback"
      role="img"
      aria-label="Escultura tridimensional arquitectónica THORAL en obsidiana mate y anillo naranja señal"
      data-state={reason}
    >
      <svg
        className="monolith-fallback__svg"
        viewBox="0 0 560 620"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="mf-body" x1="170" y1="110" x2="380" y2="510" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#262C37" />
            <stop offset="42%" stopColor="#15181F" />
            <stop offset="100%" stopColor="#0C0E12" />
          </linearGradient>
          <linearGradient id="mf-rim" x1="360" y1="140" x2="190" y2="460" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#E85D24" stopOpacity="0.85" />
            <stop offset="38%" stopColor="#EEE8DF" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#EEE8DF" stopOpacity="0.04" />
          </linearGradient>
          <radialGradient id="mf-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#050608" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#050608" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Sombra de contacto en estudio */}
        <ellipse cx="276" cy="534" rx="148" ry="24" fill="url(#mf-shadow)" />

        {/* Anillo orbital naranja señal detrás del hombro superior derecho */}
        <circle cx="348" cy="188" r="72" stroke="#E85D24" strokeWidth="15" />
        <circle cx="348" cy="188" r="84" stroke="#E85D24" strokeOpacity="0.22" strokeWidth="1" />

        {/* Corona prismática flotante */}
        <polygon
          points="274,78 318,104 274,122 230,104"
          fill="#252C38"
          stroke="#EEE8DF"
          strokeOpacity="0.28"
          strokeWidth="1.2"
        />

        {/* Cuerpo monolítico anodizado */}
        <rect
          x="196"
          y="142"
          width="156"
          height="366"
          rx="4"
          fill="url(#mf-body)"
          stroke="url(#mf-rim)"
          strokeWidth="1.5"
        />

        {/* Ranuras mecanizadas con luz interna cobre */}
        <line x1="196" y1="236" x2="352" y2="236" stroke="#E85D24" strokeWidth="2" />
        <line x1="196" y1="368" x2="352" y2="368" stroke="#EEE8DF" strokeOpacity="0.18" strokeWidth="1.2" />

        {/* Anillo giroscópico ecuatorial */}
        <ellipse
          cx="274"
          cy="302"
          rx="118"
          ry="28"
          transform="rotate(-14 274 302)"
          stroke="#EEE8DF"
          strokeOpacity="0.26"
          strokeWidth="2"
        />
        <ellipse
          cx="274"
          cy="302"
          rx="104"
          ry="22"
          transform="rotate(-14 274 302)"
          stroke="#E85D24"
          strokeOpacity="0.55"
          strokeWidth="1.2"
        />

        {/* Grabado sutil sobre obsidiana */}
        <text
          x="274"
          y="292"
          textAnchor="middle"
          fill="#EEE8DF"
          fillOpacity="0.22"
          fontSize="13"
          fontFamily="sans-serif"
          fontWeight="700"
          letterSpacing="5"
        >
          THORAL
        </text>
        <text
          x="274"
          y="314"
          textAnchor="middle"
          fill="#EEE8DF"
          fillOpacity="0.14"
          fontSize="10"
          fontFamily="sans-serif"
          letterSpacing="4"
        >
          STUDIO 01
        </text>
      </svg>
    </div>
  );
};

export default MonolithFallback;
