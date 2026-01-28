#!/usr/bin/env node
/**
 * Run Portfolio Images Migration
 *
 * This script runs the 20260126_portfolio_images.sql migration
 * against your Supabase database.
 */

const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function runMigration() {
  log('╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║   PORTFOLIO IMAGES MIGRATION RUNNER                   ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝', 'cyan');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    log('❌ Missing Supabase credentials in .env.local', 'red');
    log('   Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY', 'yellow');
    process.exit(1);
  }

  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260126_portfolio_images.sql');

  try {
    log('\n📂 Reading migration file...', 'cyan');
    const migrationSQL = await fs.readFile(migrationPath, 'utf8');
    log('✅ Migration file loaded', 'green');

    log('\n📋 MANUAL MIGRATION REQUIRED', 'yellow');
    log('   Supabase does not support SQL execution via REST API for security.', 'yellow');
    log('   Please run the migration manually:', 'yellow');
    log('\n   1. Open Supabase Dashboard: https://supabase.com/dashboard', 'cyan');
    log('   2. Select your project', 'cyan');
    log('   3. Go to SQL Editor (left sidebar)', 'cyan');
    log('   4. Click "New query"', 'cyan');
    log('   5. Copy and paste the SQL below:', 'cyan');
    log('\n' + '='.repeat(60), 'cyan');
    log(migrationSQL, 'reset');
    log('='.repeat(60) + '\n', 'cyan');
    log('   6. Click "Run" button', 'cyan');
    log('   7. Verify success (no errors)\n', 'cyan');

    log('💡 The migration will:', 'yellow');
    log('   - Add profile_image_url and background_image_url columns to portfolios table', 'reset');
    log('   - Create portfolio-images storage bucket', 'reset');
    log('   - Set up storage policies for authenticated users\n', 'reset');

  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

runMigration();
