import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Layers, Sparkles, X } from 'lucide-react';
import type { ConceptualProject } from '../config/portfolio';
import { ConceptualArtwork } from './ConceptualArtwork';

interface ProjectDrawerProps {
  project: ConceptualProject | null;
  onClose: () => void;
  onSelectSibling: (direction: 'prev' | 'next') => void;
}

export const ProjectDrawer: React.FC<ProjectDrawerProps> = ({
  project,
  onClose,
  onSelectSibling,
}) => {
  const [wireframeMode, setWireframeMode] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setWireframeMode(false);
  }, [project?.id]);

  useEffect(() => {
    if (!project) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        onSelectSibling('next');
      } else if (e.key === 'ArrowLeft') {
        onSelectSibling('prev');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [project, onClose, onSelectSibling]);

  if (!project) return null;

  return (
    <div className="sheet-backdrop" onClick={onClose} role="presentation">
      <aside
        className="project-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-project-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="project-sheet__header">
          <div className="project-sheet__meta-top">
            <span className="project-sheet__index">{project.index}</span>
            <span className="project-sheet__badge">{project.statusLabel}</span>
            <span className="project-sheet__year">{project.year}</span>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            className="project-sheet__close"
            onClick={onClose}
            aria-label="Cerrar inspección del proyecto"
          >
            <span>CERRAR</span>
            <X size={18} strokeWidth={1.6} aria-hidden="true" />
          </button>
        </header>

        <div className="project-sheet__body">
          <div className="project-sheet__stage">
            <ConceptualArtwork artworkId={project.artworkId} wireframe={wireframeMode} />
            <div className="project-sheet__stage-controls">
              <button
                type="button"
                className={`stage-pill ${!wireframeMode ? 'is-active' : ''}`.trim()}
                onClick={() => setWireframeMode(false)}
                aria-pressed={!wireframeMode}
              >
                <Sparkles size={14} strokeWidth={1.6} aria-hidden="true" />
                <span>Acabado Estudio</span>
              </button>
              <button
                type="button"
                className={`stage-pill ${wireframeMode ? 'is-active' : ''}`.trim()}
                onClick={() => setWireframeMode(true)}
                aria-pressed={wireframeMode}
              >
                <Layers size={14} strokeWidth={1.6} aria-hidden="true" />
                <span>Malla Técnica</span>
              </button>
            </div>
          </div>

          <div className="project-sheet__content">
            <h3 id="sheet-project-title" className="project-sheet__title">
              <span>{project.title}</span>{' '}
              <span className="weight-hairline">{project.titleLight}</span>
            </h3>

            <p className="project-sheet__category">{project.category}</p>
            <p className="project-sheet__summary">{project.summary}</p>

            <dl className="project-sheet__metrics">
              {project.metrics.map((metric) => (
                <div key={metric.label} className="project-sheet__metric">
                  <dt>{metric.label}</dt>
                  <dd>{metric.value}</dd>
                </div>
              ))}
            </dl>

            <div className="project-sheet__notes">
              <div className="project-sheet__note-block">
                <h4>Dirección Espacial</h4>
                <p>{project.architectureNote}</p>
              </div>
              <div className="project-sheet__note-block">
                <h4>Sistema de Interacción</h4>
                <p>{project.interactionNote}</p>
              </div>
            </div>

            <div className="project-sheet__stack" aria-label="Tecnologías empleadas en el estudio">
              {project.stack.map((tech) => (
                <span key={tech} className="tech-tag">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        <footer className="project-sheet__footer">
          <button
            type="button"
            className="sheet-nav-btn"
            onClick={() => onSelectSibling('prev')}
          >
            <ArrowLeft size={16} strokeWidth={1.6} aria-hidden="true" />
            <span>Estudio anterior</span>
          </button>

          <button
            type="button"
            className="sheet-nav-btn"
            onClick={() => onSelectSibling('next')}
          >
            <span>Siguiente estudio</span>
            <ArrowRight size={16} strokeWidth={1.6} aria-hidden="true" />
          </button>
        </footer>
      </aside>
    </div>
  );
};
