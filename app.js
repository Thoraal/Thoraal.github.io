/*
 * Audio M4A — extrae el audio de un MP4 en el navegador (ffmpeg.wasm),
 * añade etiquetas y portada, y entrega un .m4a mediante la hoja de compartir
 * de iOS o una descarga. Nada se sube a ningún servidor.
 *
 * Lo que esta app NO hace (porque iOS no lo permite): añadir el archivo a la
 * biblioteca de la app Música. Ver README.md.
 */
(() => {
  'use strict';

  const { FFmpeg } = window.FFmpegWASM;
  const { fetchFile, toBlobURL } = window.FFmpegUtil;

  // Núcleo de un solo hilo: no requiere SharedArrayBuffer ni cabeceras COOP/COEP,
  // así funciona en GitHub Pages y en Safari para iOS.
  const CORE_BASE = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
  const MAX_RECOMMENDED = 250 * 1024 * 1024; // por encima, Safari puede quedarse sin memoria

  const $ = (id) => document.getElementById(id);
  const el = {
    file: $('file'), fileLabel: $('file-label'), fileInfo: $('file-info'),
    iSize: $('i-size'), iContainer: $('i-container'), iAudio: $('i-audio'), iDuration: $('i-duration'),
    cover: $('cover'), coverImg: $('cover-img'), coverPh: $('cover-ph'), coverClear: $('cover-clear'),
    title: $('m-title'), artist: $('m-artist'), album: $('m-album'), year: $('m-year'), genre: $('m-genre'),
    run: $('run'), progress: $('progress'), bar: document.querySelector('.bar'), barFill: $('bar-fill'),
    status: $('status'), error: $('error'),
    result: $('result'), rCover: $('r-cover'), rTitle: $('r-title'), rSub: $('r-sub'), rFile: $('r-file'),
    player: $('player'), share: $('share'), download: $('download'),
  };

  const state = {
    ffmpeg: null,
    loading: null,
    input: null,        // File
    probe: null,        // { container, codec, duration, hasVideo }
    coverJpeg: null,    // Uint8Array (JPEG normalizado)
    output: null,       // File
    outputURL: null,
    busy: false,
  };

  /* ---------- Utilidades ---------- */

  const fmtBytes = (b) => b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`;

  const fmtTime = (s) => {
    if (!isFinite(s)) return '—';
    const m = Math.floor(s / 60), r = Math.round(s % 60);
    return `${m}:${String(r).padStart(2, '0')}`;
  };

  const safeName = (s) => s.replace(/[\\/:*?"<>|\u0000-\u001f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120);

  function setStatus(text, ratio) {
    el.progress.hidden = false;
    el.status.textContent = text;
    if (ratio == null) {
      el.bar.classList.add('indeterminate');
      el.barFill.style.width = '';
    } else {
      el.bar.classList.remove('indeterminate');
      el.barFill.style.width = `${Math.max(0, Math.min(1, ratio)) * 100}%`;
    }
  }

  function showError(msg) {
    el.error.textContent = msg;
    el.error.hidden = false;
  }
  function clearError() { el.error.hidden = true; el.error.textContent = ''; }

  function refreshRunButton() {
    if (state.busy) { el.run.disabled = true; return; }
    el.run.disabled = !state.input;
    el.run.textContent = state.input ? 'Crear M4A' : 'Selecciona un archivo primero';
  }

  /* ---------- Detección del formato (sin ffmpeg) ---------- */

  async function sniffContainer(file) {
    const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
    const ascii = (a, b) => String.fromCharCode(...head.slice(a, b));
    if (ascii(4, 8) === 'ftyp') {
      const brand = ascii(8, 12).trim();
      const names = { isom: 'MP4', iso2: 'MP4', mp41: 'MP4', mp42: 'MP4', avc1: 'MP4', 'M4A': 'M4A', 'M4V': 'M4V', qt: 'MOV (QuickTime)', '3gp4': '3GP', '3gp5': '3GP' };
      return `${names[brand] || 'MPEG-4'} (${brand})`;
    }
    if (ascii(0, 3) === 'ID3' || (head[0] === 0xff && (head[1] & 0xe0) === 0xe0)) return 'MP3 / AAC (ADTS)';
    if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WAVE') return 'WAV';
    if (ascii(0, 4) === 'fLaC') return 'FLAC';
    if (ascii(0, 4) === 'OggS') return 'Ogg';
    if (head[0] === 0x1a && head[1] === 0x45 && head[2] === 0xdf && head[3] === 0xa3) return 'WebM / Matroska';
    return file.type || 'Desconocido';
  }

  // Duración con el propio Safari (rápido y sin cargar el motor).
  function mediaDuration(file) {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const media = document.createElement('video');
      media.preload = 'metadata';
      media.muted = true;
      const done = (d) => { URL.revokeObjectURL(url); resolve(d); };
      media.onloadedmetadata = () => done(media.duration);
      media.onerror = () => done(NaN);
      setTimeout(() => done(NaN), 6000);
      media.src = url;
    });
  }

  function guessFromFilename(name) {
    const base = name.replace(/\.[^.]+$/, '').replace(/[_]+/g, ' ').trim();
    const parts = base.split(/\s+[-–—]\s+/);
    if (parts.length >= 2) return { artist: parts[0], title: parts.slice(1).join(' - ') };
    return { artist: '', title: base };
  }

  /* ---------- Motor ffmpeg.wasm ---------- */

  async function loadFFmpeg() {
    if (state.ffmpeg) return state.ffmpeg;
    if (state.loading) return state.loading;

    state.loading = (async () => {
      const ffmpeg = new FFmpeg();
      setStatus('Descargando el motor de conversión…', 0);
      const coreURL = await toBlobURL(`${CORE_BASE}/ffmpeg-core.js`, 'text/javascript');
      const wasmURL = await toBlobURL(`${CORE_BASE}/ffmpeg-core.wasm`, 'application/wasm', true, ({ received, total }) => {
        const t = total > 0 ? total : 32 * 1024 * 1024;
        setStatus(`Descargando el motor de conversión… ${fmtBytes(received)}`, received / t);
      });
      setStatus('Iniciando el motor…', null);
      await ffmpeg.load({ coreURL, wasmURL });
      state.ffmpeg = ffmpeg;
      return ffmpeg;
    })();

    try {
      return await state.loading;
    } catch (e) {
      state.loading = null;
      throw new Error('No se pudo descargar el motor de conversión. Revisa tu conexión a internet e inténtalo de nuevo.');
    }
  }

  // Ejecuta ffmpeg capturando el registro (para leer códec y errores).
  async function run(ffmpeg, args, onProgress) {
    const log = [];
    const onLog = ({ message }) => log.push(message);
    const onProg = ({ progress }) => onProgress && onProgress(progress);
    ffmpeg.on('log', onLog);
    ffmpeg.on('progress', onProg);
    let code;
    try {
      code = await ffmpeg.exec(args);
    } finally {
      ffmpeg.off('log', onLog);
      ffmpeg.off('progress', onProg);
    }
    return { code, log: log.join('\n') };
  }

  async function probeAudio(ffmpeg, inName) {
    const { log } = await run(ffmpeg, ['-hide_banner', '-i', inName]);
    const audio = log.match(/Stream #\d+:\d+[^:]*: Audio: ([a-z0-9_]+)[^\n]*/i);
    const dur = log.match(/Duration: (\d+):(\d+):(\d+(?:\.\d+)?)/);
    return {
      codec: audio ? audio[1].toLowerCase() : null,
      detail: audio ? audio[0].replace(/^.*Audio: /, '') : null,
      hasVideo: /: Video: /.test(log),
      duration: dur ? (+dur[1]) * 3600 + (+dur[2]) * 60 + parseFloat(dur[3]) : NaN,
    };
  }

  /* ---------- Portada: normaliza a JPEG cuadrado ≤ 1000 px ---------- */

  async function normalizeCover(file) {
    const bitmapURL = URL.createObjectURL(file);
    try {
      const img = await new Promise((res, rej) => {
        const i = new Image();
        i.onload = () => res(i);
        i.onerror = () => rej(new Error('La imagen de portada no se pudo leer.'));
        i.src = bitmapURL;
      });
      const side = Math.min(img.naturalWidth, img.naturalHeight);
      const out = Math.min(1000, side);
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = out;
      const ctx = canvas.getContext('2d');
      const sx = (img.naturalWidth - side) / 2, sy = (img.naturalHeight - side) / 2;
      ctx.drawImage(img, sx, sy, side, side, 0, 0, out, out);
      const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.9));
      return new Uint8Array(await blob.arrayBuffer());
    } finally {
      URL.revokeObjectURL(bitmapURL);
    }
  }

  /* ---------- Eventos de la interfaz ---------- */

  el.file.addEventListener('change', async () => {
    clearError();
    const f = el.file.files && el.file.files[0];
    if (!f) return;
    state.input = f;
    state.probe = null;
    el.result.hidden = true;
    el.fileLabel.textContent = f.name;
    el.file.parentElement.classList.add('has-file');
    el.fileInfo.hidden = false;
    el.iSize.textContent = fmtBytes(f.size);
    el.iContainer.textContent = 'Analizando…';
    el.iAudio.textContent = 'Se detecta al convertir';
    el.iDuration.textContent = '…';

    const guess = guessFromFilename(f.name);
    if (!el.title.value) el.title.value = guess.title;
    if (!el.artist.value && guess.artist) el.artist.value = guess.artist;

    const [container, duration] = await Promise.all([sniffContainer(f), mediaDuration(f)]);
    el.iContainer.textContent = container;
    el.iDuration.textContent = fmtTime(duration);

    if (f.size > MAX_RECOMMENDED) {
      showError(`El archivo pesa ${fmtBytes(f.size)}. En iPhone, archivos tan grandes pueden agotar la memoria de Safari; si falla, recórtalo antes en la app Fotos.`);
    }
    refreshRunButton();
  });

  el.cover.addEventListener('change', async () => {
    clearError();
    const f = el.cover.files && el.cover.files[0];
    if (!f) return;
    try {
      state.coverJpeg = await normalizeCover(f);
      const url = URL.createObjectURL(new Blob([state.coverJpeg], { type: 'image/jpeg' }));
      el.coverImg.src = url;
      el.coverImg.hidden = false;
      el.coverPh.hidden = true;
      el.coverClear.hidden = false;
    } catch (e) {
      state.coverJpeg = null;
      showError(e.message);
    }
  });

  el.coverClear.addEventListener('click', () => {
    state.coverJpeg = null;
    el.cover.value = '';
    el.coverImg.hidden = true;
    el.coverImg.removeAttribute('src');
    el.coverPh.hidden = false;
    el.coverClear.hidden = true;
  });

  el.run.addEventListener('click', convert);

  /* ---------- Conversión ---------- */

  async function convert() {
    if (!state.input || state.busy) return;
    clearError();
    state.busy = true;
    refreshRunButton();
    el.result.hidden = true;

    const IN = 'input' + (state.input.name.match(/\.[a-z0-9]{1,5}$/i)?.[0] || '.mp4').toLowerCase();
    const COVER = 'cover.jpg';
    const OUT = 'output.m4a';
    let ffmpeg;

    try {
      ffmpeg = await loadFFmpeg();

      setStatus('Leyendo el archivo…', null);
      await ffmpeg.writeFile(IN, await fetchFile(state.input));

      setStatus('Detectando el audio…', null);
      const probe = await probeAudio(ffmpeg, IN);
      state.probe = probe;
      if (!probe.codec) throw new Error('Este archivo no contiene ninguna pista de audio.');
      el.iAudio.textContent = probe.detail || probe.codec.toUpperCase();
      if (isFinite(probe.duration)) el.iDuration.textContent = fmtTime(probe.duration);

      const hasCover = !!state.coverJpeg;
      if (hasCover) await ffmpeg.writeFile(COVER, state.coverJpeg);

      const meta = [];
      const add = (k, v) => { v = (v || '').trim(); if (v) meta.push('-metadata', `${k}=${v}`); };
      add('title', el.title.value);
      add('artist', el.artist.value);
      add('album_artist', el.artist.value);
      add('album', el.album.value);
      add('date', el.year.value);
      add('genre', el.genre.value);

      // AAC y ALAC ya son compatibles con M4A: se copian sin pérdida (rápido).
      const canCopy = ['aac', 'alac'].includes(probe.codec);

      const build = (copy, withCover) => [
        '-hide_banner', '-y',
        '-i', IN,
        ...(withCover ? ['-i', COVER] : []),
        '-map', '0:a:0',
        ...(withCover ? ['-map', '1:0', '-c:v', 'copy', '-disposition:v:0', 'attached_pic'] : []),
        ...(copy ? ['-c:a', 'copy'] : ['-c:a', 'aac', '-b:a', '256k']),
        '-map_metadata', '-1',
        ...meta,
        '-movflags', '+faststart',
        '-f', 'ipod',
        OUT,
      ];

      const attempts = [];
      if (canCopy) attempts.push({ copy: true, cover: hasCover, label: 'Extrayendo el audio sin pérdida…' });
      attempts.push({ copy: false, cover: hasCover, label: 'Convirtiendo a AAC 256 kbps…' });
      if (hasCover) attempts.push({ copy: false, cover: false, label: 'Reintentando sin portada…' });

      let ok = false, lastLog = '', coverDropped = false;
      for (const a of attempts) {
        setStatus(a.label, 0);
        const { code, log } = await run(ffmpeg, build(a.copy, a.cover), (p) => setStatus(a.label, p));
        if (code === 0) { ok = true; coverDropped = hasCover && !a.cover; break; }
        lastLog = log;
      }
      if (!ok) {
        console.error(lastLog);
        throw new Error('No se pudo convertir el audio de este archivo. Puede estar dañado o usar un formato poco común.');
      }

      setStatus('Preparando el archivo…', 1);
      const data = await ffmpeg.readFile(OUT);
      const title = el.title.value.trim() || 'Canción';
      const artist = el.artist.value.trim();
      const fileName = safeName(artist ? `${artist} - ${title}` : title) + '.m4a';
      state.output = new File([data.buffer], fileName, { type: 'audio/mp4' });

      if (state.outputURL) URL.revokeObjectURL(state.outputURL);
      state.outputURL = URL.createObjectURL(state.output);
      showResult(fileName, coverDropped);
      el.progress.hidden = true;
    } catch (e) {
      console.error(e);
      el.progress.hidden = true;
      const msg = (e && e.message) || String(e);
      showError(/memory|OOM|out of bounds|RangeError/i.test(msg)
        ? 'Safari se quedó sin memoria. Cierra otras pestañas y vuelve a intentarlo, o usa un archivo más corto.'
        : msg);
    } finally {
      if (ffmpeg) {
        for (const n of [IN, COVER, OUT]) { try { await ffmpeg.deleteFile(n); } catch (_) {} }
      }
      state.busy = false;
      refreshRunButton();
    }
  }

  function showResult(fileName, coverDropped) {
    el.rTitle.textContent = el.title.value.trim() || 'Canción';
    el.rSub.textContent = [el.artist.value.trim(), el.album.value.trim()].filter(Boolean).join(' · ') || 'Sin artista';
    el.rFile.textContent = `${fileName} · ${fmtBytes(state.output.size)}${coverDropped ? ' · sin portada (no se pudo incrustar)' : ''}`;
    if (state.coverJpeg && !coverDropped) {
      el.rCover.src = el.coverImg.src;
      el.rCover.hidden = false;
    } else {
      el.rCover.hidden = true;
    }
    el.player.src = state.outputURL;
    el.download.href = state.outputURL;
    el.download.download = fileName;

    const canShare = !!(navigator.canShare && navigator.canShare({ files: [state.output] }));
    el.share.hidden = !canShare;

    el.result.hidden = false;
    el.result.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  el.share.addEventListener('click', async () => {
    if (!state.output) return;
    clearError();
    try {
      await navigator.share({ files: [state.output] });
    } catch (e) {
      if (e && e.name === 'AbortError') return; // el usuario cerró la hoja
      showError('No se pudo abrir la hoja de compartir. Usa «Descargar M4A».');
    }
  });

  refreshRunButton();
})();
