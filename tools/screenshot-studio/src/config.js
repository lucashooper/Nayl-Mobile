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

// Background presets. `dark` picks the default title colour when a preset is chosen.
// Deep Violet is Nayl's brand background: #0B0714 -> #180D2B with a soft purple glow.
export const BACKGROUNDS = {
  violet: { label: 'Deep Violet', dark: true, from: '#0B0714', to: '#180D2B', glow: '#7C3AED' },
  plum: { label: 'Midnight Plum', dark: true, from: '#0A0610', to: '#241033', glow: '#A855F7' },
  obsidian: { label: 'Obsidian', dark: true, from: '#07070A', to: '#15131C', glow: '#6D5BD0' },
  emerald: { label: 'Obsidian Emerald', dark: true, from: '#030806', to: '#0E2A20', glow: '#22C55E' },
  ivory: { label: 'Ivory', dark: false, from: '#FBF8F2', to: '#EFE8DC', glow: '#C9B98F' },
  lilac: { label: 'Lilac Mist', dark: false, from: '#F7F4FC', to: '#E9E1F7', glow: '#B69CFF' },
};

export const TEXTURES = { none: 'None', mesh: 'Soft mesh glow', grain: 'Grain', both: 'Mesh + grain' };

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
  nails: 'Nail progress photos',
};

export const DEFAULT_EXPORT_DIR = './assets/app-store-screenshots/';

export const DEFAULT_STATE = {
  version: 3,
  font: 'modern',
  headlineWeight: 800,
  headlineSize: 136,
  letterSpacing: -0.03, // em
  headlineColor: '#FFFFFF',
  background: 'violet',
  customBg: false,
  customFrom: '#0B0714',
  customTo: '#180D2B',
  customGlow: '#7C3AED',
  texture: 'mesh',
  textureStrength: 70,
  finish: 'midnight',
  shadow: true,
  glow: true,
  showCallouts: true,
  ringPopScale: 1.18, // Frame 3: how much the native Analytics ring is enlarged over the phone
  phoneScale: 100, // % of a 1000px-wide iPhone frame
  topPadding: 190, // canvas top to headline
  bottomPadding: 110, // phone bottom to canvas bottom (negative lets the phone bleed off)
  exportDir: DEFAULT_EXPORT_DIR,
  exportMode: 'disk',
  frames: [
    { id: 'hook', name: 'The Hook', screen: 'home', headline: 'Break The Habit' },
    { id: 'panic', name: 'Panic Button', screen: 'panic', headline: 'Instant Panic Button' },
    { id: 'progress', name: 'Streak & Progress', screen: 'progress', headline: 'Track Your Streak' },
    { id: 'library', name: 'Sound & Wellness', screen: 'library', headline: 'Guided Urge Relief' },
    { id: 'nail-progress', name: 'Nail Progress', screen: 'nails', headline: 'Watch Your Progress' },
  ],
};
