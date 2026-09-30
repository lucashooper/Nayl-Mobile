export const CANVAS = { width: 1290, height: 2796 }; // 6.7" / 6.9" iPhone App Store size

export const FONTS = {
  modern: { label: 'Modern Sans', stack: "'Manrope Variable', 'Inter Variable', system-ui, sans-serif" },
  inter: { label: 'Inter', stack: "'Inter Variable', system-ui, sans-serif" },
  sfpro: {
    label: 'SF Pro',
    // SF Pro can't be bundled (Apple licence); on a Mac the system font is SF Pro.
    stack: "-apple-system, 'SF Pro Display', BlinkMacSystemFont, 'Inter Variable', sans-serif",
  },
  serif: { label: 'Clean Serif', stack: "'Playfair Display Variable', Georgia, serif" },
  rounded: { label: 'Rounded', stack: "ui-rounded, 'SF Pro Rounded', 'Nunito Variable', system-ui, sans-serif" },
};

export const WEIGHTS = [300, 400, 500, 600, 700, 800, 900];

// Luxury gradients. `dark` decides the default text colour when a preset is picked.
export const BACKGROUNDS = {
  midnight: { label: 'Midnight Luxe', dark: true, css: 'radial-gradient(120% 70% at 50% 0%, #1f2a44 0%, #0b0f1a 55%, #05070c 100%)', accent: '#7fb2ff', glow: '#4d7cff' },
  aurora: { label: 'Aurora', dark: true, css: 'radial-gradient(90% 55% at 15% 5%, #3a1f6e 0%, transparent 60%), radial-gradient(80% 50% at 95% 35%, #0f4c5c 0%, transparent 60%), linear-gradient(180deg, #0c0a1d 0%, #06060d 100%)', accent: '#b69cff', glow: '#8b5cf6' },
  emerald: { label: 'Obsidian Emerald', dark: true, css: 'radial-gradient(110% 60% at 50% 0%, #11392c 0%, #07140f 55%, #030806 100%)', accent: '#6ee7a8', glow: '#22c55e' },
  ember: { label: 'Black Ember', dark: true, css: 'radial-gradient(100% 60% at 50% 100%, #3b0d12 0%, #120507 55%, #050203 100%)', accent: '#ff7a7a', glow: '#ef4444' },
  ivory: { label: 'Ivory', dark: false, css: 'linear-gradient(180deg, #fbf8f2 0%, #efe8dc 100%)', accent: '#3f7d5a', glow: '#c9b98f' },
  champagne: { label: 'Champagne', dark: false, css: 'radial-gradient(120% 70% at 50% 0%, #fff7ea 0%, #f1e2c6 60%, #e3cfa8 100%)', accent: '#9a6b1f', glow: '#e0b872' },
  pearl: { label: 'Pearl Mist', dark: false, css: 'radial-gradient(90% 55% at 10% 0%, #e9eefc 0%, transparent 60%), radial-gradient(80% 55% at 100% 40%, #f6e8f3 0%, transparent 60%), linear-gradient(180deg, #f8f9fc 0%, #eceff6 100%)', accent: '#5561d6', glow: '#9aa6ff' },
};

export const TEXTURES = { none: 'None', mesh: 'Mesh', grain: 'Grain', both: 'Mesh + grain' };

export const FINISHES = {
  titanium: { label: 'Natural Titanium', frame: 'linear-gradient(135deg, #d9d5cd 0%, #9d998f 22%, #e4e0d8 48%, #8a867d 74%, #c9c5bc 100%)', edge: '#6f6b63' },
  midnight: { label: 'Midnight', frame: 'linear-gradient(135deg, #3b3f47 0%, #15171b 25%, #33363d 50%, #0f1114 75%, #2a2d33 100%)', edge: '#050608' },
  starlight: { label: 'Starlight', frame: 'linear-gradient(135deg, #fbf7ef 0%, #d9d2c3 25%, #f6f1e6 50%, #cfc7b6 75%, #efe9dc 100%)', edge: '#a9a192' },
};

export const SCREENS = {
  home: 'Home: streak counter',
  panic: 'Panic button',
  progress: 'Recovery progress ring',
  library: 'Sound & wellness library',
  milestones: 'Milestones & analytics',
};

export const DEFAULT_STATE = {
  version: 1,
  font: 'modern',
  headlineWeight: 800,
  headlineSize: 128,
  subtitleWeight: 500,
  subtitleSize: 54,
  headlineColor: '',
  subtitleColor: '',
  accentColor: '',
  background: 'midnight',
  customBg: false,
  customFrom: '#101626',
  customTo: '#04060b',
  texture: 'mesh',
  textureStrength: 60,
  finish: 'midnight',
  shadow: true,
  glow: true,
  phoneScale: 100,
  phoneTop: 840,
  showCallouts: true,
  exportMode: 'zip',
  frames: [
    { id: 'hook', name: 'The Hook', screen: 'home', headline: 'Break the Habit.\n*Restore Your Confidence.*', subtitle: 'Your bite-free streak, one day at a time' },
    { id: 'panic', name: 'Panic Button', screen: 'panic', headline: 'One Tap\nWhen *Tempted*', subtitle: 'Instant support the moment an urge hits' },
    { id: 'progress', name: 'Streak & Progress', screen: 'progress', headline: 'Track Every\n*Bite-Free* Day', subtitle: 'Clear recovery metrics that keep you going' },
    { id: 'library', name: 'Sound & Wellness', screen: 'library', headline: 'Calm the Urge\nwith *Guided Audio*', subtitle: 'Ambient sounds and guided meditation' },
    { id: 'milestones', name: 'Milestones', screen: 'milestones', headline: 'Watch Your\n*Progress Grow*', subtitle: 'Milestones and stats that prove it’s working' },
  ],
};
