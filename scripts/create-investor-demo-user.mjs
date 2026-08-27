/**
 * Creates millie@app.com after deleting any existing user in Supabase Dashboard.
 * Requires Confirm email = OFF in Auth settings.
 *
 * Usage (from updated-Nayl):
 *   node scripts/create-investor-demo-user.mjs
 */
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../.env');

function loadEnv() {
  if (!existsSync(envPath)) {
    throw new Error('Missing .env — copy .env.example and add Supabase keys.');
  }
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
const ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const EMAIL = 'millie@app.com';
const PASSWORD = 'Millie123';

if (!SUPABASE_URL || !ANON_KEY) {
  console.error('Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

async function signUp() {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      apikey: ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.msg || data.error_description || JSON.stringify(data));
  }
  return data;
}

async function signIn() {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      apikey: ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.msg || data.error_description || JSON.stringify(data));
  }
  return data;
}

console.log(`Creating ${EMAIL} (delete existing user in Dashboard first if needed)...`);
try {
  const signup = await signUp();
  console.log('Sign-up OK. User id:', signup.user?.id ?? signup.id);
} catch (error) {
  console.warn('Sign-up failed:', error.message);
  console.warn('If user already exists, delete them in Authentication → Users and retry.');
  process.exit(1);
}

try {
  const session = await signIn();
  console.log('Sign-in OK. Millie can log in from the app.');
  console.log('User id:', session.user?.id);
} catch (error) {
  console.error('Sign-in still failed:', error.message);
  console.error('Run the SQL in supabase/investor-demo-david.sql or delete + recreate the user.');
  process.exit(1);
}
