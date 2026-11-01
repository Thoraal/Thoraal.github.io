import React from 'react';

interface ThoralLogoProps {
  compact?: boolean;
  className?: string;
}

/**
 * Emblema geométrico original THORAL en SVG puro.
 * Combina el monolito arquitectónico 'T' en hueso cálido con el anillo orbital
 * naranja señal ocluido detrás del hombro superior derecho.
 */
export const ThoralLogo: React.FC<ThoralLogoProps> = ({ compact = false, className = '' }) => {
  return (
    <span className={`thoral-brand ${className}`.trim()}>
      <svg
        className="thoral-brand__mark"
        width="32"
        height="32"
        viewBox="0 0 36 36"
        fill="none"
        aria-hidden="true"
      >
        {/* Anillo orbital naranja parcialmente ocluido */}
        <path
          d="M20.5 7.2A7.5 7.5 0 1 1 28.8 18.5"
          stroke="var(--accent-orange)"
          strokeWidth="2.4"
          strokeLinecap="square"
        />
        {/* Monolito geométrico T */}
        <path d="M5 10H23V14.2H16.2V29H11.8V14.2H5V10Z" fill="var(--fg-primary)" />
        {/* Corte transversal arquitectónico */}
        <rect x="19" y="21.5" width="11" height="2.6" fill="var(--fg-primary)" />
      </svg>
      {!compact && (
        <span className="thoral-brand__wordmark">
          THORAL<span className="thoral-brand__dot" aria-hidden="true" />
        </span>
      )}
    </span>
  );
};
