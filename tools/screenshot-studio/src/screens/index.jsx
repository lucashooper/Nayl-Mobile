import { C, APP_FONT, Page, TabBar, Icon, Ring, WeekRow, PanicPill } from './kit.jsx';
import NaylOrb from './NaylOrb.jsx';
import Squircle from './Squircle.jsx';
import flameIcon from '@app-assets/new-flame-icon.webp';
import trophyIcon from '@app-assets/trophy-icon.webp';
import enamelIcon from '@app-assets/panic-button-icons/damaged-enamel-icon.webp';
import bacteriaIcon from '@app-assets/panic-button-icons/bacteria.webp';
import anxietyIcon from '@app-assets/panic-button-icons/anxiety-loop.webp';
import mountain from '@app-assets/mountain-scene-background.webp';
import rainIcon from '@app-assets/library-sound-icons/rain-icon.webp';
import seaIcon from '@app-assets/library-sound-icons/new-sea-icon.webp';
import campfireIcon from '@app-assets/library-sound-icons/new-campfire-icon.webp';
import noiseIcon from '@app-assets/library-sound-icons/white-noise-icon.webp';
import confidenceIcon from '@app-assets/recovery-page-icons/increased-confidence.webp';
import nailsIcon from '@app-assets/recovery-page-icons/healthy-nails.webp';
import sprout from '@app-assets/bigger-achievement-icons/Sprout-280px.png';
import sun from '@app-assets/bigger-achievement-icons/Sun-280px.png';
import rooted from '@app-assets/bigger-achievement-icons/Deeply-Rooted-280px.png';
import blossom from '@app-assets/bigger-achievement-icons/Blossom-280px.png';
import oak from '@app-assets/bigger-achievement-icons/Da-Oak-280px.png';
import landmark from '@app-assets/bigger-achievement-icons/Landmark-280px.png';

// Floating call-out cards, Cal AI style: a wide card that overhangs the phone
// slightly on both sides. Content is laid out in points (like the screens) and
// scaled up; `top` is the screen point the card's top edge lines up with.
const CARD_PT = 340;
const CALLOUT_SCALE = 3.2; // x phone width / 1000

// Every call-out casts the same shadow in canvas pixels: 0 20px 40px rgba(0,0,0,0.5).
// Call-outs are drawn in points and scaled, so the shadow is converted back to points.
function shadowFor(phone, on) {
  if (!on) return '';
  const s = CALLOUT_SCALE * (phone.width / 1000);
  return `drop-shadow(0 ${20 / s}px ${20 / s}px rgba(0,0,0,0.5))`; // drop-shadow blur = box-shadow blur / 2
}

function Callout({ phone, top, width = CARD_PT, children }) {
  const scale = CALLOUT_SCALE * (phone.width / 1000);
  return (
    <div
      style={{
        position: 'absolute',
        left: phone.x + phone.width / 2 - (width * scale) / 2,
        top: phone.y + phone.inset + top * phone.scale,
        width,
        transform: `scale(${scale})`,
        transformOrigin: '0 0',
        fontFamily: APP_FONT,
        color: '#fff',
      }}
    >
      {children}
    </div>
  );
}

// Glass card with iOS continuous (squircle) corners.
function Card({ phone, shadow, radius = 24, style, children }) {
  return (
    <Squircle radius={radius} fill={['#2c2048', '#160f28']} shadow={shadowFor(phone, shadow)} style={style}>
      {children}
    </Squircle>
  );
}

/* ---------------------------------------------------------------- Home */

function ActionButton({ icon, label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 56, height: 56, borderRadius: 28, background: C.navy, borderTop: '0.5px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(0,0,0,0.3)', boxShadow: '0 4px 12px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={22} width={1.8} />
      </div>
      <span style={{ fontSize: 14, fontWeight: 700 }}>{label}</span>
    </div>
  );
}

function HomeScreen() {
  return (
    <Page>
      <div style={{ position: 'absolute', top: 62, left: 24, right: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 20, background: C.lime, color: '#0F172A', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.15)' }}>JS</div>
          <span style={{ fontSize: 16, fontWeight: 600 }}>James</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <img src={flameIcon} alt="" style={{ width: 24, height: 24 }} />
          <span style={{ fontSize: 16 }}>14</span>
          <img src={trophyIcon} alt="" style={{ width: 32, height: 32, marginLeft: 8 }} />
        </div>
      </div>
      <div style={{ position: 'absolute', top: 118, left: 34, right: 34 }}>
        <WeekRow done={4} today={4} />
      </div>
      <div style={{ position: 'absolute', top: 178, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <NaylOrb id="home-orb" />
      </div>
      <div style={{ position: 'absolute', top: 372, left: 0, right: 0, textAlign: 'center' }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: C.muted }}>You've been nail-biting free for:</div>
        <div style={{ fontSize: 42, fontWeight: 900, lineHeight: '48px', marginTop: 6, fontVariantNumeric: 'tabular-nums', textShadow: '0 2px 4px rgba(0,0,0,0.4), 0 0 18px rgba(193,255,114,0.18)' }}>
          14 Days 6hrs
          <br />
          42m 18s
        </div>
      </div>
      <div style={{ position: 'absolute', top: 508, left: 32, right: 32, display: 'flex', justifyContent: 'space-between' }}>
        <ActionButton icon="create" label="Streak" />
        <ActionButton icon="bulb" label="Tips" />
        <ActionButton icon="heart" label="Meditate" />
        <ActionButton icon="refresh" label="Reset" />
      </div>
      <div style={{ position: 'absolute', top: 606, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 24px', borderRadius: 16, background: C.navy, border: `0.5px solid ${C.hairline}` }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Brain Rewiring</span>
          <div style={{ width: 120, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{ width: '23%', height: '100%', background: C.blue }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700 }}>23%</span>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 656, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <PanicPill />
      </div>
      <TabBar active="home" />
    </Page>
  );
}

/* ---------------------------------------------------------------- Panic */

function PanicRow({ icon, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', borderTopColor: 'rgba(255,255,255,0.15)' }}>
      <img src={icon} alt="" style={{ width: 32, height: 32, objectFit: 'contain' }} />
      <span style={{ flex: 1, fontSize: 15, lineHeight: 1.35 }}>{text}</span>
      <div style={{ width: 32, height: 32, borderRadius: 4, background: 'rgba(193,255,114,0.2)', border: `1px solid ${C.lime}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="arrow" size={16} color={C.lime} width={2.2} />
      </div>
    </div>
  );
}

function PanicScreen() {
  const btn = (bg, label) => (
    <div style={{ padding: 16, borderRadius: 16, background: bg, textAlign: 'center', fontSize: 16, fontWeight: 600, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>{label}</div>
  );
  return (
    <Page background="#000" starColor="255,255,255">
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }} />
      <div style={{ position: 'absolute', top: 64, left: 24 }}>
        <Icon name="close" size={24} width={2} />
      </div>
      <div style={{ position: 'absolute', top: 104, left: 24, right: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 36, fontWeight: 700, lineHeight: '44px', letterSpacing: 1 }}>
          STOP
          <br />
          YOU MADE A
          <br />
          PROMISE TO
          <br />
          YOURSELF.<span style={{ color: C.lime, fontWeight: 900, textShadow: `0 0 10px ${C.lime}` }}>|</span>
        </div>
        <div style={{ marginTop: 22, fontSize: 18, lineHeight: '24px' }}>Keep going, the urge to bite will pass...</div>
      </div>
      <div style={{ position: 'absolute', top: 376, left: 24, right: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <PanicRow icon={enamelIcon} text="Biting can damage your teeth enamel." />
        <PanicRow icon={bacteriaIcon} text="Your nails are full of harmful bacteria." />
        <PanicRow icon={anxietyIcon} text="Biting your nails can reinforce anxiety." />
        <div style={{ textAlign: 'center', fontSize: 14, color: '#A9A9A9', marginTop: 10 }}>See images (Trigger warning)</div>
      </div>
      <div style={{ position: 'absolute', top: 640, left: 24, right: 24, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {btn('linear-gradient(180deg, #A3E635, #16A34A)', 'Keep Going')}
        {btn('linear-gradient(180deg, #EF4444, #991B1B)', "I'm getting urges")}
      </div>
    </Page>
  );
}

function PanicCallout({ phone, shadow }) {
  return (
    <Callout phone={phone} top={-40}>
      <div style={{ filter: shadowFor(phone, shadow) || 'none' }}>
        <PanicPill width={CARD_PT} />
      </div>
    </Callout>
  );
}

/* ---------------------------------------------------------------- Progress */

// AnalyticsScreen.tsx: AnimatedProgressRing size 360, stroke 16, with the
// RECOVERY / % / DAY STREAK / target text stacked in the middle.
const RING_PT = 360;
const RING_TOP = 136;

function RecoveryRing({ id }) {
  return (
    <div style={{ position: 'relative', width: RING_PT, height: RING_PT }}>
      <Ring id={id} size={RING_PT} stroke={16} value={0.23} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: 1.2, color: C.secondary }}>RECOVERY</div>
        <div style={{ fontSize: 56, fontWeight: 900, lineHeight: 1.1, textShadow: '0 0 16px rgba(193,255,114,0.15)' }}>23%</div>
        <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: 0.5, color: C.secondary }}>14 DAY STREAK</div>
        <div style={{ fontSize: 14, color: C.muted, marginTop: 6, width: 220 }}>Progress to 60 days (Brain Rewiring)</div>
      </div>
    </div>
  );
}

// `popped`: the ring is drawn enlarged by ProgressCallout, so leave its slot empty here.
function ProgressScreen({ popped }) {
  return (
    <Page>
      <div style={{ position: 'absolute', top: 62, left: 20, right: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Icon name="back" size={28} />
        <span style={{ fontSize: 30, fontWeight: 700 }}>Analytics</span>
        <Icon name="share" size={26} width={1.8} />
      </div>
      <div style={{ position: 'absolute', top: RING_TOP, left: (393 - RING_PT) / 2, visibility: popped ? 'hidden' : 'visible' }}>
        <RecoveryRing id="recovery" />
      </div>
      <div style={{ position: 'absolute', top: RING_TOP + RING_PT + 40, left: 24, right: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 17, fontWeight: 500, color: C.secondary }}>You're on track to quit nail biting by:</div>
        <div style={{ display: 'inline-block', marginTop: 12, padding: '14px 24px', borderRadius: 16, background: C.card, border: `1px solid ${C.cardBorder}`, fontSize: 22, fontWeight: 600 }}>Nov 29, 2026</div>
        <div style={{ marginTop: 18, padding: '18px 20px', borderRadius: 16, background: C.card, border: `1px solid ${C.cardBorder}`, fontSize: 16, fontWeight: 500, lineHeight: 1.45 }}>
          The first few days are always the hardest, but you've already shown incredible strength. Hold on to your reasons for starting this journey.
        </div>
      </div>
      <TabBar active="progress" />
    </Page>
  );
}

// Cal AI-style pop-out: the unchanged native ring section, scaled up about its own
// centre so it grows out over the phone.
export const RING_POP_SCALE = 1.18;

function ProgressCallout({ phone, shadow, popScale = RING_POP_SCALE }) {
  const scale = phone.scale * popScale;
  const centreX = phone.x + phone.inset + (393 / 2) * phone.scale;
  const centreY = phone.y + phone.inset + (RING_TOP + RING_PT / 2) * phone.scale;
  return (
    <div
      style={{
        position: 'absolute',
        left: centreX - (RING_PT * scale) / 2,
        top: centreY - (RING_PT * scale) / 2,
        width: RING_PT,
        height: RING_PT,
        transform: `scale(${scale})`,
        transformOrigin: '0 0',
        fontFamily: APP_FONT,
        color: '#fff',
        filter: shadow ? `drop-shadow(0 ${20 / scale}px ${20 / scale}px rgba(0,0,0,0.5))` : 'none',
      }}
    >
      <RecoveryRing id="recovery-pop" />
    </div>
  );
}

/* ---------------------------------------------------------------- Library */

const CATEGORIES = [
  ['Articles', 'rgba(220,38,38,0.85), rgba(185,28,28,0.9), rgba(153,27,27,0.95)'],
  ['Achievements', 'rgba(59,130,246,0.85), rgba(37,99,235,0.9), rgba(29,78,216,0.95)'],
  ['Learn', 'rgba(16,185,129,0.85), rgba(5,150,105,0.9), rgba(4,120,87,0.95)'],
  ['Wellness', 'rgba(245,158,11,0.85), rgba(217,119,6,0.9), rgba(180,83,9,0.95)'],
];

const SOUNDS = [
  ['Rain', rainIcon],
  ['Ocean Waves', seaIcon],
  ['Campfire', campfireIcon],
  ['White Noise', noiseIcon],
];

function LibraryScreen() {
  return (
    <Page>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 300 }}>
        <img src={mountain} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '50%', background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.3), rgba(2,4,8,0.95))' }} />
        <div style={{ position: 'absolute', left: 24, right: 24, bottom: 22, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 36, fontWeight: 700, textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>Library</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 20, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', fontSize: 15, fontWeight: 600 }}>
            Website <Icon name="arrow" size={16} />
          </span>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 318, left: 20, right: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {CATEGORIES.map(([label, g]) => (
          <div key={label} style={{ position: 'relative', overflow: 'hidden', padding: '15px 0', borderRadius: 20, textAlign: 'center', background: `linear-gradient(135deg, ${g})`, border: '1px solid rgba(255,255,255,0.15)', fontSize: 17, fontWeight: 700, letterSpacing: 0.3 }}>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '50%', background: 'linear-gradient(180deg, rgba(255,255,255,0.25), transparent)' }} />
            <span style={{ position: 'relative' }}>{label}</span>
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', top: 460, left: 24, right: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 600 }}>Relaxation Noises</div>
        <div style={{ fontSize: 15, color: C.secondary, marginTop: 4 }}>Helping your heart-rate regulate when urges surge.</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: 16, columnGap: 12, marginTop: 18 }}>
          {SOUNDS.map(([label, icon]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 50, height: 50, borderRadius: 25, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={icon} alt="" style={{ width: 32, height: 32, objectFit: 'contain' }} />
              </div>
              <span style={{ fontSize: 16 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
      <TabBar active="library" />
    </Page>
  );
}

function LibraryCallout({ phone, shadow }) {
  return (
    <Callout phone={phone} top={690}>
      <Card phone={phone} shadow={shadow} style={{ padding: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #0ea5e9, #1e3a8a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={seaIcon} alt="" style={{ width: 36, height: 36, objectFit: 'contain' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, color: C.lime }}>NOW PLAYING</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 1 }}>Ocean Waves</div>
            <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.12)', marginTop: 8, overflow: 'hidden' }}>
              <div style={{ width: '42%', height: '100%', background: C.blue }} />
            </div>
          </div>
          <div style={{ width: 44, height: 44, borderRadius: 22, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="pause" size={18} color="#140e24" width={3} />
          </div>
        </div>
      </Card>
    </Callout>
  );
}

/* ---------------------------------------------------------------- Milestones */

const BADGES = [
  ['Sprout', sprout, '1/1 days', true],
  ['Sun-kissed', sun, '7/7 days', true],
  ['Deeply Rooted', rooted, '30/30 days', true],
  ['Blossoming', blossom, '60 days', false],
  ['The Oak', oak, '90 days', false],
  ['Conqueror', landmark, '180 days', false],
];

const BENEFITS = [
  ['Improved Confidence', confidenceIcon, 0.85, C.lime],
  ['Healthier Nails', nailsIcon, 0.72, '#FFB366'],
];

function MilestonesScreen() {
  return (
    <Page>
      <div style={{ position: 'absolute', top: 62, left: 20, right: 20, display: 'flex', alignItems: 'center' }}>
        <Icon name="back" size={28} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: 30, fontWeight: 800, marginRight: 28 }}>Achievements</span>
      </div>
      <div style={{ position: 'absolute', top: 118, left: 24, right: 24 }}>
        <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <div style={{ width: '50%', height: '100%', background: C.blue }} />
        </div>
        <div style={{ fontSize: 13, fontWeight: 500, color: C.muted, marginTop: 8, textAlign: 'center' }}>3 of 6 achievements unlocked</div>
      </div>
      <div style={{ position: 'absolute', top: 166, left: 16, right: 16, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {BADGES.map(([name, icon, progress, unlocked]) => (
          <div key={name} style={{ padding: '14px 6px', borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            {unlocked ? (
              <img src={icon} alt="" style={{ width: 72, height: 72, objectFit: 'contain' }} />
            ) : (
              <div style={{ width: 72, height: 72, borderRadius: 36, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="lock" size={30} color="rgba(255,255,255,0.4)" width={1.8} />
              </div>
            )}
            <div style={{ fontSize: unlocked ? 14 : 13, fontWeight: unlocked ? 700 : 600, color: unlocked ? '#fff' : C.secondary, opacity: unlocked ? 1 : 0.8 }}>{name}</div>
            <div style={{ fontSize: unlocked ? 12 : 11, fontWeight: unlocked ? 600 : 400, color: unlocked ? C.lime : C.muted }}>{progress}</div>
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', top: 486, left: 20, right: 20 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          {[['45', 'Days bite-free'], ['75%', 'Recovery'], ['132', 'Urges beaten']].map(([v, l]) => (
            <div key={l} style={{ flex: 1, padding: '12px 10px', borderRadius: 16, background: C.card, border: `1px solid ${C.cardBorder}`, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 900 }}>{v}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14, padding: '16px 18px', borderRadius: 16, background: C.card, border: `1px solid ${C.cardBorder}`, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {BENEFITS.map(([title, icon, v, color]) => (
            <div key={title} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 20, background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={icon} alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 600 }}>
                  <span>{title}</span>
                  <span style={{ color: C.muted, fontWeight: 500 }}>{Math.round(v * 100)}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'rgba(148,163,184,0.25)', marginTop: 6, overflow: 'hidden' }}>
                  <div style={{ width: `${v * 100}%`, height: '100%', background: C.blue }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <TabBar active="library" />
    </Page>
  );
}

function MilestonesCallout({ phone, shadow }) {
  return (
    <Callout phone={phone} top={700}>
      <Card phone={phone} shadow={shadow} style={{ padding: '14px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img src={rooted} alt="" style={{ width: 64, height: 64, objectFit: 'contain' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, color: C.lime }}>MILESTONE UNLOCKED</div>
            <div style={{ fontSize: 20, fontWeight: 800, marginTop: 2 }}>Deeply Rooted</div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 1 }}>30 days bite-free</div>
          </div>
        </div>
      </Card>
    </Callout>
  );
}

/* ---------------------------------------------------------------- Nail Progress */
// src/screens/NailProgressScreen.tsx: header, lime stats card, 2 x 2 photo grid
// (PHOTO_SIZE = (width - 72) / 2, radius 12, "Day N" + date on a dark fade) and the
// Camera / Gallery buttons pinned to the bottom.

export const NAIL_DAYS = [
  [14, 'Jul 20, 2026'],
  [9, 'Jul 15, 2026'],
  [5, 'Jul 11, 2026'],
  [1, 'Jul 7, 2026'],
];

// Empty tile, styled like the app's photoCard background, until a photo is added.
function PhotoPlaceholder({ size = 26 }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg, rgba(255,255,255,0.09), rgba(255,255,255,0.03))' }}>
      <Icon name="camera" size={size} color="rgba(255,255,255,0.35)" width={1.6} />
    </div>
  );
}

function NailsScreen({ photos = {} }) {
  const photo = (393 - 72) / 2;
  return (
    <Page>
      <div style={{ position: 'absolute', top: 74, left: 24, right: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Icon name="back" size={28} />
        <span style={{ fontSize: 36, fontWeight: 700, letterSpacing: -0.3 }}>Nail Progress</span>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.lime} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="6" r="2.5" />
          <circle cx="18" cy="18" r="2.5" />
          <path d="M6 8.5V15a3 3 0 003 3h4M18 15.5V9a3 3 0 00-3-3h-4M13 16l-2 2 2 2M11 4l2 2-2 2" />
        </svg>
      </div>
      <div style={{ position: 'absolute', top: 136, left: 24, right: 24, borderRadius: 16, padding: 24, background: 'linear-gradient(180deg, rgba(193,255,114,0.15), rgba(193,255,114,0.05))', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
        {[['4', 'Photos'], ['14', 'Days Clean']].map(([v, l], i) => (
          <div key={l} style={{ display: 'contents' }}>
            {i > 0 && <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.1)', opacity: 0.3 * 3 }} />}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: C.lime, marginBottom: 4 }}>{v}</div>
              <div style={{ fontSize: 14, color: C.secondary }}>{l}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', top: 276, left: 24, right: 24, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {NAIL_DAYS.map(([day, date]) => (
          <div key={day} style={{ position: 'relative', width: photo, height: photo, borderRadius: 12, overflow: 'hidden', marginBottom: 16, background: 'rgba(255,255,255,0.05)' }}>
            {photos[day] ? <img src={photos[day]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /> : <PhotoPlaceholder />}
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 8, paddingTop: 22, background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.8))', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <span style={{ fontSize: 16, fontWeight: 700 }}>Day {day}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>{date}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', left: 24, right: 24, bottom: 54, display: 'flex', gap: 8 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px 0', borderRadius: 16, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', fontSize: 16, fontWeight: 600 }}>
          <Icon name="camera" size={22} width={1.8} /> Camera
        </div>
        <div style={{ flex: 1.4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px 0', borderRadius: 16, background: 'linear-gradient(135deg, #C1FF72, #9FE855, #7DD138)', color: '#000', fontSize: 18, fontWeight: 700, boxShadow: '0 8px 16px rgba(0,0,0,0.3)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#000"><path d="M8 3h11a2 2 0 012 2v11a2 2 0 01-2 2H8a2 2 0 01-2-2V5a2 2 0 012-2zm1.5 11.5h8l-2.6-3.4-2 2.5-1.4-1.7-2 2.6zM11 8a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM3 7v12a2 2 0 002 2h12v-1.8H5a.2.2 0 01-.2-.2V7z" /></svg>
          Gallery
        </div>
      </div>
    </Page>
  );
}

function NailsCallout({ phone, shadow, photos = {} }) {
  return (
    <Callout phone={phone} top={660}>
      <Card phone={phone} shadow={shadow} style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex' }}>
            {[1, 14].map((day, i) => (
              <div key={day} style={{ width: 52, height: 52, borderRadius: 12, overflow: 'hidden', border: '2px solid #1c1430', marginLeft: i ? -14 : 0, background: '#241a3a' }}>
                {photos[day] ? <img src={photos[day]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /> : <PhotoPlaceholder size={20} />}
              </div>
            ))}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 21, fontWeight: 800 }}>Visual Photo Logs</div>
            <div style={{ fontSize: 14, color: C.muted, marginTop: 2 }}>Day 1 to Day 14, side by side</div>
          </div>
        </div>
      </Card>
    </Callout>
  );
}

export const SCREEN_COMPONENTS = {
  home: { Screen: HomeScreen },
  panic: { Screen: PanicScreen, Callout: PanicCallout },
  progress: { Screen: ProgressScreen, Callout: ProgressCallout },
  library: { Screen: LibraryScreen, Callout: LibraryCallout },
  milestones: { Screen: MilestonesScreen, Callout: MilestonesCallout },
  nails: { Screen: NailsScreen, Callout: NailsCallout },
};
