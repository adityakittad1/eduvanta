/**
 * Copyright (c) 2026 Aditya Kittad. All Rights Reserved.
 * Eduvanta - Multi-Tenant School ERP and Digital Campus Platform
 *
 * Seed Script: Ellora Highschool 40 Verified Gallery Items
 */

const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;

// Load backend .env
const envFile = fs.readFileSync(path.resolve(__dirname, '../.env'), 'utf8');
const env = Object.fromEntries(
  envFile
    .split('\n')
    .filter(line => line.includes('=') && !line.trim().startsWith('#'))
    .map(line => {
      const idx = line.indexOf('=');
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
      return [key, val];
    })
);

const { createClient } = require('@supabase/supabase-js');
const sb = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY || env.SUPABASE_ANON_KEY);

const ELLORA_SCHOOL_ID = 'cmukd0qpd0000zytnolrlhqd3';

async function run() {
  console.log('--- Starting Ellora Highschool 40 Gallery Sync ---');

  // 1. Verify school exists
  const { data: school, error: schoolErr } = await sb
    .from('schools')
    .select('id, name, slug')
    .eq('id', ELLORA_SCHOOL_ID)
    .single();

  if (schoolErr || !school) {
    console.error('Failed to find Ellora school:', schoolErr);
    process.exit(1);
  }
  console.log(`Target School: ${school.name} (${school.id}, slug: ${school.slug})`);

  // 2. Find Principal user
  const { data: users, error: userErr } = await sb
    .from('users')
    .select('id, name, email, role')
    .eq('school_id', ELLORA_SCHOOL_ID);

  if (userErr || !users || users.length === 0) {
    console.error('Failed to find users for Ellora school:', userErr);
    process.exit(1);
  }

  const principal = users.find(u => u.role === 'PRINCIPAL') || users[0];
  console.log(`Uploader User: ${principal.name} (${principal.email}, role: ${principal.role}, id: ${principal.id})`);

  // 3. Load verified gallery dataset
  const verifiedPath = path.resolve(__dirname, 'verified-gallery-data.json');
  if (!fs.existsSync(verifiedPath)) {
    console.error('verified-gallery-data.json not found!');
    process.exit(1);
  }
  const items = JSON.parse(fs.readFileSync(verifiedPath, 'utf8'));
  console.log(`Loaded ${items.length} verified gallery items.`);

  // 4. Copy local downloaded images to frontend/public/gallery/
  const srcDir = path.resolve(__dirname, 'gallery-downloads');
  const destDir = path.resolve(__dirname, '../../frontend/public/gallery');
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const downloadedFiles = fs.readdirSync(srcDir);
  for (const f of downloadedFiles) {
    fs.copyFileSync(path.join(srcDir, f), path.join(destDir, f));
  }
  console.log(`Copied ${downloadedFiles.length} images to frontend/public/gallery/`);

  // 5. Clean up old broken/placeholder gallery items for Ellora Highschool
  const { error: delErr } = await sb
    .from('gallery_items')
    .delete()
    .eq('school_id', ELLORA_SCHOOL_ID);

  if (delErr) {
    console.warn('Warning during old item deletion:', delErr.message);
  } else {
    console.log('Cleared previous gallery items for Ellora Highschool.');
  }

  // 6. Generate deterministic CUIDs and timestamps
  const baseTime = new Date('2026-11-01T10:00:00Z').getTime();
  const dbPayload = items.map((item, index) => {
    // Generate valid 25-char cuid-like string
    const numStr = String(index + 1).padStart(2, '0');
    const id = `cgall${numStr}ellora${Math.random().toString(36).substring(2, 11)}`.slice(0, 25);
    
    // Stagger dates: 1-40 across previous months
    const dateOffsetDays = (40 - index) * 3; // every 3 days
    const itemDate = new Date(baseTime - (dateOffsetDays * 86400000)).toISOString();

    return {
      id,
      school_id: ELLORA_SCHOOL_ID,
      title: item.title,
      description: item.description,
      category: item.category,
      file_url: item.replacementUrl,
      is_public: true,
      uploaded_by_user_id: principal.id,
      created_at: itemDate
    };
  });

  // 7. Insert into Supabase gallery_items in chunks of 10
  console.log('Inserting 40 verified gallery records into Supabase...');
  for (let i = 0; i < dbPayload.length; i += 10) {
    const chunk = dbPayload.slice(i, i + 10);
    const { error: insertErr } = await sb.from('gallery_items').insert(chunk);
    if (insertErr) {
      console.error(`Chunk insert error (${i}-${i + chunk.length}):`, insertErr);
      process.exit(1);
    }
  }
  console.log('All 40 gallery items successfully inserted.');

  // 8. Verify count in database
  const { data: finalItems, error: verifyErr } = await sb
    .from('gallery_items')
    .select('id, title, category, file_url, is_public')
    .eq('school_id', ELLORA_SCHOOL_ID)
    .order('created_at', { ascending: false });

  if (verifyErr) {
    console.error('Verification query failed:', verifyErr);
  } else {
    console.log(`\nVerified Database State: Exactly ${finalItems.length} gallery items present for Ellora Highschool.`);
    
    // Group by category
    const catCounts = {};
    finalItems.forEach(fi => {
      catCounts[fi.category] = (catCounts[fi.category] || 0) + 1;
    });
    console.log('Category breakdown in database:', catCounts);
  }

  console.log('--- Sync Completed Successfully ---');
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

