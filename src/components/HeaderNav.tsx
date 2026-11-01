import React, { useEffect, useRef } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { ThoralLogo } from './ThoralLogo';

export interface NavChapter {
  id: string;
  num: string;
  label: string;
}

export const NAV_CHAPTERS: NavChapter[] = [
  { id: 'hero', num: '01', label: 'Inicio' },
  { id: 'about', num: '02', label: 'Identidad' },
  { id: 'work', num: '03', label: 'Proyectos' },
  { id: 'expertise', num: '04', label: 'Especialidad' },
  { id: 'contact', num: '05', label: 'Contacto' },
];

interface HeaderNavProps {
  activeSection: string;
  mobileOpen: boolean;
  onToggleMobile: () => void;
  onCloseMobile: () => void;
  onNavigate: (sectionId: string) => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  activeSection,
  mobileOpen,
  onToggleMobile,
  onCloseMobile,
  onNavigate,
}) => {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const triggerBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!mobileOpen) return;

    closeBtnRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseMobile();
        triggerBtnRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [mobileOpen, onCloseMobile]);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    onNavigate(id);
    if (mobileOpen) {
      onCloseMobile();
    }
  };

  return (
    <>
      <a className="skip-link" href="#main-content">
        Saltar al contenido principal
      </a>

      <header className="site-header">
        <div className="site-header__inner">
          <a
            href="#hero"
            className="site-header__brand"
            aria-label="THORAL — Volver al inicio"
            onClick={(e) => handleLinkClick(e, 'hero')}
          >
            <ThoralLogo />
          </a>

          <nav className="site-header__nav" aria-label="Navegación principal">
            <ul className="site-header__list">
              {NAV_CHAPTERS.slice(1).map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className={`site-header__link ${isActive ? 'is-active' : ''}`.trim()}
                      aria-current={isActive ? 'true' : undefined}
                      onClick={(e) => handleLinkClick(e, item.id)}
                    >
                      <span className="site-header__link-num">{item.num}</span>
                      <span>{item.label}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="site-header__actions">
            <a
              href="#contact"
              className="site-header__cta"
              onClick={(e) => handleLinkClick(e, 'contact')}
            >
              <span>Conectar</span>
              <ArrowUpRight size={15} strokeWidth={1.75} aria-hidden="true" />
            </a>

            <button
              ref={triggerBtnRef}
              type="button"
              className="site-header__menu-btn"
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation-drawer"
              aria-label={mobileOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
              onClick={onToggleMobile}
            >
              <span className="site-header__menu-label">MENU</span>
              <span className="site-header__menu-box" aria-hidden="true">
                {mobileOpen ? <X size={18} strokeWidth={1.6} /> : <Menu size={18} strokeWidth={1.6} />}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Riel vertical de profundidad (inspirado en el índice lateral 01-04 de LUMIER DARK) */}
      <aside className="depth-rail" aria-label="Índice de capítulos">
        <ol className="depth-rail__list">
          {NAV_CHAPTERS.map((chap) => {
            const active = activeSection === chap.id;
            return (
              <li key={chap.id} className="depth-rail__item">
                <a
                  href={`#${chap.id}`}
                  className={`depth-rail__link ${active ? 'is-active' : ''}`.trim()}
                  aria-label={`Capítulo ${chap.num}: ${chap.label}`}
                  aria-current={active ? 'true' : undefined}
                  onClick={(e) => handleLinkClick(e, chap.id)}
                >
                  <span className="depth-rail__tick" aria-hidden="true" />
                  <span className="depth-rail__num">{chap.num}</span>
                </a>
              </li>
            );
          })}
        </ol>
      </aside>

      {/* Menú móvil de pantalla completa adaptado a interacción táctil */}
      <div
        id="mobile-navigation-drawer"
        className={`mobile-drawer ${mobileOpen ? 'is-open' : ''}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-label="Navegación móvil THORAL"
        hidden={!mobileOpen}
      >
        <div className="mobile-drawer__top">
          <ThoralLogo />
          <button
            ref={closeBtnRef}
            type="button"
            className="mobile-drawer__close"
            onClick={onCloseMobile}
            aria-label="Cerrar menú"
          >
            <span>CERRAR</span>
            <X size={20} strokeWidth={1.6} aria-hidden="true" />
          </button>
        </div>

        <nav className="mobile-drawer__nav" aria-label="Secciones del portfolio">
          <ol className="mobile-drawer__list">
            {NAV_CHAPTERS.map((chap) => {
              const active = activeSection === chap.id;
              return (
                <li key={chap.id} className="mobile-drawer__item">
                  <a
                    href={`#${chap.id}`}
                    className={`mobile-drawer__link ${active ? 'is-active' : ''}`.trim()}
                    onClick={(e) => handleLinkClick(e, chap.id)}
                  >
                    <span className="mobile-drawer__num">{chap.num}</span>
                    <span className="mobile-drawer__text">{chap.label}</span>
                    <ArrowUpRight size={20} strokeWidth={1.5} aria-hidden="true" />
                  </a>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="mobile-drawer__foot">
          <span>THORAL DIGITAL ATELIER</span>
          <span>EDICIÓN 2026</span>
        </div>
      </div>
    </>
  );
};
