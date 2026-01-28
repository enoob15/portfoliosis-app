const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service key to ensure we have permission

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function triggerEmail() {
    const email = process.argv[2];

    if (!email) {
        console.log('Usage: node scripts/trigger-verification-email.js <your-email>');
        console.log('Example: node scripts/trigger-verification-email.js test@boone51.com');
        return;
    }

    console.log(`📧 Attempting to trigger a system email to: ${email}`);
    console.log('Using Supabase URL:', supabaseUrl);

    // Technique 1: Send a Password Reset (Most reliable way to force an email without creating a new user if one exists)
    // However, if user doesn't exist, this might fail silent or error.

    // Technique 2: Invite User (Admin only). This sends an "Invite" template.
    // This is good because it definitely comes from the system.

    console.log('Step 1: Checking if user exists...');
    const { data: { users }, error: findError } = await supabase.auth.admin.listUsers();

    if (findError) {
        console.error('Error listing users:', findError.message);
        return;
    }

    const existingUser = users.find(u => u.email === email);

    if (existingUser) {
        console.log('User exists. Sending Password Reset email...');
        const { error } = await supabase.auth.admin.resetPasswordForEmail(email);
        if (error) {
            console.error('❌ Failed to send reset email:', error.message);
        } else {
            console.log('✅ Password Reset email sent!');
            console.log('👉 CHECK YOUR INBOX. If it comes from "noreply-portfoliosis@boone51.com", the SMTP setup is CORRECT.');
        }
    } else {
        console.log('User does not exist. Sending Admin Invite email...');
        const { data, error } = await supabase.auth.admin.inviteUserByEmail(email);
        if (error) {
            console.error('❌ Failed to send invite:', error.message);
        } else {
            console.log('✅ Invite email sent!');
            console.log('👉 CHECK YOUR INBOX. If it comes from "noreply-portfoliosis@boone51.com", the SMTP setup is CORRECT.');
        }
    }
}

triggerEmail();
