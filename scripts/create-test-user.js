const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestUser() {
    const email = 'admin@portfoliosis.com';
    const password = 'admintest_password_123'; // Stronger password for safety, but user asked for "test/admintest", I will stick to something similar or just log it. 
    // Actually, user said "can you go ahead and create me a test/admintest account", implying the credentials should be test/admintest or similar. 
    // Supabase usually requires 6 char password. "admintest" is 9 chars.

    console.log(`Creating user: ${email}...`);

    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password: 'admintest',
        email_confirm: true,
        user_metadata: { name: 'Test Admin' }
    });

    if (error) {
        console.error('❌ Error creating user:', error.message);
        return;
    }

    console.log('✅ User created successfully!');
    console.log('---------------------------------------------------');
    console.log('Email:    ', data.user.email);
    console.log('Password: ', 'admintest');
    console.log('ID:       ', data.user.id);
    console.log('---------------------------------------------------');
    console.log('You can now log in at /login with these credentials.');
}

createTestUser();
