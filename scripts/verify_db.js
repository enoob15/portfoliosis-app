const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function verify() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error('Missing credentials');
    return;
  }

  const supabase = createClient(url, key);
  console.log(`Connecting to ${url}...`);

  const { data, error } = await supabase.from('portfolios').select('count', { count: 'exact', head: true });

  if (error) {
    console.error('Connection failed:', error.message);
    if (error.code === '42P01') {
      console.error('Table "portfolios" does not exist. Migration needed.');
    }
  } else {
    console.log('✅ Connection successful!');
    console.log(`✅ Table "portfolios" exists (Rows: ${data?.length ?? 0})`);
  }
}

verify();
