const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

// Simulating browser client (using Anon Key)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
    const email = 'admin@portfoliosis.com';
    const password = 'admintest';

    console.log(`Testing login for: ${email} on ${supabaseUrl}...`);

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        console.error('❌ Login FAILED:', error.message);
        if (error.message.includes('Email not confirmed')) {
            console.log('Reason: Email is not confirmed. The createUser script might not have auto-confirmed it correctly.');
        }
        return;
    }

    console.log('✅ Login SUCCESSFUL!');
    console.log('User ID:', data.user.id);
    console.log('Session expires at:', new Date(data.session.expires_at * 1000).toLocaleString());
}

testLogin();
