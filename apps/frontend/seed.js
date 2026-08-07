const { createClient } = require('@supabase/supabase-js');
const medicines = require('./src/data/medicines.json');
const rates = require('./src/data/rates.json');

const url = 'http://127.0.0.1:54321';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(url, key);

async function seed() {
  console.log(`Seeding ${medicines.length} medicines...`);
  for (let i = 0; i < medicines.length; i += 500) {
    const chunk = medicines.slice(i, i + 500);
    const { error } = await supabase.from('medicines').upsert(chunk, { onConflict: 'id' });
    if (error) console.error('Error inserting medicines:', error);
  }

  console.log(`Seeding ${rates.length} rates...`);
  for (let i = 0; i < rates.length; i += 500) {
    const chunk = rates.slice(i, i + 500).map(r => ({ ...r, jm_rate: r.jm_rate == null ? '' : String(r.jm_rate) }));
    const { error } = await supabase.from('patient_rates').upsert(chunk, { onConflict: 'id' });
    if (error) console.error('Error inserting rates:', error);
  }
  
  console.log('Done seeding.');
}

seed().catch(console.error);
