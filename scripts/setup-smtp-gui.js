const { chromium } = require('@playwright/test');
const readline = require('readline');

const PROJECT_REF = 'gqroacvjeiexocovjxqo';
const SETTINGS_URL = `https://supabase.com/dashboard/project/${PROJECT_REF}/settings/auth`;

const CONFIG = {
    senderEmail: 'noreply-portfoliosis@boone51.com',
    senderName: 'Portfoliosis',
    host: 'smtp.hostinger.com',
    port: '465',
    username: 'noreply-portfoliosis@boone51.com',
};

async function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }));
}

(async () => {
    console.log('\n🚀 Starting Supabase SMTP Setup Automation...');
    console.log('-----------------------------------------------');

    // 1. Get Password
    const password = await askQuestion('🔑 Please enter the Hostinger Email Password: ');
    if (!password) {
        console.error('❌ Password is required.');
        process.exit(1);
    }

    console.log('\n🌐 Launching Browser...');
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    // 2. Go to Settings
    console.log('📍 Navigating to Supabase Auth Settings...');
    await page.goto(SETTINGS_URL);

    // 3. Handle Login
    if (page.url().includes('login') || page.url().includes('sign-in')) {
        console.log('⚠️  You are not logged in.');
        console.log('👉 Please LOG IN manually in the browser window.');
        console.log('⏳ Waiting for you to reach the dashboard...');

        // Wait until we leave the login page and land on dashboard or settings
        await page.waitForURL((url) => url.toString().includes('/project/') && !url.toString().includes('login'), { timeout: 0 });
        console.log('✅ Login detected! Proceeding...');

        // Ensure we are back on the target settings page (in case login redirected elsewhere)
        if (!page.url().includes('settings/auth')) {
            await page.goto(SETTINGS_URL);
        }
    }

    // 4. Fill SMTP Form
    console.log('📝 Locating SMTP Settings form...');

    // Wait for the specific section
    try {
        // Supabase UI can be complex, look for text
        await page.waitForSelector('text=SMTP Settings', { timeout: 30000 });
    } catch (e) {
        console.log('❌ Could not find "SMTP Settings" section. Please scroll to it manually.');
    }

    console.log('⚡ Filling form details...');

    // Helper to fill by label text (Supabase uses accessible labels usually)
    const fillByLabel = async (labelText, value) => {
        try {
            const input = page.getByLabel(labelText).first();
            await input.fill(value);
        } catch (e) {
            // Fallback: try finding by placeholder or nearby text
            console.log(`⚠️  Could not auto-fill "${labelText}". You might need to fill this manually.`);
        }
    };

    // Enable Toggle if needed (heuristic)
    const toggle = page.getByRole('switch', { name: /Enable Custom SMTP/i });
    if (await toggle.count() > 0) {
        if (!(await toggle.isChecked())) {
            await toggle.click();
            console.log('  - Enabled Custom SMTP toggle');
        }
    }

    // Fill fields
    await fillByLabel('Sender email', CONFIG.senderEmail);
    await fillByLabel('Sender name', CONFIG.senderName);
    await fillByLabel('Host', CONFIG.host);
    await fillByLabel('Port', CONFIG.port); // Note: Supabase might have a number input
    await fillByLabel('Username', CONFIG.username);

    // Password
    // Usually labeled "Password"
    const passwordInput = page.getByLabel('Password').first();
    await passwordInput.fill(password);
    console.log('  - Filled Password');

    // Encryption (SSL)
    // This is often a select or radio.
    // We'll try to click the SSL option if it exists
    try {
        await page.getByText('SSL', { exact: true }).click();
        console.log('  - Selected SSL');
    } catch (e) {
        console.log('⚠️  Could not select SSL. Please check manually.');
    }

    console.log('-----------------------------------------------');
    console.log('✅ Form filled!');
    console.log('👉 Please REVIEW the settings in the browser.');
    console.log('👉 Click "Save" when you are ready.');
    console.log('-----------------------------------------------');

    // Keep browser open until user closes it or terminates script
    console.log('🛑 Press Ctrl+C in this terminal to close the browser and exit.');

    // Just wait forever
    await new Promise(() => { });
})();
