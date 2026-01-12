#!/usr/bin/env node
/**
 * Test Supabase Connection
 *
 * Tests your Supabase configuration and connection.
 * Checks:
 * - .env.local exists
 * - Credentials are valid
 * - Can connect to Supabase
 * - Tables exist
 * - Templates are seeded
 *
 * Usage: node scripts/test-supabase.js
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(test, passed, message = '') {
  const icon = passed ? '✅' : '❌';
  const color = passed ? 'green' : 'red';
  log(`${icon} ${test}${message ? ': ' + message : ''}`, color);
}

async function test1_EnvFileExists() {
  const envPath = path.join(__dirname, '..', '.env.local');
  const exists = fs.existsSync(envPath);
  logTest('Environment file exists', exists, exists ? envPath : 'Not found');
  return exists;
}

async function test2_EnvVariables() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const hasUrl = !!url;
  const hasAnonKey = !!anonKey;
  const hasServiceKey = !!serviceKey;

  logTest('NEXT_PUBLIC_SUPABASE_URL', hasUrl, url ? url.substring(0, 30) + '...' : 'Missing');
  logTest('NEXT_PUBLIC_SUPABASE_ANON_KEY', hasAnonKey, hasAnonKey ? 'Set' : 'Missing');
  logTest('SUPABASE_SERVICE_ROLE_KEY', hasServiceKey, hasServiceKey ? 'Set' : 'Missing');

  return hasUrl && hasAnonKey && hasServiceKey;
}

async function test3_Connection() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  try {
    const response = await fetch(`${url}/rest/v1/`, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
      },
    });

    const connected = response.ok || response.status === 404; // 404 is expected for root
    logTest('Can connect to Supabase', connected, connected ? 'Connected!' : `Status: ${response.status}`);
    return connected;
  } catch (error) {
    logTest('Can connect to Supabase', false, error.message);
    return false;
  }
}

async function test4_Tables() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const tables = ['portfolios', 'ai_jobs', 'portfolio_versions', 'templates', 'portfolio_analytics'];

  let allExist = true;

  for (const table of tables) {
    try {
      const response = await fetch(`${url}/rest/v1/${table}?limit=0`, {
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
        },
      });

      const exists = response.ok;
      logTest(`Table '${table}'`, exists);
      if (!exists) allExist = false;
    } catch (error) {
      logTest(`Table '${table}'`, false, error.message);
      allExist = false;
    }
  }

  return allExist;
}

async function test5_Templates() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  try {
    const response = await fetch(`${url}/rest/v1/templates`, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
      },
    });

    if (!response.ok) {
      logTest('Templates seeded', false, 'Table not accessible');
      return false;
    }

    const templates = await response.json();
    const hasTemplates = templates && templates.length >= 5;
    logTest('Templates seeded', hasTemplates, hasTemplates ? `${templates.length} templates found` : 'No templates');
    return hasTemplates;
  } catch (error) {
    logTest('Templates seeded', false, error.message);
    return false;
  }
}

async function test6_Storage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  try {
    const response = await fetch(`${url}/storage/v1/bucket/portfolios`, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
      },
    });

    const exists = response.ok;
    logTest('Storage bucket exists', exists, exists ? 'Bucket "portfolios" ready' : 'Bucket not found');
    return exists;
  } catch (error) {
    logTest('Storage bucket exists', false, error.message);
    return false;
  }
}

async function main() {
  log('╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║     PORTFOLIOSIS - SUPABASE CONNECTION TEST          ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝', 'cyan');
  log('');

  const results = [];

  log('🔍 Running tests...\n', 'bright');

  results.push(await test1_EnvFileExists());
  log('');

  results.push(await test2_EnvVariables());
  log('');

  results.push(await test3_Connection());
  log('');

  results.push(await test4_Tables());
  log('');

  results.push(await test5_Templates());
  log('');

  results.push(await test6_Storage());
  log('');

  // Summary
  const passed = results.filter(r => r).length;
  const total = results.length;

  log('═'.repeat(60), 'cyan');
  if (passed === total) {
    log(`\n🎉 ALL TESTS PASSED (${passed}/${total})`, 'green');
    log('\n✅ Supabase is fully configured and ready!', 'green');
    log('\n🚀 You can now run: npm run dev\n', 'bright');
  } else {
    log(`\n⚠️  SOME TESTS FAILED (${passed}/${total})`, 'yellow');
    log('\n📋 Next steps:', 'bright');
    if (!results[0]) log('   - Run: node scripts/setup-supabase.js');
    if (!results[1]) log('   - Check your .env.local file has all credentials');
    if (!results[2]) log('   - Verify your Supabase URL and API keys are correct');
    if (!results[3]) log('   - Run the database migration in Supabase SQL Editor');
    if (!results[4]) log('   - Check that the migration created the templates table');
    if (!results[5]) log('   - Create the "portfolios" storage bucket in Supabase dashboard');
    log('');
  }
}

main().catch(error => {
  log(`\n❌ Error: ${error.message}`, 'red');
  process.exit(1);
});
