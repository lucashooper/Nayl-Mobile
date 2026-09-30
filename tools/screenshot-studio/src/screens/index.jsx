import { C, APP_FONT, Page, TabBar, Icon, Ring, WeekRow, PanicPill } from './kit.jsx';
import NaylOrb from './NaylOrb.jsx';
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

function Callout({ phone, top, width = CARD_PT, children }) {
  const scale = 3.2 * (phone.width / 1000);
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

const card = (shadow) => ({
  background: 'linear-gradient(180deg, #1f1733 0%, #140e24 100%)',
  border: '1px solid rgba(255,255,255,0.14)',
  borderRadius: 24,
  boxShadow: shadow ? '0 16px 36px rgba(0,0,0,0.5)' : 'none',
});

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
        <div style={{ fontSize: 42, fontWeight: 900, marginTop: 6, textShadow: '0 2px 4px rgba(0,0,0,0.4), 0 0 18px rgba(193,255,114,0.18)' }}>14 days</div>
        <div style={{ display: 'inline-block', marginTop: 8, padding: '8px 16px', borderRadius: 18, background: 'rgba(20,26,48,0.75)', border: `0.5px solid ${C.hairline}`, fontSize: 16, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>6hr 42m 18s</div>
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

function HomeCallout({ phone, shadow }) {
  // Sits over the in-app timer block (points 368-500), leaving the orb and action buttons visible.
  return (
    <Callout phone={phone} top={368}>
      <div style={{ ...card(shadow), padding: '12px 14px 12px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 46, fontWeight: 900, lineHeight: 1 }}>14</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: C.secondary }}>days bite-free</span>
          </div>
          <div style={{ display: 'inline-block', marginTop: 8, padding: '4px 12px', borderRadius: 14, background: 'rgba(255,255,255,0.06)', border: `0.5px solid ${C.hairline}`, fontSize: 14, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>6hr 42m 18s</div>
        </div>
        <NaylOrb id="callout-orb" size={78} strokeWidth={6} glow={false} />
      </div>
    </Callout>
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
      <div style={{ filter: shadow ? 'drop-shadow(0 10px 22px rgba(224,46,46,0.45))' : 'none' }}>
        <PanicPill width={CARD_PT} />
      </div>
    </Callout>
  );
}

/* ---------------------------------------------------------------- Progress */

function ProgressScreen() {
  return (
    <Page>
      <div style={{ position: 'absolute', top: 62, left: 20, right: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Icon name="back" size={28} />
        <span style={{ fontSize: 30, fontWeight: 700 }}>Analytics</span>
        <Icon name="share" size={26} width={1.8} />
      </div>
      <div style={{ position: 'absolute', top: 128, left: '50%', marginLeft: -150, width: 300, height: 300 }}>
        <Ring id="recovery" size={300} stroke={16} value={0.23} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: 1.2, color: C.secondary }}>RECOVERY</div>
          <div style={{ fontSize: 56, fontWeight: 900, lineHeight: 1.1, textShadow: '0 0 16px rgba(193,255,114,0.15)' }}>23%</div>
          <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: 0.5, color: C.secondary }}>14 DAY STREAK</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 6, width: 180 }}>Progress to 60 days (Brain Rewiring)</div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 458, left: 24, right: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 17, fontWeight: 500, color: C.secondary }}>You're on track to quit nail biting by:</div>
        <div style={{ display: 'inline-block', marginTop: 12, padding: '14px 24px', borderRadius: 16, background: C.card, border: `1px solid ${C.cardBorder}`, fontSize: 22, fontWeight: 600 }}>Nov 29, 2026</div>
        <div style={{ marginTop: 18, padding: '18px 20px', borderRadius: 16, background: C.card, border: `1px solid ${C.cardBorder}`, fontSize: 16, fontWeight: 500, lineHeight: 1.45 }}>
          The first few days are always the hardest, but you've already shown incredible strength. Hold on to your reasons for starting this journey.
        </div>
      </div>
      <div style={{ position: 'absolute', top: 756, left: 24, right: 24, height: 1, background: C.cardBorder }} />
      <TabBar active="progress" />
    </Page>
  );
}

function ProgressCallout({ phone, shadow }) {
  return (
    <Callout phone={phone} top={660}>
      <div style={{ ...card(shadow), padding: '16px 20px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>This week</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: C.lime }}>7 / 7 bite-free</span>
        </div>
        <WeekRow done={7} size={32} />
      </div>
    </Callout>
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
      <div style={{ ...card(shadow), padding: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
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
      <div style={{ ...card(shadow), padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <img src={rooted} alt="" style={{ width: 64, height: 64, objectFit: 'contain' }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, color: C.lime }}>MILESTONE UNLOCKED</div>
          <div style={{ fontSize: 20, fontWeight: 800, marginTop: 2 }}>Deeply Rooted</div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 1 }}>30 days bite-free</div>
        </div>
      </div>
    </Callout>
  );
}

export const SCREEN_COMPONENTS = {
  home: { Screen: HomeScreen, Callout: HomeCallout },
  panic: { Screen: PanicScreen, Callout: PanicCallout },
  progress: { Screen: ProgressScreen, Callout: ProgressCallout },
  library: { Screen: LibraryScreen, Callout: LibraryCallout },
  milestones: { Screen: MilestonesScreen, Callout: MilestonesCallout },
};
