export type MaterialPreset = 'anodized' | 'brushed' | 'wireframe';

export interface ConceptualProject {
  id: string;
  index: string;
  title: string;
  titleLight: string;
  category: string;
  year: string;
  statusLabel: string;
  layoutVariant: 'flagship' | 'offset-left' | 'offset-right' | 'wide-strip';
  artworkId: 'monolith-chrono' | 'acoustic-field' | 'aero-shutter' | 'solar-aperture';
  summary: string;
  architectureNote: string;
  interactionNote: string;
  stack: string[];
  metrics: { label: string; value: string }[];
}

export interface ExpertiseDomain {
  id: string;
  code: string;
  title: string;
  titleLight: string;
  summary: string;
  capabilities: string[];
  deliverables: string[];
  monolithPreset: MaterialPreset;
}

export interface SocialEndpoint {
  id: 'github' | 'linkedin' | 'x' | 'dribbble';
  label: string;
  handle: string;
  url: string | null;
  configurableNote: string;
}

/**
 * Configuración centralizada de THORAL.
 * Todos los datos personales, áreas de especialidad y canales de contacto
 * están desacoplados aquí sin inventar biografía, certificaciones, clientes
 * ni correos inexistentes.
 */
export const PORTFOLIO_CONFIG = {
  brand: {
    name: 'THORAL',
    taglineBold: 'THORAL',
    taglineLight: 'ATELIER',
    domain: 'Thoraal.github.io',
    repositoryUrl: 'https://github.com/Thoraal/Thoraal.github.io',
    edition: '2026',
  },

  hero: {
    headlineBold: 'THORAL',
    headlineLight: 'ATELIER',
    lead: 'Dirección creativa digital, experiencias interactivas en tres dimensiones e ingeniería frontend de precisión.',
    ctaPrimary: 'Explorar obras',
    ctaSecondary: 'Contacto',
    leftSpecTitle: 'Arquitectura espacial.',
    leftSpecBody:
      'Composición editorial sobre planos de obsidiana mate, iluminación de estudio y profundidad WebGL en tiempo real.',
    rightSpecTitle: 'El sistema visual.',
    rightSpecBody:
      'Geometría industrial anodizada, oclusión física y movimiento calibrado para cada pantalla.',
  },

  about: {
    headingBold: 'IDENTIDAD',
    headingLight: 'CREATIVA',
    provisionalBadge: 'PERFIL CONFIGURABLE — TEXTO PROVISIONAL',
    statement:
      'Construyo productos y experiencias digitales donde la precisión técnica del código se funde con la dirección de arte cinematográfica.',
    provisionalBio:
      '[Espacio reservado para tu presentación personal real: trayectoria, enfoque creativo, ubicación y visión profesional. Edita este bloque directamente en src/config/portfolio.ts sin alterar la arquitectura visual.]',
    parameters: [
      {
        label: 'Marca',
        value: 'THORAL',
        note: 'Identidad digital propia',
      },
      {
        label: 'Enfoque',
        value: '[Configurable — Ej. Creative Developer / UI Engineer]',
        note: 'Rol principal editable',
      },
      {
        label: 'Ubicación',
        value: '[Configurable — Ciudad / Zona horaria]',
        note: 'Dato personal pendiente de definir',
      },
      {
        label: 'Disponibilidad',
        value: '[Configurable — Proyectos selectos / Colaboraciones]',
        note: 'Estado editable en configuración',
      },
    ],
    principles: [
      {
        title: 'Forma con propósito',
        body: 'Cada plano oscuro, corte arquitectónico y acento lumínico responde a una jerarquía de lectura clara, nunca a decoración superflua.',
      },
      {
        title: 'Profundidad física en la web',
        body: 'Los materiales 3D, las sombras de contacto y la iluminación de borde aportan volumen táctil manteniendo 60 fotogramas estables.',
      },
      {
        title: 'Ingeniería adaptable',
        body: 'Desde monitores 4K ultrawide hasta teléfonos compactos de 320 px, cada composición se rediseña para su método de entrada.',
      },
    ],
  },

  selectedWork: {
    headingBold: 'OBRA',
    headingLight: 'SELECCIONADA',
    disclaimer:
      'Estudios conceptuales y demostrativos diseñados para exhibir dirección de arte, sistemas interactivos y arquitectura visual. Reemplázalos o amplíalos en src/config/portfolio.ts.',
    projects: [
      {
        id: 'obsidian-chrono',
        index: '01',
        title: 'OBSIDIAN',
        titleLight: 'CHRONOGRAPH',
        category: 'Experiencia 3D de Producto · WebGL',
        year: '2026',
        statusLabel: 'CONCEPTUAL',
        layoutVariant: 'flagship',
        artworkId: 'monolith-chrono',
        summary:
          'Exploración interactiva de alta relojería industrial en titanio negro granallado con bisel orbital en cobre anodizado e iluminación rasante controlada por el cursor.',
        architectureNote:
          'Escena concebida sobre cámara ortográfica-perspectiva híbrida, mapas de rugosidad procedurales y transiciones de plano sin cortes de página.',
        interactionNote:
          'Inspección rotacional amortiguada, cambio entre vista de acabado físico y malla estructural de precisión.',
        stack: ['Three.js', 'GLSL Shaders', 'TypeScript', 'GSAP'],
        metrics: [
          { label: 'Naturaleza', value: 'Estudio Conceptual' },
          { label: 'Renderizado', value: 'PBR Tiempo Real' },
          { label: 'Objetivo FPS', value: '60 Hz Adaptativo' },
        ],
      },
      {
        id: 'lumier-acoustics',
        index: '02',
        title: 'KINETIC',
        titleLight: 'ACOUSTICS',
        category: 'Dirección Editorial · Audio Espacial UI',
        year: '2026',
        statusLabel: 'CONCEPTUAL',
        layoutVariant: 'offset-left',
        artworkId: 'acoustic-field',
        summary:
          'Interfaz editorial oscura para un monitor acústico monolítico, donde ondas estacionarias y anillos térmicos traducen frecuencias en relieve tridimensional.',
        architectureNote:
          'Sistema tipográfico de alto contraste de pesos con retícula asimétrica de doce columnas y paneles flotantes de especificación.',
        interactionNote:
          'Respuesta progresiva vinculada al desplazamiento y controles táctiles de calibración armónica.',
        stack: ['React', 'Web Audio Visuals', 'CSS Grid', 'Canvas PBR'],
        metrics: [
          { label: 'Naturaleza', value: 'Estudio Conceptual' },
          { label: 'Escala', value: '320 px — 3840 px' },
          { label: 'Contraste', value: 'WCAG AA Verificado' },
        ],
      },
      {
        id: 'aero-shutter',
        index: '03',
        title: 'APERTURE',
        titleLight: 'INSTRUMENT',
        category: 'Sistema de Diseño · Hardware Óptico',
        year: '2026',
        statusLabel: 'CONCEPTUAL',
        layoutVariant: 'offset-right',
        artworkId: 'aero-shutter',
        summary:
          'Presentación digital para óptica cinematográfica de formato medio: diafragma geométrico multicapa, lecturas tabulares de exposición y microinteracciones mecánicas.',
        architectureNote:
          'Tokens semánticos de cuatro zonas tonales oscuras para separar planos sin abuso de bordes ni sombras artificiales.',
        interactionNote:
          'Apertura de hojas mecánicas sincronizada con la inspección del usuario y soporte íntegro por teclado.',
        stack: ['TypeScript', 'Design Tokens', 'GSAP ScrollTrigger', 'SVG'],
        metrics: [
          { label: 'Naturaleza', value: 'Estudio Conceptual' },
          { label: 'Iconografía', value: '100% Vectorial SVG' },
          { label: 'Accesibilidad', value: 'Reduced Motion' },
        ],
      },
      {
        id: 'monolith-spatial',
        index: '04',
        title: 'THERMAL',
        titleLight: 'ARCHITECTURE',
        category: 'Instalación Web Inmersiva · Shaders',
        year: '2026',
        statusLabel: 'CONCEPTUAL',
        layoutVariant: 'wide-strip',
        artworkId: 'solar-aperture',
        summary:
          'Estudio arquitectónico de luz rasante sobre volúmenes de hormigón negro y acero pavonado, explorando eclipses parciales y penumbras dinámicas.',
        architectureNote:
          'Carga diferida de recursos gráficos, división de paquetes y degradación elegante para dispositivos de bajo consumo.',
        interactionNote:
          'Control de ángulo lumínico e inspección de capas constructivas en panel lateral.',
        stack: ['WebGL', 'Fresnel GLSL', 'Vite', 'Responsive Engineering'],
        metrics: [
          { label: 'Naturaleza', value: 'Estudio Conceptual' },
          { label: 'Arquitectura', value: 'Modular / Lazy' },
          { label: 'Despliegue', value: 'GitHub Pages CI' },
        ],
      },
    ] as ConceptualProject[],
  },

  expertise: {
    headingBold: 'ÁREAS DE',
    headingLight: 'ESPECIALIDAD',
    configurableNotice:
      'Estructura modular de capacidades lista para personalizar con tus tecnologías, herramientas y dominios reales en src/config/portfolio.ts.',
    domains: [
      {
        id: 'spatial-webgl',
        code: '01',
        title: 'EXPERIENCIAS 3D',
        titleLight: '& WEBGL',
        summary:
          'Escenas tridimensionales interactivas integradas con la composición tipográfica: materiales físicos, iluminación cinematográfica, shaders personalizados y rendimiento controlado.',
        capabilities: [
          'Three.js & WebGL Pipeline',
          'Materiales PBR, Clearcoat & Rugosidad Procedural',
          'Shaders GLSL (Fresnel, Iluminación de Borde)',
          'Optimización DPR & Fallback No-WebGL',
        ],
        deliverables: [
          'Escenarios hero interactivos',
          'Visualizadores conceptuales de producto',
          'Narrativas espaciales vinculadas al scroll',
        ],
        monolithPreset: 'anodized',
      },
      {
        id: 'frontend-architecture',
        code: '02',
        title: 'ARQUITECTURA',
        titleLight: 'FRONTEND',
        summary:
          'Desarrollo modular en TypeScript y React con semántica estricta, carga diferida, cero desbordamiento horizontal y compilación automatizada para producción.',
        capabilities: [
          'React 19 & TypeScript Estricto',
          'Code Splitting & Lazy Loading',
          'Ingeniería Responsive (320 px a 4K)',
          'Automatización CI/CD con GitHub Actions',
        ],
        deliverables: [
          'Aplicaciones web de alto rendimiento',
          'Sistemas de componentes tipados',
          'Sitios estáticos optimizados para SEO',
        ],
        monolithPreset: 'brushed',
      },
      {
        id: 'motion-direction',
        code: '03',
        title: 'MOTION DESIGN',
        titleLight: '& INTERACCIÓN',
        summary:
          'Coreografía de movimiento con aceleración y desaceleración física natural, transiciones de continuidad espacial y respeto total por prefers-reduced-motion.',
        capabilities: [
          'GSAP & ScrollTrigger',
          'Seguimiento Inercial de Cursor',
          'Transiciones de Estado e Inspección',
          'Accesibilidad por Teclado y Foco Visible',
        ],
        deliverables: [
          'Secuencias de entrada editoriales',
          'Microinteracciones táctiles y de puntero',
          'Sistemas de navegación fluidos',
        ],
        monolithPreset: 'wireframe',
      },
      {
        id: 'visual-systems',
        code: '04',
        title: 'DIRECCIÓN VISUAL',
        titleLight: '& UI SYSTEMS',
        summary:
          'Construcción de identidades digitales memorables mediante jerarquías tipográficas fluidas, tokens cromáticos calibrados e iconografía vectorial a medida.',
        capabilities: [
          'Sistemas de Tokens CSS & DESIGN.md',
          'Tipografía Fluida con clamp()',
          'Iconografía y Emblemas SVG Originales',
          'Auditoría de Contraste y Legibilidad',
        ],
        deliverables: [
          'Identidades visuales para marcas digitales',
          'Sistemas de diseño documentados',
          'Interfaces dark-luxury de alta precisión',
        ],
        monolithPreset: 'anodized',
      },
    ] as ExpertiseDomain[],
  },

  contact: {
    headingBold: 'INICIAR',
    headingLight: 'CONVERSACIÓN',
    lead: 'Abierto a colaboraciones creativas, proyectos digitales a medida y dirección técnica frontend.',
    email: null as string | null,
    emailPlaceholderDisplay: 'correo@configurable-en-config.ts',
    configurableHint:
      'Correo y perfiles sociales configurables en src/config/portfolio.ts (sin datos inventados).',
    socials: [
      {
        id: 'github',
        label: 'GitHub',
        handle: 'github.com/Thoraal',
        url: 'https://github.com/Thoraal',
        configurableNote: 'Repositorio verificado del proyecto',
      },
      {
        id: 'linkedin',
        label: 'LinkedIn',
        handle: 'Configurable',
        url: null,
        configurableNote: 'Añade tu URL real de LinkedIn en src/config/portfolio.ts',
      },
      {
        id: 'x',
        label: 'X / Social',
        handle: 'Configurable',
        url: null,
        configurableNote: 'Añade tu perfil social real en src/config/portfolio.ts',
      },
      {
        id: 'dribbble',
        label: 'Showcase / Red',
        handle: 'Configurable',
        url: null,
        configurableNote: 'Añade tu enlace creativo real en src/config/portfolio.ts',
      },
    ] as SocialEndpoint[],
  },
} as const;
