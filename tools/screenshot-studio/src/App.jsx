import { useEffect, useRef, useState } from 'react';
import { BACKGROUNDS, DEFAULT_EXPORT_DIR, DEFAULT_STATE, FINISHES, FONTS, IPAD_TARGET, IPHONE_SIZES, SCREENS, TARGETS, TEXTURES, WEIGHTS } from './config.js';
import Frame, { resolveTheme } from './components/Frame.jsx';
import { canSaveToDisk, exportAll, exportOne } from './export.js';

const STORE_KEY = 'nayl-screenshot-studio-v1';
const IMAGE_KEY = (id) => `nayl-screenshot-studio-img-${id}`;
const PREVIEW_H = 540;
// Real-capture uploads are kept per device: iPhone under the frame id, iPad under ipad-<id>.
const captureKey = (device, id) => (device === 'ipad' ? `ipad-${id}` : id);

// Nail Progress photos dropped into tools/screenshot-studio/nail-photos/ as
// day-1 and day-14 (.jpg/.png/.webp) are picked up automatically.
const FOLDER_PHOTOS = Object.fromEntries(
  Object.entries(import.meta.glob('../nail-photos/day-*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', { eager: true, query: '?url', import: 'default' }))
    .map(([file, url]) => [Number(/day-(\d+)\./i.exec(file)?.[1]), url])
    .filter(([day]) => day),
);
const NAIL_TILE_DAYS = [1, 14];
const nailKey = (day) => `nail-day-${day}`;

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    if (saved?.version === DEFAULT_STATE.version) return { ...DEFAULT_STATE, ...saved };
    // New studio version: keep the look (fonts, colours, layout) but take the new frames.
    if (saved && saved.version >= 2) return { ...DEFAULT_STATE, ...saved, version: DEFAULT_STATE.version, frames: DEFAULT_STATE.frames };
  } catch {}
  return DEFAULT_STATE;
}

function loadImages() {
  const out = {};
  const ids = [...DEFAULT_STATE.frames.flatMap((f) => [f.id, captureKey('ipad', f.id)]), ...NAIL_TILE_DAYS.map(nailKey)];
  for (const id of ids) {
    try {
      const v = localStorage.getItem(IMAGE_KEY(id));
      if (v) out[id] = v;
    } catch {}
  }
  return out;
}

export default function App() {
  const [state, setState] = useState(load);
  const [images, setImages] = useState(loadImages);
  const [busy, setBusy] = useState('');
  const [note, setNote] = useState('');
  const [diskOk, setDiskOk] = useState(false);
  const nodes = useRef({});

  useEffect(() => {
    canSaveToDisk().then(setDiskOk);
  }, []);
  const mode = state.exportMode === 'disk' && !diskOk ? 'zip' : state.exportMode;

  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  const set = (patch) => setState((s) => ({ ...s, ...patch }));
  const setFrame = (i, patch) => setState((s) => ({ ...s, frames: s.frames.map((f, j) => (j === i ? { ...f, ...patch } : f)) }));
  const theme = resolveTheme(state);
  const photos = Object.fromEntries(NAIL_TILE_DAYS.map((d) => [d, images[nailKey(d)] || FOLDER_PHOTOS[d] || null]));

  const setImage = (id, dataUrl) => {
    setImages((m) => {
      const next = { ...m };
      if (dataUrl) next[id] = dataUrl;
      else delete next[id];
      return next;
    });
    try {
      if (dataUrl) localStorage.setItem(IMAGE_KEY(id), dataUrl);
      else localStorage.removeItem(IMAGE_KEY(id));
    } catch {
      setNote('That capture is too large to remember after a reload, but it is used for this session.');
    }
  };

  const onFile = (id, file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => setImage(id, reader.result);
    reader.readAsDataURL(file);
  };

  const run = async (label, fn) => {
    setBusy(label);
    setNote('');
    try {
      await fn();
    } catch (e) {
      console.error(e);
      setNote(`Export failed: ${e.message}`);
    } finally {
      setBusy('');
    }
  };

  const iphone = TARGETS[state.iphoneSize] ? state.iphoneSize : DEFAULT_STATE.iphoneSize;
  const nodesFor = (target) => (nodes.current[target] ??= []);

  const doExportAll = (target) =>
    run('Rendering…', async () => {
      const { label, width, height } = TARGETS[target];
      const where = await exportAll(nodesFor(target), state.frames, target, { mode, dir: state.exportDir }, (i, n) =>
        setBusy(i < n ? `Rendering ${label} ${i + 1} of ${n}…` : 'Saving…'),
      );
      setNote(`Exported ${state.frames.length} ${label} PNGs at ${width} × ${height}, 300 DPI${where ? ` to ${where}` : ''}.`);
    });

  const strip = (target) => {
    const { device } = TARGETS[target];
    return state.frames.map((f, i) => (
      <FrameCard
        key={f.id}
        index={i}
        frame={f}
        state={state}
        target={target}
        image={images[captureKey(device, f.id)]}
        photos={photos}
        nodeRef={(el) => (nodesFor(target)[i] = el)}
        onFile={(file) => onFile(captureKey(device, f.id), file)}
        onClearImage={() => setImage(captureKey(device, f.id), null)}
        onScreen={(screen) => setFrame(i, { screen })}
        onDownload={() => run(`Rendering ${i + 1}…`, () => exportOne(nodesFor(target)[i], i, f, target))}
        busy={!!busy}
      />
    ));
  };

  return (
    <div className="studio">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-title">Nayl Screenshot Studio</div>
          <div className="brand-sub">
            iPhone {TARGETS[iphone].width} × {TARGETS[iphone].height} · iPad {TARGETS[IPAD_TARGET].width} × {TARGETS[IPAD_TARGET].height}
          </div>
        </div>

        <Section title="Typography">
          <Field label="Font">
            <div className="chips">
              {Object.entries(FONTS).map(([k, f]) => (
                <button key={k} className={`chip ${state.font === k ? 'on' : ''}`} style={{ fontFamily: f.stack }} onClick={() => set({ font: k })}>
                  {f.label}
                </button>
              ))}
            </div>
          </Field>
          <Row>
            <Field label="Weight">
              <Select value={state.headlineWeight} options={WEIGHTS} onChange={(v) => set({ headlineWeight: +v })} />
            </Field>
            <Field label={`Size · ${state.headlineSize}px`}>
              <input type="range" min="80" max="190" value={state.headlineSize} onChange={(e) => set({ headlineSize: +e.target.value })} />
            </Field>
          </Row>
          <Row>
            <Field label={`Letter spacing · ${state.letterSpacing.toFixed(3)}em`}>
              <input type="range" min="-0.05" max="0.1" step="0.005" value={state.letterSpacing} onChange={(e) => set({ letterSpacing: +e.target.value })} />
            </Field>
            <Color label="Title colour" value={state.headlineColor} fallback={theme.headline} onChange={(v) => set({ headlineColor: v })} />
          </Row>
        </Section>

        <Section title="Background">
          <div className="swatches">
            {Object.entries(BACKGROUNDS).map(([k, b]) => (
              <button key={k} title={b.label} className={`swatch ${!state.customBg && state.background === k ? 'on' : ''}`} onClick={() => set({ background: k, customBg: false })}>
                <span style={{ background: `radial-gradient(60% 45% at 50% 55%, ${b.glow}55, transparent), linear-gradient(180deg, ${b.from}, ${b.to})` }} />
                <em>{b.label}</em>
              </button>
            ))}
          </div>
          <label className="check">
            <input type="checkbox" checked={state.customBg} onChange={(e) => set({ customBg: e.target.checked })} /> Custom hex colours
          </label>
          {state.customBg && (
            <Row>
              <Hex label="Top" value={state.customFrom} onChange={(v) => set({ customFrom: v })} />
              <Hex label="Bottom" value={state.customTo} onChange={(v) => set({ customTo: v })} />
              <Hex label="Glow" value={state.customGlow} onChange={(v) => set({ customGlow: v })} />
            </Row>
          )}
          <Row>
            <Field label="Texture">
              <Select value={state.texture} options={Object.entries(TEXTURES)} onChange={(v) => set({ texture: v })} />
            </Field>
            <Field label={`Texture strength · ${state.textureStrength}%`}>
              <input type="range" min="0" max="100" value={state.textureStrength} onChange={(e) => set({ textureStrength: +e.target.value })} />
            </Field>
          </Row>
        </Section>

        <Section title="Device frame">
          <div className="chips">
            {Object.entries(FINISHES).map(([k, f]) => (
              <button key={k} className={`chip ${state.finish === k ? 'on' : ''}`} onClick={() => set({ finish: k })}>
                <i className="dot" style={{ background: f.frame }} />
                {f.label}
              </button>
            ))}
          </div>
          <div className="hint">iPhone 16 Pro and iPad Pro 12.9″</div>
          <label className="check">
            <input type="checkbox" checked={state.shadow} onChange={(e) => set({ shadow: e.target.checked })} /> Shadow
          </label>
          <label className="check">
            <input type="checkbox" checked={state.glow} onChange={(e) => set({ glow: e.target.checked })} /> Glow
          </label>
          <label className="check">
            <input type="checkbox" checked={state.showCallouts} onChange={(e) => set({ showCallouts: e.target.checked })} /> Floating call-out cards
          </label>
          <Field label={`Device frame scale · ${state.phoneScale}%`}>
            <input type="range" min="60" max="125" value={state.phoneScale} onChange={(e) => set({ phoneScale: +e.target.value })} />
          </Field>
        </Section>

        <Section title="Frame 3 ring pop-out">
          <Field label={`Analytics ring scale · ${state.ringPopScale.toFixed(2)}×`}>
            <input type="range" min="1" max="1.4" step="0.01" value={state.ringPopScale} onChange={(e) => set({ ringPopScale: +e.target.value })} />
          </Field>
        </Section>

        <Section title="Nail Progress photos">
          {NAIL_TILE_DAYS.map((day) => (
            <NailPhotoRow
              key={day}
              day={day}
              src={photos[day]}
              fromFolder={!images[nailKey(day)] && !!FOLDER_PHOTOS[day]}
              onFile={(file) => onFile(nailKey(day), file)}
              onClear={images[nailKey(day)] ? () => setImage(nailKey(day), null) : null}
            />
          ))}
          <div className="hint">Or save them as day-1 and day-14 (.jpg, .png or .webp) in tools/screenshot-studio/nail-photos/.</div>
        </Section>

        <Section title="Canvas padding">
          <Field label={`Top padding (canvas top to title) · ${state.topPadding}px`}>
            <input type="range" min="60" max="600" step="5" value={state.topPadding} onChange={(e) => set({ topPadding: +e.target.value })} />
          </Field>
          <Field label={`Bottom padding (device to canvas bottom) · ${state.bottomPadding}px`}>
            <input type="range" min="-600" max="500" step="5" value={state.bottomPadding} onChange={(e) => set({ bottomPadding: +e.target.value })} />
          </Field>
          <div className="hint">Padding is in iPhone 6.7″ pixels and scales with each export size. Negative bottom padding lets the device run off the bottom edge.</div>
        </Section>

        <Section title="Headlines">
          {state.frames.map((f, i) => (
            <div key={f.id} className="panel-edit">
              <div className="panel-name">
                {i + 1}. {f.name}
              </div>
              <input value={f.headline} onChange={(e) => setFrame(i, { headline: e.target.value })} />
            </div>
          ))}
        </Section>

        <Section title="Export">
          <Field label="Export folder">
            <input value={state.exportDir} placeholder={DEFAULT_EXPORT_DIR} onChange={(e) => set({ exportDir: e.target.value })} />
          </Field>
          <Field label="Export All">
            <Select
              value={state.exportMode}
              options={[
                ['disk', diskOk ? 'Save PNGs into the export folder' : 'Save into the export folder (needs npm run dev)'],
                ['zip', 'Download one ZIP'],
                ['files', 'Download 5 separate PNGs'],
              ]}
              onChange={(v) => set({ exportMode: v })}
            />
          </Field>
          <div className="hint">
            {mode === 'disk'
              ? 'Folder is relative to the Nayl repo root.'
              : state.exportMode === 'disk'
                ? 'Saving to disk only works while the studio runs through npm run dev, so Export All will download a ZIP instead.'
                : 'The ZIP keeps the export folder as its folder structure.'}
          </div>
          <button
            className="ghost"
            onClick={() => {
              if (!confirm('Reset all text, colours and uploaded screens to the defaults?')) return;
              setState(DEFAULT_STATE);
              DEFAULT_STATE.frames.forEach((f) => {
                setImage(f.id, null);
                setImage(captureKey('ipad', f.id), null);
              });
              NAIL_TILE_DAYS.forEach((d) => setImage(nailKey(d), null));
            }}
          >
            Reset everything to defaults
          </button>
        </Section>
      </aside>

      <main className="stage">
        <header className="toolbar">
          <div>
            <div className="toolbar-title">5 frames · PNG @ 300 DPI</div>
            <div className="toolbar-note">{busy || note || 'Drop a real screen capture on any frame to replace its built-in screen.'}</div>
          </div>
        </header>

        <section className="device-section" data-section="iphone">
          <div className="section-head">
            <div>
              <h2>iPhone</h2>
              <select value={iphone} onChange={(e) => set({ iphoneSize: e.target.value })} title="iPhone export size">
                {IPHONE_SIZES.map((k) => (
                  <option key={k} value={k}>
                    {TARGETS[k].label} · {TARGETS[k].width} × {TARGETS[k].height}
                  </option>
                ))}
              </select>
            </div>
            <button className="primary" disabled={!!busy} onClick={() => doExportAll(iphone)}>
              Export All iPhone
            </button>
          </div>
          <div className="strip">{strip(iphone)}</div>
        </section>

        <section className="device-section" data-section="ipad">
          <div className="section-head">
            <div>
              <h2>iPad</h2>
              <span className="size">
                {TARGETS[IPAD_TARGET].label} · {TARGETS[IPAD_TARGET].width} × {TARGETS[IPAD_TARGET].height}
              </span>
            </div>
            <button className="primary" disabled={!!busy} onClick={() => doExportAll(IPAD_TARGET)}>
              Export All iPad
            </button>
          </div>
          <div className="strip">{strip(IPAD_TARGET)}</div>
        </section>
      </main>
    </div>
  );
}

function FrameCard({ index, frame, state, target, image, photos, nodeRef, onFile, onClearImage, onScreen, onDownload, busy }) {
  const [over, setOver] = useState(false);
  const size = TARGETS[target];
  const scale = PREVIEW_H / size.height;
  const input = useRef(null);
  return (
    <div className="card">
      <div
        className={`preview ${over ? 'over' : ''}`}
        style={{ width: size.width * scale, height: PREVIEW_H }}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          onFile(e.dataTransfer.files[0]);
        }}
      >
        <div style={{ transform: `scale(${scale})`, transformOrigin: '0 0' }}>
          <Frame ref={nodeRef} state={state} frame={frame} target={target} image={image} photos={photos} />
        </div>
      </div>
      <div className="card-meta" style={{ width: Math.max(250, size.width * scale) }}>
        <div className="card-title">
          {index + 1}. {frame.name}
        </div>
        <select value={frame.screen} onChange={(e) => onScreen(e.target.value)} title="Built-in device screen">
          {Object.entries(SCREENS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <div className="card-actions">
          <button onClick={() => input.current.click()}>{image ? 'Replace capture' : 'Use real capture'}</button>
          {image && <button onClick={onClearImage}>Use built-in</button>}
          <button disabled={busy} onClick={onDownload} title={`Download ${size.width} × ${size.height} PNG`}>
            PNG {size.width}×{size.height}
          </button>
        </div>
        <input ref={input} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files[0])} />
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="section">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function Row({ children }) {
  return <div className="row">{children}</div>;
}

function Field({ label, children }) {
  return (
    <div className="field">
      <span>{label}</span>
      {children}
    </div>
  );
}

function Select({ value, options, onChange }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((o) => {
        const [v, l] = Array.isArray(o) ? o : [o, o];
        return (
          <option key={v} value={v}>
            {l}
          </option>
        );
      })}
    </select>
  );
}

function toHex(c) {
  return /^#[0-9a-f]{6}$/i.test(c) ? c : '#ffffff';
}

function Color({ label, value, fallback, onChange }) {
  return (
    <div className="field color">
      <span>{label}</span>
      <div className="color-row">
        <input type="color" value={toHex(value || fallback)} onChange={(e) => onChange(e.target.value)} />
        {value ? (
          <button className="link" onClick={() => onChange('')}>
            auto
          </button>
        ) : (
          <em>auto</em>
        )}
      </div>
    </div>
  );
}

function Hex({ label, value, onChange }) {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);
  return (
    <div className="field">
      <span>{label}</span>
      <div className="color-row">
        <input type="color" value={toHex(value)} onChange={(e) => onChange(e.target.value)} />
        <input
          className="hex"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (/^#[0-9a-f]{6}$/i.test(e.target.value)) onChange(e.target.value);
          }}
        />
      </div>
    </div>
  );
}

function NailPhotoRow({ day, src, fromFolder, onFile, onClear }) {
  const input = useRef(null);
  return (
    <div className="nail-row">
      <div className="nail-thumb">{src ? <img src={src} alt="" /> : <span>+</span>}</div>
      <div className="nail-label">
        Day {day}
        <em>{src ? (fromFolder ? 'from nail-photos/' : 'uploaded') : 'empty'}</em>
      </div>
      <button className="ghost" onClick={() => input.current.click()}>
        {src ? 'Replace' : 'Add photo'}
      </button>
      {onClear && (
        <button className="link" onClick={onClear}>
          Clear
        </button>
      )}
      <input ref={input} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files[0])} />
    </div>
  );
}
