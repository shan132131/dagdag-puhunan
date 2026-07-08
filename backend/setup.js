#!/usr/bin/env node
// ============================================================
// DAGDAG PUHUNAN — Setup Verification Script
// Run: node scripts/setup.js
// ============================================================
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const GREEN  = '\x1b[32m';
const RED    = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET  = '\x1b[0m';
const BOLD   = '\x1b[1m';

const ok   = (msg) => console.log(`${GREEN}✓${RESET} ${msg}`);
const fail = (msg) => console.log(`${RED}✗${RESET} ${msg}`);
const warn = (msg) => console.log(`${YELLOW}⚠${RESET} ${msg}`);

console.log(`\n${BOLD}DAGDAG PUHUNAN, ZERO INTEREST${RESET}`);
console.log(`Setup Verification\n${'─'.repeat(40)}`);

let allGood = true;

// ── Check required files ──────────────────────────────────────
const requiredFiles = [
  ['.env',           'Environment variables (copy from .env.example)'],
  ['src/App.jsx',    'Main React application'],
  ['src/main.jsx',   'React entry point'],
  ['index.html',     'HTML entry point'],
  ['vite.config.js', 'Vite configuration'],
  ['database/schema.sql', 'Database schema'],
  ['database/seed.sql',   'Seed data'],
];

console.log(`\n${BOLD}Files:${RESET}`);
for (const [file, desc] of requiredFiles) {
  if (existsSync(resolve(file))) {
    ok(`${file} — ${desc}`);
  } else {
    fail(`${file} MISSING — ${desc}`);
    allGood = false;
  }
}

// ── Check .env variables ─────────────────────────────────────
console.log(`\n${BOLD}Environment Variables:${RESET}`);
const required_env = [
  ['VITE_SUPABASE_URL',      'Supabase project URL'],
  ['VITE_SUPABASE_ANON_KEY', 'Supabase anon public key'],
  ['JWT_SECRET',             'JWT signing secret (min 32 chars)'],
];

if (existsSync('.env')) {
  const envContent = readFileSync('.env', 'utf-8');
  for (const [key, desc] of required_env) {
    const match = envContent.match(new RegExp(`^${key}=(.+)`, 'm'));
    if (match && match[1] && !match[1].startsWith('YOUR_') && !match[1].startsWith('eyJh_')) {
      ok(`${key} — ${desc}`);
    } else if (match && match[1]) {
      warn(`${key} — appears to be a placeholder, update it`);
    } else {
      fail(`${key} — missing in .env — ${desc}`);
      allGood = false;
    }
  }
} else {
  fail('.env file not found — run: cp .env.example .env');
  allGood = false;
}

// ── Check node_modules ────────────────────────────────────────
console.log(`\n${BOLD}Dependencies:${RESET}`);
if (existsSync('node_modules')) {
  ok('Frontend node_modules installed');
} else {
  fail('Frontend node_modules missing — run: npm install');
  allGood = false;
}

if (existsSync('server/node_modules')) {
  ok('Server node_modules installed');
} else {
  warn('Server node_modules not installed — run: cd server && npm install (only needed for backend)');
}

// ── Summary ───────────────────────────────────────────────────
console.log(`\n${'─'.repeat(40)}`);
if (allGood) {
  console.log(`${GREEN}${BOLD}✓ Setup complete! Run: npm run dev${RESET}\n`);
} else {
  console.log(`${RED}${BOLD}✗ Fix the issues above, then run: npm run dev${RESET}\n`);
  process.exit(1);
}
