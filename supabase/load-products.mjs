#!/usr/bin/env node
// supabase/load-products.mjs
//
// Carga products_data.csv en la tabla products de Supabase.
//
// Uso:
//   node supabase/load-products.mjs --local          → inserta vía JS client (local)
//   node supabase/load-products.mjs --remote         → genera SQL + ejecuta vía Supabase CLI
//   node supabase/load-products.mjs --remote --sql   → solo genera supabase/products_import.sql
//
// Variables requeridas en .env.local:
//   --local  → SUPABASE_LOCAL_SERVICE_ROLE_KEY   (de: npx supabase status)
//   --remote → SUPABASE_REMOTE_URL               (del dashboard)

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ── ENV ───────────────────────────────────────────────────────────────────────

function loadEnv() {
  try {
    const content = readFileSync(resolve(ROOT, '.env.local'), 'utf8');
    return Object.fromEntries(
      content
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith('#'))
        .map((l) => {
          const idx = l.indexOf('=');
          return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
        }),
    );
  } catch {
    return {};
  }
}

// ── CSV PARSER ────────────────────────────────────────────────────────────────

function parseCSV(text) {
  const lines = text.replace(/\r\n?/g, '\n').split('\n');

  function parseLine(line) {
    const fields = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        fields.push(current); current = '';
      } else {
        current += ch;
      }
    }
    fields.push(current);
    return fields;
  }

  const headers = parseLine(lines[0]).map((h) => h.trim()).filter(Boolean);

  return lines
    .slice(1)
    .filter((l) => l.trim())
    .map((line) => {
      const values = parseLine(line);
      return Object.fromEntries(
        headers.map((h, i) => {
          const v = (values[i] ?? '').trim();
          return [h, v === '' ? null : v];
        }),
      );
    });
}

// ── MAPEO DE CATEGORÍAS ───────────────────────────────────────────────────────

const CATEGORY_MAP = {
  'Budín integral':   'budin_integral',
  'Budín avena':      'budin_avena',
  'Pepas':            'pepas',
  'Cookies':          'cookies',
  'Cookies XL':       'cookies_xl',
  'Galletitas':       'galletitas',
  'Alfajores':        'alfajores',
  'Pan':              'pan',
  'Talitas':          'talitas',
  'Galleta marinera': 'galleta_marinera',
  'Torta':            'torta',
};

// ── TRANSFORMACIÓN ────────────────────────────────────────────────────────────

function toNum(val) {
  if (val === null || val === undefined) return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
}

function resolvePresentation(rawUnit, rawGrams) {
  const grams = toNum(rawGrams);
  const unit  = toNum(rawUnit);
  if (grams !== null) return { unit: 1, grams };
  if (unit  !== null) return { unit, grams: null };
  return { unit: 1, grams: null };
}

function transform(rows) {
  const products = [];
  const errors   = [];

  rows.forEach((row, i) => {
    const lineNum = i + 2;
    const product_category = CATEGORY_MAP[row.product_category];
    if (!product_category) {
      errors.push(`Línea ${lineNum}: categoría desconocida → "${row.product_category}"`);
      return;
    }
    if (!row.variety) {
      errors.push(`Línea ${lineNum}: campo "variety" vacío`);
      return;
    }
    const { unit, grams }  = resolvePresentation(row.unit, row.grams);
    const retail_price     = toNum(row.retail_price)    ?? 0;
    const wholesale_price  = toNum(row.wholesale_price) ?? 0;
    products.push({ variety: row.variety, product_category, unit, grams, retail_price, wholesale_price, is_active: true });
  });

  return { products, errors };
}

// ── SQL GENERATOR ─────────────────────────────────────────────────────────────

function generateSQL(products) {
  const esc = (s) => s.replace(/'/g, "''");
  const lit = (v) => (v === null ? 'NULL' : String(v));

  const values = products
    .map((p) =>
      `  ('${esc(p.variety)}', '${p.product_category}', ${p.unit}, ${lit(p.grams)}, ${p.retail_price}, ${p.wholesale_price}, true)`,
    )
    .join(',\n');

  return (
    `-- Generado por load-products.mjs — ${new Date().toISOString()}\n` +
    `INSERT INTO public.products (variety, product_category, unit, grams, retail_price, wholesale_price, is_active)\nVALUES\n${values};\n`
  );
}

// ── INSERCIÓN LOCAL (JS client) ───────────────────────────────────────────────

async function insertLocal(products, supabaseUrl, serviceRoleKey) {
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
  const { error } = await supabase.from('products').insert(products);
  if (error) throw new Error(error.message);
}

// ── INSERCIÓN REMOTA (Supabase CLI) ──────────────────────────────────────────

function insertRemoteViaCLI(products) {
  const sqlPath = resolve(__dirname, 'products_import.sql');
  writeFileSync(sqlPath, generateSQL(products), 'utf8');
  console.log(`SQL escrito en: supabase/products_import.sql`);

  try {
    execSync(`npx supabase db execute --file supabase/products_import.sql --linked`, {
      stdio: 'inherit',
      cwd: ROOT,
    });
  } catch {
    console.error('\nLa ejecución automática falló. Opciones para continuar:');
    console.error('  1. npx supabase db execute --file supabase/products_import.sql --linked');
    console.error('  2. Pegá el contenido de supabase/products_import.sql en el SQL Editor del dashboard.');
    process.exit(1);
  }
}

// ── MAIN ──────────────────────────────────────────────────────────────────────

async function main() {
  const args     = process.argv.slice(2);
  const isLocal  = args.includes('--local');
  const isRemote = args.includes('--remote');
  const sqlOnly  = args.includes('--sql');

  if (!isLocal && !isRemote) {
    console.error('Uso: node supabase/load-products.mjs --local | --remote [--sql]');
    process.exit(1);
  }

  const env = loadEnv();

  const csvContent = readFileSync(resolve(__dirname, 'products_data.csv'), 'utf8');
  const { products, errors } = transform(parseCSV(csvContent));

  if (errors.length) {
    console.error('\nErrores de validación:');
    errors.forEach((e) => console.error(' ', e));
    process.exit(1);
  }

  const target = isLocal ? 'LOCAL' : 'REMOTE';
  console.log(`\n${products.length} productos para insertar en ${target}...`);

  if (isLocal) {
    const supabaseUrl    = env.SUPABASE_LOCAL_URL ?? 'http://127.0.0.1:54321';
    const serviceRoleKey = env.SUPABASE_LOCAL_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      console.error('Falta SUPABASE_LOCAL_SERVICE_ROLE_KEY en .env.local');
      console.error('Obtenerla con: npx supabase status');
      process.exit(1);
    }
    await insertLocal(products, supabaseUrl, serviceRoleKey);

  } else {
    if (sqlOnly) {
      const sqlPath = resolve(__dirname, 'products_import.sql');
      writeFileSync(sqlPath, generateSQL(products), 'utf8');
      console.log(`SQL generado en: supabase/products_import.sql`);
      console.log('Ejecutalo con: npx supabase db execute --file supabase/products_import.sql --linked');
      return;
    }
    insertRemoteViaCLI(products);
  }

  console.log(`${products.length} productos insertados correctamente.\n`);
}

main().catch((err) => {
  console.error('Error inesperado:', err);
  process.exit(1);
});
