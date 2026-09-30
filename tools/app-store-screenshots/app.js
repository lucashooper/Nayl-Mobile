(function () {
  const { SIZES, renderSlide } = window.NaylShots;
  const STORAGE_KEY = 'nayl-app-store-shots-v1';
  const PREVIEW_CSS_H = 600;

  const DEFAULT_STYLE = {
    serif: 'DM Serif Display',
    serifWeight: 400,
    text: '#2B1E14',
    subtext: '#6E5E4E',
    accent: '#3D7A4F',
    bgFrom: '#F7F6F0',
    bgTo: '#ECE8DE',
    texture: true,
    dots: true,
  };

  const SERIF_FONTS = [
    { name: 'DM Serif Display', weight: 400 },
    { name: 'Playfair Display', weight: 700 },
    { name: 'Fraunces', weight: 700 },
    { name: 'Libre Caslon Text', weight: 700 },
  ];

  const DEFAULT_SLIDES = [
    {
      id: 'hero',
      headline: 'Quit Nail Biting\nWith *Nayl*',
      subheadline: '',
      layout: 'bottom',
      phoneImage: 'default:progress',
      ipadImage: '',
      deviceScale: 1,
      badge: { on: true, big: '#1', small: 'Habit Tracker' },
      zooms: [],
      pills: [],
    },
    {
      id: 'streak',
      headline: 'Track Your *Streak*',
      subheadline: 'Watch every bite-free day add up',
      layout: 'top',
      phoneImage: 'default:streak',
      ipadImage: '',
      deviceScale: 1,
      badge: { on: false, big: '', small: '' },
      zooms: [
        { on: true, x: 0.14, y: 0.455, w: 0.72, h: 0.125, scale: 1.45, side: 1, offset: 0.12 },
        { on: true, x: 0.08, y: 0.825, w: 0.84, h: 0.075, scale: 1.3, side: -1, offset: 0.1 },
      ],
      pills: [],
    },
    {
      id: 'urge',
      headline: 'Beat Every *Urge*',
      subheadline: 'One tap on the Panic Button when it hits',
      layout: 'top',
      phoneImage: 'default:urge',
      ipadImage: '',
      deviceScale: 1,
      badge: { on: false, big: '', small: '' },
      zooms: [{ on: true, x: 0.04, y: 0.755, w: 0.92, h: 0.135, scale: 1.25, side: 0, offset: 0 }],
      pills: [],
    },
    {
      id: 'gallery',
      headline: 'Watch Your Nails *Heal*',
      subheadline: 'Progress photos that prove it’s working',
      layout: 'top',
      phoneImage: 'default:progress',
      ipadImage: '',
      deviceScale: 1,
      badge: { on: false, big: '', small: '' },
      zooms: [{ on: true, x: 0.03, y: 0.285, w: 0.94, h: 0.205, scale: 1.2, side: 0, offset: 0 }],
      pills: [],
    },
    {
      id: 'library',
      headline: 'Every Urge, *Covered*',
      subheadline: '',
      layout: 'top',
      phoneImage: 'default:library',
      ipadImage: '',
      deviceScale: 1,
      badge: { on: false, big: '', small: '' },
      zooms: [],
      pills: ['articles', 'relaxation sounds', 'meditation'],
    },
    {
      id: 'quit-date',
      headline: 'See Your *Quit Date*',
      subheadline: '',
      layout: 'top',
      phoneImage: 'default:analytics',
      ipadImage: '',
      deviceScale: 1,
      badge: { on: true, big: 'Over 1,000+', small: 'Nails Saved' },
      zooms: [],
      pills: [],
    },
  ];

  const clone = (o) => JSON.parse(JSON.stringify(o));

  // ---------- State ----------
  let state = loadState();
  let sizeId = SIZES[0].id;
  let selected = 0;
  const images = {}; // key -> HTMLImageElement

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s && Array.isArray(s.slides)) return { style: { ...DEFAULT_STYLE, ...s.style }, slides: s.slides };
      }
    } catch (e) {}
    return { style: clone(DEFAULT_STYLE), slides: clone(DEFAULT_SLIDES) };
  }

  let saveTimer = null;
  function saveState() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {}
    }, 250);
  }

  // Uploaded screenshots live in IndexedDB so they survive a reload.
  const idb = (() => {
    let dbp = null;
    function open() {
      if (dbp) return dbp;
      dbp = new Promise((resolve, reject) => {
        try {
          const req = indexedDB.open('nayl-app-store-shots', 1);
          req.onupgradeneeded = () => req.result.createObjectStore('images');
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
        } catch (e) {
          reject(e);
        }
      });
      return dbp;
    }
    async function tx(mode, fn) {
      const db = await open();
      return new Promise((resolve, reject) => {
        const t = db.transaction('images', mode);
        const r = fn(t.objectStore('images'));
        t.oncomplete = () => resolve(r && r.result);
        t.onerror = () => reject(t.error);
      });
    }
    return {
      get: (k) => tx('readonly', (s) => s.get(k)).catch(() => null),
      set: (k, v) => tx('readwrite', (s) => s.put(v, k)).catch(() => null),
      clear: () => tx('readwrite', (s) => s.clear()).catch(() => null),
    };
  })();

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  async function ensureImage(key) {
    if (!key || images[key]) return;
    let src = null;
    if (key.startsWith('default:')) src = (window.DEFAULT_SCREENS || {})[key.slice(8)];
    else src = await idb.get(key);
    if (src) {
      try {
        images[key] = await loadImage(src);
      } catch (e) {}
    }
  }

  async function ensureAllImages() {
    await Promise.all(state.slides.flatMap((s) => [ensureImage(s.phoneImage), ensureImage(s.ipadImage)]));
  }

  function readFile(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  async function setSlideImage(index, which, file) {
    const dataUrl = await readFile(file);
    const key = `upload:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
    images[key] = await loadImage(dataUrl);
    await idb.set(key, dataUrl);
    state.slides[index][which] = key;
    saveState();
    renderAll();
    renderEditor();
  }

  async function loadFonts() {
    const loads = SERIF_FONTS.map((f) => document.fonts.load(`${f.weight} 100px "${f.name}"`));
    loads.push(document.fonts.load('500 40px "Inter"'), document.fonts.load('600 40px "Inter"'), document.fonts.load('800 40px "Inter"'));
    try {
      await Promise.all(loads);
    } catch (e) {}
  }

  // ---------- Previews ----------
  const strip = document.getElementById('strip');
  const size = () => SIZES.find((s) => s.id === sizeId);

  function slideTitle(s) {
    return s.headline.replace(/\*/g, '').replace(/\n/g, ' ');
  }

  function buildStrip() {
    strip.innerHTML = '';
    state.slides.forEach((slide, i) => {
      const card = document.createElement('div');
      card.className = 'slide-card' + (i === selected ? ' is-selected' : '');
      card.dataset.index = i;
      const canvas = document.createElement('canvas');
      card.appendChild(canvas);
      const label = document.createElement('div');
      label.className = 'slide-label';
      label.textContent = `${i + 1}. ${slideTitle(slide)}`;
      card.appendChild(label);
      card.addEventListener('click', () => {
        selected = i;
        document.querySelectorAll('.slide-card').forEach((c, j) => c.classList.toggle('is-selected', j === i));
        renderEditor();
      });
      card.addEventListener('dragover', (e) => {
        e.preventDefault();
        card.classList.add('is-drop');
      });
      card.addEventListener('dragleave', () => card.classList.remove('is-drop'));
      card.addEventListener('drop', (e) => {
        e.preventDefault();
        card.classList.remove('is-drop');
        const file = [...e.dataTransfer.files].find((f) => f.type.startsWith('image/'));
        if (!file) return;
        selected = i;
        setSlideImage(i, size().device === 'ipad' ? 'ipadImage' : 'phoneImage', file);
      });
      strip.appendChild(card);
    });
    const add = document.createElement('button');
    add.className = 'add-card';
    add.textContent = '+ Add slide';
    add.addEventListener('click', () => {
      const base = clone(state.slides[selected] || DEFAULT_SLIDES[0]);
      base.id = `slide-${Date.now().toString(36)}`;
      state.slides.splice(selected + 1, 0, base);
      selected += 1;
      saveState();
      buildStrip();
      renderAll();
      renderEditor();
    });
    strip.appendChild(add);
  }

  function renderPreview(i) {
    const card = strip.querySelector(`.slide-card[data-index="${i}"]`);
    if (!card) return;
    const s = size();
    const canvas = card.querySelector('canvas');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssH = PREVIEW_CSS_H;
    const cssW = (cssH * s.w) / s.h;
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    const ctx = canvas.getContext('2d');
    renderSlide(ctx, state.slides[i], s, state.style, images, canvas.height / s.h);
    card.querySelector('.slide-label').textContent = `${i + 1}. ${slideTitle(state.slides[i])}`;
  }

  let rafAll = 0;
  function renderAll() {
    cancelAnimationFrame(rafAll);
    rafAll = requestAnimationFrame(() => state.slides.forEach((_, i) => renderPreview(i)));
  }
  let rafOne = 0;
  function renderSelected() {
    cancelAnimationFrame(rafOne);
    rafOne = requestAnimationFrame(() => renderPreview(selected));
  }

  // ---------- Editor ----------
  const editor = document.getElementById('editor');

  function field(label, input, hint) {
    const wrap = document.createElement('label');
    wrap.className = 'field';
    const l = document.createElement('span');
    l.className = 'field-label';
    l.textContent = label;
    wrap.appendChild(l);
    wrap.appendChild(input);
    if (hint) {
      const h = document.createElement('span');
      h.className = 'field-hint';
      h.textContent = hint;
      wrap.appendChild(h);
    }
    return wrap;
  }

  function textInput(value, onInput, multiline) {
    const el = document.createElement(multiline ? 'textarea' : 'input');
    if (multiline) el.rows = 2;
    el.className = 'input';
    el.value = value || '';
    el.addEventListener('input', () => onInput(el.value));
    return el;
  }

  function range(value, min, max, step, onInput) {
    const wrap = document.createElement('div');
    wrap.className = 'range-row';
    const el = document.createElement('input');
    el.type = 'range';
    el.min = min;
    el.max = max;
    el.step = step;
    el.value = value;
    const out = document.createElement('span');
    out.className = 'range-value';
    out.textContent = Number(value).toFixed(2);
    el.addEventListener('input', () => {
      out.textContent = Number(el.value).toFixed(2);
      onInput(Number(el.value));
    });
    wrap.append(el, out);
    return wrap;
  }

  function select(value, options, onChange) {
    const el = document.createElement('select');
    el.className = 'input';
    for (const [v, label] of options) {
      const o = document.createElement('option');
      o.value = v;
      o.textContent = label;
      if (String(v) === String(value)) o.selected = true;
      el.appendChild(o);
    }
    el.addEventListener('change', () => onChange(el.value));
    return el;
  }

  function checkbox(checked, label, onChange) {
    const wrap = document.createElement('label');
    wrap.className = 'check';
    const el = document.createElement('input');
    el.type = 'checkbox';
    el.checked = !!checked;
    el.addEventListener('change', () => onChange(el.checked));
    wrap.append(el, document.createTextNode(' ' + label));
    return wrap;
  }

  function button(label, onClick, cls = 'btn') {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = cls;
    b.textContent = label;
    b.addEventListener('click', onClick);
    return b;
  }

  function section(title) {
    const s = document.createElement('section');
    s.className = 'panel-section';
    const h = document.createElement('h3');
    h.textContent = title;
    s.appendChild(h);
    return s;
  }

  function fileButton(label, onFile) {
    const wrap = document.createElement('label');
    wrap.className = 'btn';
    wrap.textContent = label;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.hidden = true;
    input.addEventListener('change', () => input.files[0] && onFile(input.files[0]));
    wrap.appendChild(input);
    return wrap;
  }

  function changed(rebuildEditor) {
    saveState();
    renderSelected();
    if (rebuildEditor) renderEditor();
  }

  function renderEditor() {
    editor.innerHTML = '';
    const slide = state.slides[selected];
    if (!slide) return;

    const top = document.createElement('div');
    top.className = 'editor-top';
    const title = document.createElement('h2');
    title.textContent = `Slide ${selected + 1}`;
    const actions = document.createElement('div');
    actions.className = 'btn-row';
    const move = (d) => () => {
      const j = selected + d;
      if (j < 0 || j >= state.slides.length) return;
      [state.slides[selected], state.slides[j]] = [state.slides[j], state.slides[selected]];
      selected = j;
      saveState();
      buildStrip();
      renderAll();
      renderEditor();
    };
    actions.append(
      button('←', move(-1), 'btn btn-icon'),
      button('→', move(1), 'btn btn-icon'),
      button('Download', () => exportOne(selected)),
      button('Delete', () => {
        if (state.slides.length <= 1) return;
        state.slides.splice(selected, 1);
        selected = Math.max(0, selected - 1);
        saveState();
        buildStrip();
        renderAll();
        renderEditor();
      }, 'btn btn-danger'),
    );
    top.append(title, actions);
    editor.appendChild(top);

    // Copy
    const copy = section('Copy');
    copy.appendChild(
      field('Headline', textInput(slide.headline, (v) => ((slide.headline = v), changed()), true), 'New line with Enter. Wrap words in *stars* for the accent colour.'),
    );
    copy.appendChild(field('Subheadline', textInput(slide.subheadline, (v) => ((slide.subheadline = v), changed()))));
    copy.appendChild(field('Headline size', range(slide.headlineScale || 1, 0.6, 1.4, 0.01, (v) => ((slide.headlineScale = v), changed()))));
    copy.appendChild(
      field('Layout', select(slide.layout, [['top', 'Headline on top'], ['bottom', 'Headline at bottom']], (v) => ((slide.layout = v), changed()))),
    );
    editor.appendChild(copy);

    // Screenshots
    const shots = section('Screenshots');
    const phoneRow = document.createElement('div');
    phoneRow.className = 'btn-row';
    phoneRow.append(fileButton('Replace iPhone capture', (f) => setSlideImage(selected, 'phoneImage', f)));
    const defaultKeys = Object.keys(window.DEFAULT_SCREENS || {});
    phoneRow.append(
      select(
        slide.phoneImage.startsWith('default:') ? slide.phoneImage : '',
        [['', slide.phoneImage.startsWith('default:') ? 'Built-in…' : 'Custom upload'], ...defaultKeys.map((k) => [`default:${k}`, `Built-in: ${k}`])],
        async (v) => {
          if (!v) return;
          slide.phoneImage = v;
          await ensureImage(v);
          changed(true);
        },
      ),
    );
    shots.appendChild(field('iPhone', phoneRow));
    const padRow = document.createElement('div');
    padRow.className = 'btn-row';
    padRow.append(fileButton(slide.ipadImage ? 'Replace iPad capture' : 'Add iPad capture', (f) => setSlideImage(selected, 'ipadImage', f)));
    if (slide.ipadImage) padRow.append(button('Remove', () => ((slide.ipadImage = ''), changed(true))));
    shots.appendChild(field('iPad', padRow, 'Without an iPad capture, the iPad export shows the iPhone frame.'));
    shots.appendChild(field('Device size', range(slide.deviceScale || 1, 0.7, 1.4, 0.01, (v) => ((slide.deviceScale = v), changed())), 'Above 1.00 the device bleeds off the edge.'));
    const hint = document.createElement('p');
    hint.className = 'field-hint';
    hint.textContent = 'Tip: drag a screenshot onto any slide to replace it (iPad capture when the iPad size is selected).';
    shots.appendChild(hint);
    editor.appendChild(shots);

    // Badge
    const badge = section('Laurel badge');
    slide.badge = slide.badge || { on: false, big: '', small: '' };
    badge.appendChild(checkbox(slide.badge.on, 'Show badge', (v) => ((slide.badge.on = v), changed())));
    badge.appendChild(field('Main line', textInput(slide.badge.big, (v) => ((slide.badge.big = v), changed()))));
    badge.appendChild(field('Second line', textInput(slide.badge.small, (v) => ((slide.badge.small = v), changed()))));
    editor.appendChild(badge);

    // Zooms
    const zooms = section('Zoom call-outs');
    slide.zooms = slide.zooms || [];
    slide.zooms.forEach((z, zi) => {
      const box = document.createElement('div');
      box.className = 'zoom-box';
      const head = document.createElement('div');
      head.className = 'zoom-head';
      head.append(
        checkbox(z.on !== false, `Call-out ${zi + 1}`, (v) => ((z.on = v), changed())),
        button('Remove', () => (slide.zooms.splice(zi, 1), changed(true)), 'btn btn-small'),
      );
      box.appendChild(head);
      const rows = [
        ['Left', 'x', 0, 1],
        ['Top', 'y', 0, 1],
        ['Width', 'w', 0.05, 1],
        ['Height', 'h', 0.02, 1],
        ['Magnify', 'scale', 1, 2.5],
        ['Push out', 'offset', 0, 0.5],
      ];
      for (const [label, key, min, max] of rows) {
        box.appendChild(field(label, range(z[key] ?? 0, min, max, 0.005, (v) => ((z[key] = v), changed()))));
      }
      box.appendChild(field('Direction', select(z.side || 0, [[0, 'In place'], [-1, 'Push left'], [1, 'Push right']], (v) => ((z.side = Number(v)), changed()))));
      zooms.appendChild(box);
    });
    zooms.appendChild(
      button('+ Add call-out', () => {
        slide.zooms.push({ on: true, x: 0.1, y: 0.4, w: 0.8, h: 0.15, scale: 1.3, side: 0, offset: 0.12 });
        changed(true);
      }),
    );
    editor.appendChild(zooms);

    // Pills
    const pills = section('Floating labels');
    pills.appendChild(
      field(
        'Labels',
        textInput((slide.pills || []).join(', '), (v) => {
          slide.pills = v.split(',').map((s) => s.trim()).filter(Boolean);
          changed();
        }),
        'Comma separated, up to 4. They alternate right and left of the device.',
      ),
    );
    editor.appendChild(pills);

    // Global style
    const style = section('Style (all slides)');
    const st = state.style;
    const styleChanged = () => {
      saveState();
      renderAll();
    };
    style.appendChild(
      field(
        'Headline font',
        select(st.serif, SERIF_FONTS.map((f) => [f.name, f.name]), (v) => {
          st.serif = v;
          st.serifWeight = SERIF_FONTS.find((f) => f.name === v).weight;
          styleChanged();
        }),
      ),
    );
    const colors = document.createElement('div');
    colors.className = 'color-grid';
    for (const [key, label] of [['text', 'Text'], ['subtext', 'Subtext'], ['accent', 'Accent'], ['bgFrom', 'Background top'], ['bgTo', 'Background bottom']]) {
      const c = document.createElement('input');
      c.type = 'color';
      c.value = st[key];
      c.addEventListener('input', () => ((st[key] = c.value), styleChanged()));
      colors.appendChild(field(label, c));
    }
    style.appendChild(colors);
    style.appendChild(checkbox(st.texture, 'Paper texture', (v) => ((st.texture = v), styleChanged())));
    style.appendChild(checkbox(st.dots, 'Halftone dots', (v) => ((st.dots = v), styleChanged())));
    style.appendChild(
      button('Reset everything to defaults', async () => {
        if (!confirm('Reset all slides, text and uploaded screenshots?')) return;
        state = { style: clone(DEFAULT_STYLE), slides: clone(DEFAULT_SLIDES) };
        selected = 0;
        await idb.clear();
        saveState();
        await ensureAllImages();
        buildStrip();
        renderAll();
        renderEditor();
      }, 'btn btn-danger'),
    );
    editor.appendChild(style);
  }

  // ---------- Export ----------
  const exportBtn = document.getElementById('export-all');
  const exportStatus = document.getElementById('export-status');

  function slug(s) {
    return slideTitle(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || s.id;
  }

  function renderToBlob(slide, s) {
    const canvas = document.createElement('canvas');
    canvas.width = s.w;
    canvas.height = s.h;
    const ctx = canvas.getContext('2d');
    renderSlide(ctx, slide, s, state.style, images, 1);
    return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  }

  function download(blob, name) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  async function exportOne(i) {
    const s = size();
    const blob = await renderToBlob(state.slides[i], s);
    download(blob, `nayl-${s.id}-${String(i + 1).padStart(2, '0')}-${slug(state.slides[i])}.png`);
  }

  async function exportAll() {
    if (!window.JSZip) {
      alert('JSZip did not load. Check your internet connection and reload.');
      return;
    }
    exportBtn.disabled = true;
    const zip = new JSZip();
    const total = SIZES.length * state.slides.length;
    let done = 0;
    try {
      for (const s of SIZES) {
        const folder = zip.folder(`${s.id} (${s.w}x${s.h})`);
        for (let i = 0; i < state.slides.length; i++) {
          exportStatus.textContent = `Rendering ${++done} of ${total}…`;
          const blob = await renderToBlob(state.slides[i], s);
          folder.file(`${String(i + 1).padStart(2, '0')}-${slug(state.slides[i])}.png`, blob);
        }
      }
      exportStatus.textContent = 'Zipping…';
      const out = await zip.generateAsync({ type: 'blob' });
      download(out, 'nayl-app-store-screenshots.zip');
      exportStatus.textContent = `Exported ${total} PNGs`;
    } catch (e) {
      console.error(e);
      exportStatus.textContent = 'Export failed, see console';
    } finally {
      exportBtn.disabled = false;
    }
  }
  exportBtn.addEventListener('click', exportAll);

  // ---------- Size tabs ----------
  const tabs = document.getElementById('size-tabs');
  SIZES.forEach((s) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'tab' + (s.id === sizeId ? ' is-active' : '');
    b.innerHTML = `${s.label}<span>${s.w}×${s.h}</span>`;
    b.addEventListener('click', () => {
      sizeId = s.id;
      tabs.querySelectorAll('.tab').forEach((t) => t.classList.toggle('is-active', t === b));
      renderAll();
    });
    tabs.appendChild(b);
  });

  // ---------- Boot ----------
  (async function boot() {
    await loadFonts();
    await ensureAllImages();
    buildStrip();
    renderAll();
    renderEditor();
    window.__naylShotsReady = true;
  })();

  // Exposed for automated checks.
  window.NaylShotsApp = { exportAll, renderToBlob, state: () => state, SIZES };
})();
