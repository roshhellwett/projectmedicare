const { createClient } = require('@supabase/supabase-js');
const medicines = require('./apps/frontend/src/data/medicines.json');
const rates = require('./apps/frontend/src/data/rates.json');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Need to read the anon key from .env.local
const fs = require('fs');
const env = fs.readFileSync('./apps/frontend/.env.local', 'utf-8');
const anonKeyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);
const serviceKeyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/);
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);

const url = urlMatch ? urlMatch[1].trim() : 'http://127.0.0.1:54321';
const key = serviceKeyMatch ? serviceKeyMatch[1].trim() : (anonKeyMatch ? anonKeyMatch[1].trim() : '');

const supabase = createClient(url, key);

async function seed() {
  console.log(`Seeding ${medicines.length} medicines...`);
  // Insert in chunks of 500
  for (let i = 0; i < medicines.length; i += 500) {
    const chunk = medicines.slice(i, i + 500);
    const { error } = await supabase.from('medicines').upsert(chunk, { onConflict: 'id' });
    if (error) console.error('Error inserting medicines:', error);
  }

  console.log(`Seeding ${rates.length} rates...`);
  for (let i = 0; i < rates.length; i += 500) {
    const chunk = rates.slice(i, i + 500);
    const { error } = await supabase.from('patient_rates').upsert(chunk, { onConflict: 'id' });
    if (error) console.error('Error inserting rates:', error);
  }
  
  console.log('Done seeding.');
}

seed().catch(console.error);
