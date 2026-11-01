import React from 'react';
import type { ConceptualProject } from '../config/portfolio';

interface ConceptualArtworkProps {
  artworkId: ConceptualProject['artworkId'];
  wireframe?: boolean;
}

/**
 * Láminas arquitectónicas vectoriales de alta precisión para cada estudio conceptual.
 * Construidas específicamente para el lenguaje visual Dark Luxury + Naranja Señal
 * de THORAL, con modo de inspección estructural (wireframe) integrado.
 */
export const ConceptualArtwork: React.FC<ConceptualArtworkProps> = ({
  artworkId,
  wireframe = false,
}) => {
  const strokeMain = wireframe ? '#E85D24' : '#EEE8DF';
  const fillBody = wireframe ? 'none' : '#13171E';
  const fillElevated = wireframe ? 'none' : '#1D232D';

  switch (artworkId) {
    case 'monolith-chrono':
      return (
        <svg
          className="project-artwork"
          viewBox="0 0 800 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect width="400" height="500" fill="#101318" />
          <rect x="400" width="400" height="500" fill="#171C24" />
          <line x1="400" y1="0" x2="400" y2="500" stroke="#EEE8DF" strokeOpacity="0.08" />
          {/* Anillo naranja señal parcialmente ocluido */}
          <circle
            cx="474"
            cy="192"
            r="96"
            stroke="#E85D24"
            strokeWidth={wireframe ? '2' : '16'}
            strokeDasharray={wireframe ? '6 4' : undefined}
          />
          {/* Caja cronógrafo monolítica */}
          <circle
            cx="400"
            cy="258"
            r="138"
            fill={fillElevated}
            stroke={strokeMain}
            strokeOpacity={wireframe ? '0.75' : '0.18'}
            strokeWidth="1.5"
          />
          <circle
            cx="400"
            cy="258"
            r="112"
            fill={fillBody}
            stroke="#EEE8DF"
            strokeOpacity="0.14"
            strokeWidth="1"
          />
          {/* Índices horarios radiales */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const x1 = 400 + Math.cos(angle) * 94;
            const y1 = 258 + Math.sin(angle) * 94;
            const x2 = 400 + Math.cos(angle) * 106;
            const y2 = 258 + Math.sin(angle) * 106;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={i === 0 ? '#E85D24' : '#EEE8DF'}
                strokeOpacity={i % 3 === 0 ? '0.85' : '0.28'}
                strokeWidth={i % 3 === 0 ? '2' : '1'}
              />
            );
          })}
          {/* Agujas arquitectónicas */}
          <line x1="400" y1="258" x2="454" y2="206" stroke="#EEE8DF" strokeWidth="3" />
          <line x1="400" y1="258" x2="338" y2="242" stroke="#B4ADA3" strokeWidth="2" />
          <line x1="382" y1="274" x2="468" y2="188" stroke="#E85D24" strokeWidth="1.5" />
          <circle cx="400" cy="258" r="6" fill="#E85D24" />
          {/* Líneas de cota */}
          <line x1="120" y1="420" x2="680" y2="420" stroke="#EEE8DF" strokeOpacity="0.08" />
          <rect x="120" y="418" width="64" height="3" fill="#E85D24" />
        </svg>
      );

    case 'acoustic-field':
      return (
        <svg
          className="project-artwork"
          viewBox="0 0 800 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect width="800" height="500" fill="#11141A" />
          <polygon points="290,0 640,0 470,500 120,500" fill="#171C24" />
          {/* Bucle superior naranja inspirado en cableado de precisión */}
          <path
            d="M446 118 C462 72, 514 82, 494 132"
            stroke="#E85D24"
            strokeWidth={wireframe ? '2' : '7'}
            fill="none"
          />
          {/* Torre acústica monolítica */}
          <rect
            x="324"
            y="112"
            width="152"
            height="304"
            rx="12"
            fill={fillBody}
            stroke={strokeMain}
            strokeOpacity={wireframe ? '0.75' : '0.2'}
            strokeWidth="1.5"
          />
          {/* Conos acústicos concéntricos */}
          {[42, 30, 18].map((r, idx) => (
            <circle
              key={r}
              cx="400"
              cy="204"
              r={r}
              fill={idx === 2 && !wireframe ? '#E85D24' : 'none'}
              stroke={idx === 0 ? '#EEE8DF' : '#E85D24'}
              strokeOpacity={idx === 0 ? '0.26' : '0.65'}
              strokeWidth="1.4"
            />
          ))}
          {[54, 38, 22].map((r) => (
            <circle
              key={r}
              cx="400"
              cy="330"
              r={r}
              stroke="#EEE8DF"
              strokeOpacity="0.2"
              strokeWidth="1.2"
            />
          ))}
          {/* Ondas laterales */}
          <path
            d="M180 256 Q230 196 280 256 T380 256"
            stroke="#E85D24"
            strokeOpacity="0.45"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M520 256 Q570 196 620 256"
            stroke="#EEE8DF"
            strokeOpacity="0.22"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      );

    case 'aero-shutter':
      return (
        <svg
          className="project-artwork"
          viewBox="0 0 800 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect width="800" height="500" fill="#0F1217" />
          <rect x="440" width="360" height="500" fill="#171C24" />
          {/* Lámpara / óptica inclinada con haz diagonal */}
          <polygon
            points="350,248 110,480 490,480"
            fill="#EEE8DF"
            fillOpacity={wireframe ? '0.03' : '0.045'}
          />
          <circle
            cx="472"
            cy="152"
            r="44"
            stroke="#E85D24"
            strokeWidth={wireframe ? '2' : '9'}
          />
          <g transform="translate(400, 246) rotate(-28)">
            <path
              d="M-110 20 C-110 -68, 110 -68, 110 20 Z"
              fill={fillElevated}
              stroke={strokeMain}
              strokeOpacity={wireframe ? '0.8' : '0.26'}
              strokeWidth="1.6"
            />
            <ellipse
              cx="0"
              cy="20"
              rx="110"
              ry="22"
              fill={wireframe ? 'none' : '#C9C2B8'}
              fillOpacity={wireframe ? '0' : '0.82'}
              stroke="#E85D24"
              strokeWidth="1.5"
            />
          </g>
          <path
            d="M466 196 C546 196, 568 250, 568 480"
            stroke={strokeMain}
            strokeOpacity="0.32"
            strokeWidth={wireframe ? '2' : '14'}
            fill="none"
          />
        </svg>
      );

    case 'solar-aperture':
    default:
      return (
        <svg
          className="project-artwork"
          viewBox="0 0 800 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect width="800" height="500" fill="#101319" />
          {/* Eclipse térmico detrás de placas monolíticas */}
          <circle
            cx="448"
            cy="238"
            r="116"
            stroke="#E85D24"
            strokeWidth={wireframe ? '2' : '18'}
          />
          <rect
            x="236"
            y="108"
            width="134"
            height="284"
            fill={fillBody}
            stroke={strokeMain}
            strokeOpacity={wireframe ? '0.75' : '0.18'}
            strokeWidth="1.5"
          />
          <rect
            x="384"
            y="144"
            width="156"
            height="248"
            fill={fillElevated}
            stroke={strokeMain}
            strokeOpacity={wireframe ? '0.75' : '0.22'}
            strokeWidth="1.5"
          />
          <line x1="160" y1="392" x2="640" y2="392" stroke="#EEE8DF" strokeOpacity="0.16" />
          <line x1="384" y1="226" x2="540" y2="226" stroke="#E85D24" strokeWidth="2" />
        </svg>
      );
  }
};
