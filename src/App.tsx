import React, { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  Check,
  Copy,
  Mail,
  Play,
  Sliders,
} from 'lucide-react';
import {
  PORTFOLIO_CONFIG,
  type ConceptualProject,
  type MaterialPreset,
} from './config/portfolio';
import { HeaderNav, NAV_CHAPTERS } from './components/HeaderNav';
import { MonolithFallback } from './components/MonolithFallback';
import { ConceptualArtwork } from './components/ConceptualArtwork';
import { ProjectDrawer } from './components/ProjectDrawer';
import { SocialIcon } from './components/SocialIcons';
import { ThoralLogo } from './components/ThoralLogo';

gsap.registerPlugin(ScrollTrigger);

const LazyMonolithStage = lazy(() => import('./components/MonolithStage'));

const PRESET_OPTIONS: { id: MaterialPreset; label: string; code: string }[] = [
  { id: 'anodized', label: 'Obsidiana Mate', code: 'M-01' },
  { id: 'brushed', label: 'Grafito Pulido', code: 'M-02' },
  { id: 'wireframe', label: 'Malla Técnica', code: 'M-03' },
];

export const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [materialPreset, setMaterialPreset] = useState<MaterialPreset>('anodized');
  const [selectedProject, setSelectedProject] = useState<ConceptualProject | null>(null);
  const [activeExpertiseIndex, setActiveExpertiseIndex] = useState<number>(0);
  const [reducedMotion, setReducedMotion] = useState<boolean>(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );
  const [mailDrawerOpen, setMailDrawerOpen] = useState<boolean>(false);
  const [copiedState, setCopiedState] = useState<string | null>(null);
  const [studioTime, setStudioTime] = useState<string>('');

  const scrollProgressRef = useRef<number>(0);
  const appRootRef = useRef<HTMLDivElement | null>(null);

  // Escucha dinámica de prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Reloj discreto en footer
  useEffect(() => {
    const updateClock = () => {
      try {
        const now = new Date();
        setStudioTime(
          now.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })
        );
      } catch {
        setStudioTime('00:00');
      }
    };
    updateClock();
    const timer = window.setInterval(updateClock, 30000);
    return () => window.clearInterval(timer);
  }, []);

  // Seguimiento de progreso global de scroll para la escultura 3D y detección de sección activa
  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1
      );
      scrollProgressRef.current = Math.min(1, Math.max(0, window.scrollY / maxScroll));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    const sectionElements = NAV_CHAPTERS.map((c) => document.getElementById(c.id)).filter(
      (el): el is HTMLElement => Boolean(el)
    );

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) {
          setActiveSection(visible[0].target.id);
        }
      },
      {
        rootMargin: '-25% 0px -45% 0px',
        threshold: [0.1, 0.35, 0.6],
      }
    );

    sectionElements.forEach((sec) => observer.observe(sec));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  // Coreografía cinematográfica con GSAP + ScrollTrigger (contenida y respetuosa con reduced-motion)
  useEffect(() => {
    if (reducedMotion || !appRootRef.current) return;

    const ctx = gsap.context(() => {
      // Secuencia focal de entrada del Hero (el contenido es visible por defecto si JS no corre)
      gsap.fromTo(
        '.js-hero-item',
        { y: 22, opacity: 0.01 },
        {
          y: 0,
          opacity: 1,
          duration: 0.78,
          stagger: 0.08,
          ease: 'expo.out',
          clearProps: 'transform,opacity',
        }
      );

      gsap.fromTo(
        '.js-hero-slab',
        { y: 18, opacity: 0.01 },
        {
          y: 0,
          opacity: 1,
          duration: 0.85,
          delay: 0.22,
          stagger: 0.1,
          ease: 'expo.out',
          clearProps: 'transform,opacity',
        }
      );

      // Parallax sutil del plano arquitectónico diagonal y bloques de proyecto
      gsap.utils.toArray<HTMLElement>('.js-reveal-section').forEach((section) => {
        gsap.fromTo(
          section,
          { y: 28, opacity: 0.15 },
          {
            y: 0,
            opacity: 1,
            duration: 0.72,
            ease: 'power3.out',
            clearProps: 'transform,opacity',
            scrollTrigger: {
              trigger: section,
              start: 'top 86%',
              once: true,
            },
          }
        );
      });
    }, appRootRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  const scrollToSection = useCallback(
    (sectionId: string) => {
      const target = document.getElementById(sectionId);
      if (!target) return;
      target.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });
    },
    [reducedMotion]
  );

  const handleSelectSiblingProject = useCallback(
    (direction: 'prev' | 'next') => {
      if (!selectedProject) return;
      const list = PORTFOLIO_CONFIG.selectedWork.projects;
      const currentIdx = list.findIndex((p) => p.id === selectedProject.id);
      if (currentIdx === -1) return;
      const nextIdx =
        direction === 'next'
          ? (currentIdx + 1) % list.length
          : (currentIdx - 1 + list.length) % list.length;
      setSelectedProject(list[nextIdx]);
    },
    [selectedProject]
  );

  const handleDomainSelect = (idx: number) => {
    setActiveExpertiseIndex(idx);
    const chosen = PORTFOLIO_CONFIG.expertise.domains[idx];
    if (chosen) {
      setMaterialPreset(chosen.monolithPreset);
    }
  };

  const handleMailAction = () => {
    if (PORTFOLIO_CONFIG.contact.email) {
      window.location.href = `mailto:${PORTFOLIO_CONFIG.contact.email}`;
    } else {
      setMailDrawerOpen((prev) => !prev);
    }
  };

  const handleCopyText = async (value: string, tag: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedState(tag);
      window.setTimeout(() => setCopiedState(null), 2400);
    } catch {
      setCopiedState(null);
    }
  };

  const activeDomain = PORTFOLIO_CONFIG.expertise.domains[activeExpertiseIndex];

  return (
    <div ref={appRootRef} className="thoral-shell">
      <HeaderNav
        activeSection={activeSection}
        mobileOpen={mobileMenuOpen}
        onToggleMobile={() => setMobileMenuOpen((v) => !v)}
        onCloseMobile={() => setMobileMenuOpen(false)}
        onNavigate={scrollToSection}
      />

      <main id="main-content" className="thoral-main">
        {/* ============================================================
            01. HERO — ESCENARIO ARQUITECTÓNICO DIVIDIDO + ESCULTURA 3D
            ============================================================ */}
        <section id="hero" className="hero-stage" aria-labelledby="hero-heading">
          {/* Planos arquitectónicos de fondo inspirados en Blvck Tumbler + LUMIER DARK */}
          <div className="hero-stage__planes" aria-hidden="true">
            <div className="hero-plane hero-plane--obsidian" />
            <div className="hero-plane hero-plane--slate">
              {/* Marca tipográfica grabada a bajo contraste en el plano derecho */}
              <svg
                className="hero-watermark"
                viewBox="0 0 920 340"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <text
                  x="16"
                  y="152"
                  fill="currentColor"
                  fontSize="168"
                  fontWeight="800"
                  letterSpacing="-4"
                >
                  Thoral
                </text>
                <text
                  x="96"
                  y="308"
                  fill="currentColor"
                  fontSize="158"
                  fontWeight="700"
                  letterSpacing="-3"
                >
                  Atelier
                </text>
              </svg>
            </div>
            <div className="hero-plane hero-plane--beam" />
          </div>

          <div className="hero-stage__grid container-frame">
            {/* Bloque editorial principal (izquierda superior) */}
            <div className="hero-editorial">
              <h1 id="hero-heading" className="hero-title js-hero-item">
                <span className="hero-title__bold">{PORTFOLIO_CONFIG.hero.headlineBold}</span>
                <span className="hero-title__light">{PORTFOLIO_CONFIG.hero.headlineLight}</span>
              </h1>

              <p className="hero-lead js-hero-item">{PORTFOLIO_CONFIG.hero.lead}</p>

              <div className="hero-cta-group js-hero-item">
                <button
                  type="button"
                  className="btn-signal"
                  onClick={() => scrollToSection('work')}
                >
                  <span>{PORTFOLIO_CONFIG.hero.ctaPrimary}</span>
                  <ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" />
                </button>

                <button
                  type="button"
                  className="btn-architectural"
                  onClick={() => scrollToSection('contact')}
                >
                  <span>{PORTFOLIO_CONFIG.hero.ctaSecondary}</span>
                </button>
              </div>

              {/* Selector interactivo de acabado 3D en tiempo real */}
              <div
                className="material-switcher js-hero-item"
                role="group"
                aria-label="Acabado superficial de la escultura 3D"
              >
                <span className="material-switcher__icon" aria-hidden="true">
                  <Sliders size={14} strokeWidth={1.6} />
                </span>
                {PRESET_OPTIONS.map((opt) => {
                  const active = materialPreset === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      className={`material-chip ${active ? 'is-active' : ''}`.trim()}
                      aria-pressed={active}
                      onClick={() => setMaterialPreset(opt.id)}
                    >
                      <span className="material-chip__code">{opt.code}</span>
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Centro / Derecha: Protagonista Tridimensional THORAL */}
            <div className="hero-sculpture-zone">
              <Suspense fallback={<MonolithFallback reason="loading" />}>
                <LazyMonolithStage
                  preset={materialPreset}
                  reducedMotion={reducedMotion}
                  scrollProgressRef={scrollProgressRef}
                />
              </Suspense>
            </div>

            {/* Placas flotantes asimétricas de especificación (inspiradas en Blvck Tumbler) */}
            <div className="hero-slab hero-slab--left js-hero-slab">
              <p className="hero-slab__title">{PORTFOLIO_CONFIG.hero.leftSpecTitle}</p>
              <p className="hero-slab__body">{PORTFOLIO_CONFIG.hero.leftSpecBody}</p>
            </div>

            <div className="hero-slab hero-slab--right js-hero-slab">
              <div className="hero-slab__copy">
                <p className="hero-slab__title">{PORTFOLIO_CONFIG.hero.rightSpecTitle}</p>
                <p className="hero-slab__body">{PORTFOLIO_CONFIG.hero.rightSpecBody}</p>
              </div>
              <button
                type="button"
                className="circle-trigger"
                aria-label="Inspeccionar primer estudio conceptual"
                onClick={() => setSelectedProject(PORTFOLIO_CONFIG.selectedWork.projects[0])}
              >
                <Play size={14} strokeWidth={2} fill="currentColor" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Barra inferior del escenario Hero con progreso e indicador de scroll */}
          <div className="hero-footer-bar container-frame">
            <div className="hero-progress" aria-hidden="true">
              <span className="hero-progress__fill" />
              <span className="hero-progress__code">01 / 05</span>
            </div>

            <button
              type="button"
              className="scroll-cue"
              onClick={() => scrollToSection('about')}
              aria-label="Desplazar hacia Identidad"
            >
              <span>SCROLL</span>
              <ArrowDown size={15} strokeWidth={1.7} aria-hidden="true" />
            </button>

            <div className="hero-edition">
              <span>EDICIÓN {PORTFOLIO_CONFIG.brand.edition}</span>
            </div>
          </div>
        </section>

        {/* ============================================================
            02. ABOUT — IDENTIDAD PERSONAL (SIN INVENTAR DATOS)
            ============================================================ */}
        <section
          id="about"
          className="section-block section-about js-reveal-section"
          aria-labelledby="about-heading"
        >
          <div className="container-frame">
            <div className="about-layout">
              <div className="about-lead-col">
                <h2 id="about-heading" className="section-heading">
                  <span>{PORTFOLIO_CONFIG.about.headingBold}</span>
                  <span className="weight-hairline">{PORTFOLIO_CONFIG.about.headingLight}</span>
                </h2>

                <p className="about-manifesto">{PORTFOLIO_CONFIG.about.statement}</p>

                <div className="provisional-callout" role="note">
                  <span className="provisional-callout__tag">
                    {PORTFOLIO_CONFIG.about.provisionalBadge}
                  </span>
                  <p>{PORTFOLIO_CONFIG.about.provisionalBio}</p>
                </div>
              </div>

              <div className="about-detail-col">
                <dl className="identity-ledger" aria-label="Ficha de identidad configurable">
                  {PORTFOLIO_CONFIG.about.parameters.map((param) => (
                    <div key={param.label} className="identity-ledger__row">
                      <dt className="identity-ledger__term">{param.label}</dt>
                      <dd className="identity-ledger__val">
                        <span>{param.value}</span>
                        <small>{param.note}</small>
                      </dd>
                    </div>
                  ))}
                </dl>

                <div className="principles-strip">
                  {PORTFOLIO_CONFIG.about.principles.map((item, idx) => (
                    <article key={item.title} className="principle-item">
                      <h3 className="principle-item__title">{item.title}</h3>
                      <p className="principle-item__body">{item.body}</p>
                      <span className="principle-item__idx" aria-hidden="true">
                        0{idx + 1}
                      </span>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            03. SELECTED WORK — COMPOSICIÓN ASIMÉTRICA EDITORIAL
            ============================================================ */}
        <section
          id="work"
          className="section-block section-work js-reveal-section"
          aria-labelledby="work-heading"
        >
          <div className="container-frame">
            <div className="work-header">
              <h2 id="work-heading" className="section-heading">
                <span>{PORTFOLIO_CONFIG.selectedWork.headingBold}</span>
                <span className="weight-hairline">
                  {PORTFOLIO_CONFIG.selectedWork.headingLight}
                </span>
              </h2>
              <p className="work-header__note">{PORTFOLIO_CONFIG.selectedWork.disclaimer}</p>
            </div>

            <div className="work-gallery">
              {PORTFOLIO_CONFIG.selectedWork.projects.map((project) => (
                <article
                  key={project.id}
                  className={`work-piece work-piece--${project.layoutVariant}`}
                >
                  <div
                    className="work-piece__media"
                    onClick={() => setSelectedProject(project)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Inspeccionar estudio conceptual ${project.title} ${project.titleLight}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedProject(project);
                      }
                    }}
                  >
                    <ConceptualArtwork artworkId={project.artworkId} />
                    <div className="work-piece__overlay">
                      <span className="work-piece__status">{project.statusLabel}</span>
                      <span className="work-piece__explore">
                        <span>Inspeccionar</span>
                        <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
                      </span>
                    </div>
                  </div>

                  <div className="work-piece__body">
                    <h3 className="work-piece__title">
                      <span>{project.title}</span>{' '}
                      <span className="weight-hairline">{project.titleLight}</span>
                    </h3>

                    <p className="work-piece__desc">{project.summary}</p>

                    <div className="work-piece__meta">
                      <span className="work-piece__num">{project.index}</span>
                      <span className="work-piece__cat">{project.category}</span>
                      <span className="work-piece__year">{project.year}</span>
                    </div>

                    <div className="work-piece__actions">
                      <button
                        type="button"
                        className="btn-inline-explore"
                        onClick={() => setSelectedProject(project)}
                      >
                        <span>Explorar arquitectura</span>
                        <ArrowUpRight size={15} strokeWidth={1.8} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================
            04. EXPERTISE — MATRIZ ARQUITECTÓNICA CONFIGURABLE
            ============================================================ */}
        <section
          id="expertise"
          className="section-block section-expertise js-reveal-section"
          aria-labelledby="expertise-heading"
        >
          <div className="container-frame">
            <div className="expertise-head">
              <h2 id="expertise-heading" className="section-heading">
                <span>{PORTFOLIO_CONFIG.expertise.headingBold}</span>
                <span className="weight-hairline">{PORTFOLIO_CONFIG.expertise.headingLight}</span>
              </h2>
              <p className="expertise-head__note">
                {PORTFOLIO_CONFIG.expertise.configurableNotice}
              </p>
            </div>

            <div className="expertise-matrix">
              <div
                className="expertise-selector"
                role="tablist"
                aria-label="Dominios de especialidad"
              >
                {PORTFOLIO_CONFIG.expertise.domains.map((domain, index) => {
                  const selected = index === activeExpertiseIndex;
                  return (
                    <button
                      key={domain.id}
                      id={`tab-${domain.id}`}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      aria-controls={`panel-${domain.id}`}
                      className={`expertise-tab ${selected ? 'is-selected' : ''}`.trim()}
                      onClick={() => handleDomainSelect(index)}
                    >
                      <span className="expertise-tab__code">{domain.code}</span>
                      <span className="expertise-tab__label">
                        <strong>{domain.title}</strong>{' '}
                        <span className="weight-hairline">{domain.titleLight}</span>
                      </span>
                      <ArrowUpRight
                        className="expertise-tab__arrow"
                        size={17}
                        strokeWidth={1.6}
                        aria-hidden="true"
                      />
                    </button>
                  );
                })}
              </div>

              {activeDomain && (
                <div
                  id={`panel-${activeDomain.id}`}
                  role="tabpanel"
                  aria-labelledby={`tab-${activeDomain.id}`}
                  className="expertise-detail"
                >
                  <h3 className="expertise-detail__title">
                    <span>{activeDomain.title}</span>{' '}
                    <span className="weight-hairline">{activeDomain.titleLight}</span>
                  </h3>

                  <p className="expertise-detail__summary">{activeDomain.summary}</p>

                  <div className="expertise-columns">
                    <div className="expertise-col">
                      <h4>Capacidades Configurables</h4>
                      <ul>
                        {activeDomain.capabilities.map((cap) => (
                          <li key={cap}>{cap}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="expertise-col">
                      <h4>Aplicaciones</h4>
                      <ul>
                        {activeDomain.deliverables.map((del) => (
                          <li key={del}>{del}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ============================================================
            05. CONTACT — CIERRE VISUAL POTENTE Y CONFIGURABLE
            ============================================================ */}
        <section
          id="contact"
          className="section-block section-contact js-reveal-section"
          aria-labelledby="contact-heading"
        >
          <div className="container-frame">
            <div className="contact-stage">
              <div className="contact-stage__ring" aria-hidden="true" />

              <div className="contact-stage__main">
                <h2 id="contact-heading" className="contact-heading">
                  <span>{PORTFOLIO_CONFIG.contact.headingBold}</span>
                  <span className="weight-hairline">{PORTFOLIO_CONFIG.contact.headingLight}</span>
                </h2>

                <p className="contact-lead">{PORTFOLIO_CONFIG.contact.lead}</p>

                <div className="contact-actions">
                  <button type="button" className="btn-signal" onClick={handleMailAction}>
                    <Mail size={16} strokeWidth={1.8} aria-hidden="true" />
                    <span>
                      {PORTFOLIO_CONFIG.contact.email
                        ? `Escribir a ${PORTFOLIO_CONFIG.contact.email}`
                        : 'Canal de correo (Configurar)'}
                    </span>
                  </button>

                  <a
                    href={PORTFOLIO_CONFIG.brand.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-architectural"
                  >
                    <span>Repositorio GitHub</span>
                    <ArrowUpRight size={16} strokeWidth={1.75} aria-hidden="true" />
                  </a>
                </div>

                {mailDrawerOpen && !PORTFOLIO_CONFIG.contact.email && (
                  <div className="contact-config-box" role="region" aria-label="Configuración de correo">
                    <p className="contact-config-box__text">
                      Para mantener rigor absoluto sin inventar direcciones personales, el correo
                      electrónico está listo para definirse en{' '}
                      <code>src/config/portfolio.ts</code> (campo <code>contact.email</code>).
                    </p>
                    <button
                      type="button"
                      className="btn-copy-snippet"
                      onClick={() =>
                        handleCopyText(
                          "email: 'tu-correo@dominio.com',",
                          'email-snippet'
                        )
                      }
                    >
                      {copiedState === 'email-snippet' ? (
                        <>
                          <Check size={15} strokeWidth={1.8} aria-hidden="true" />
                          <span>Línea copiada al portapapeles</span>
                        </>
                      ) : (
                        <>
                          <Copy size={15} strokeWidth={1.8} aria-hidden="true" />
                          <span>Copiar línea de configuración</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                <p className="contact-hint">{PORTFOLIO_CONFIG.contact.configurableHint}</p>
              </div>

              <div className="contact-socials" aria-label="Canales y redes configurables">
                {PORTFOLIO_CONFIG.contact.socials.map((soc) =>
                  soc.url ? (
                    <a
                      key={soc.id}
                      href={soc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-row social-row--live"
                    >
                      <span className="social-row__left">
                        <SocialIcon id={soc.id} />
                        <span className="social-row__name">{soc.label}</span>
                      </span>
                      <span className="social-row__right">
                        <span className="social-row__handle">{soc.handle}</span>
                        <ArrowUpRight size={16} strokeWidth={1.7} aria-hidden="true" />
                      </span>
                    </a>
                  ) : (
                    <button
                      key={soc.id}
                      type="button"
                      className="social-row social-row--configurable"
                      onClick={() => handleCopyText(`id: '${soc.id}'`, soc.id)}
                      title={soc.configurableNote}
                    >
                      <span className="social-row__left">
                        <SocialIcon id={soc.id} />
                        <span className="social-row__name">{soc.label}</span>
                      </span>
                      <span className="social-row__right">
                        <span className="social-row__handle">
                          {copiedState === soc.id ? 'Clave copiada' : soc.handle}
                        </span>
                        <Copy size={14} strokeWidth={1.6} aria-hidden="true" />
                      </span>
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ============================================================
          FOOTER MINIMALISTA DE ESTUDIO
          ============================================================ */}
      <footer className="site-footer">
        <div className="container-frame site-footer__inner">
          <div className="site-footer__brand">
            <ThoralLogo compact />
            <span className="site-footer__copy">
              THORAL — {PORTFOLIO_CONFIG.brand.domain}
            </span>
          </div>

          <div className="site-footer__meta">
            {studioTime && <span className="site-footer__clock">LOCAL {studioTime}</span>}
            <button
              type="button"
              className="back-top-btn"
              onClick={() => scrollToSection('hero')}
              aria-label="Volver al inicio de la página"
            >
              <span>ARRIBA</span>
              <ArrowUp size={14} strokeWidth={1.8} aria-hidden="true" />
            </button>
          </div>
        </div>
      </footer>

      <ProjectDrawer
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onSelectSibling={handleSelectSiblingProject}
      />
    </div>
  );
};

export default App;
