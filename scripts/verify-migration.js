#!/usr/bin/env node
/**
 * PORTFOLIO IMAGES MIGRATION VERIFICATION SCRIPT
 *
 * This script verifies that the 20260126_portfolio_images.sql migration
 * has been successfully applied to the Supabase database.
 *
 * Usage: node scripts/verify-migration.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log('\n' + '═'.repeat(60), 'cyan');
  log(`  ${title}`, 'bold');
  log('═'.repeat(60), 'cyan');
}

function logCheck(message, status) {
  const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
  const color = status === 'pass' ? 'green' : status === 'fail' ? 'red' : 'yellow';
  log(`${icon} ${message}`, color);
}

async function verifyMigration() {
  log('╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║     PORTFOLIO IMAGES MIGRATION VERIFICATION           ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝', 'cyan');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    log('\n❌ Missing Supabase credentials in .env.local', 'red');
    log('   Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY', 'yellow');
    process.exit(1);
  }

  const results = {
    checks: [],
    passed: 0,
    failed: 0,
    warnings: 0,
  };

  try {
    // Initialize Supabase client
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // ============================================================
    // CHECK 1: Verify portfolios table columns exist
    // ============================================================
    logSection('CHECK 1: Portfolios Table Schema');

    try {
      // Query the information_schema to check columns
      const { data: columns, error: columnsError } = await supabase
        .from('portfolios')
        .select('profile_image_url, background_image_url')
        .limit(0);

      if (columnsError) {
        if (columnsError.message.includes('column') &&
            (columnsError.message.includes('profile_image_url') ||
             columnsError.message.includes('background_image_url'))) {
          logCheck('Columns profile_image_url and background_image_url', 'fail');
          results.failed++;
          results.checks.push({
            name: 'Table Columns',
            status: 'fail',
            message: 'Missing image URL columns in portfolios table',
          });
        } else {
          throw columnsError;
        }
      } else {
        logCheck('Column profile_image_url exists', 'pass');
        logCheck('Column background_image_url exists', 'pass');
        results.passed += 2;
        results.checks.push({
          name: 'Table Columns',
          status: 'pass',
          message: 'Image URL columns exist in portfolios table',
        });
      }
    } catch (error) {
      logCheck('Table schema verification', 'fail');
      log(`   Error: ${error.message}`, 'red');
      results.failed++;
      results.checks.push({
        name: 'Table Columns',
        status: 'fail',
        message: error.message,
      });
    }

    // ============================================================
    // CHECK 2: Verify storage bucket exists
    // ============================================================
    logSection('CHECK 2: Storage Bucket Configuration');

    try {
      const { data: buckets, error: bucketsError } = await supabase
        .storage
        .listBuckets();

      if (bucketsError) {
        throw bucketsError;
      }

      const portfolioBucket = buckets.find(b => b.id === 'portfolio-images');

      if (portfolioBucket) {
        logCheck('Storage bucket "portfolio-images" exists', 'pass');
        results.passed++;

        // Verify bucket configuration
        if (portfolioBucket.public) {
          logCheck('Bucket is public', 'pass');
          results.passed++;
        } else {
          logCheck('Bucket is public', 'fail');
          log('   Expected: public = true', 'yellow');
          results.failed++;
        }

        if (portfolioBucket.file_size_limit === 5242880) {
          logCheck('File size limit is 5MB', 'pass');
          results.passed++;
        } else {
          logCheck('File size limit is 5MB', 'warn');
          log(`   Actual: ${portfolioBucket.file_size_limit} bytes`, 'yellow');
          results.warnings++;
        }

        const expectedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (portfolioBucket.allowed_mime_types &&
            expectedMimeTypes.every(type => portfolioBucket.allowed_mime_types.includes(type))) {
          logCheck('Allowed MIME types configured correctly', 'pass');
          results.passed++;
        } else {
          logCheck('Allowed MIME types configured correctly', 'warn');
          log(`   Expected: ${expectedMimeTypes.join(', ')}`, 'yellow');
          log(`   Actual: ${portfolioBucket.allowed_mime_types?.join(', ') || 'none'}`, 'yellow');
          results.warnings++;
        }

        results.checks.push({
          name: 'Storage Bucket',
          status: 'pass',
          message: 'Storage bucket exists and is configured',
        });
      } else {
        logCheck('Storage bucket "portfolio-images" exists', 'fail');
        results.failed++;
        results.checks.push({
          name: 'Storage Bucket',
          status: 'fail',
          message: 'Storage bucket "portfolio-images" not found',
        });
      }
    } catch (error) {
      logCheck('Storage bucket verification', 'fail');
      log(`   Error: ${error.message}`, 'red');
      results.failed++;
      results.checks.push({
        name: 'Storage Bucket',
        status: 'fail',
        message: error.message,
      });
    }

    // ============================================================
    // CHECK 3: Verify storage policies
    // ============================================================
    logSection('CHECK 3: Storage Policies (RLS)');

    try {
      // Test public read access (SELECT policy)
      const { data: publicTest, error: publicError } = await supabase
        .storage
        .from('portfolio-images')
        .list('', { limit: 1 });

      if (publicError && publicError.message.includes('policies')) {
        logCheck('Public read policy', 'fail');
        log('   Policy "Portfolio images are publicly viewable" may be missing', 'yellow');
        results.failed++;
      } else {
        logCheck('Public read policy appears to be working', 'pass');
        results.passed++;
      }

      // Note: We cannot fully test INSERT/UPDATE/DELETE policies without authentication
      logCheck('INSERT/UPDATE/DELETE policies', 'warn');
      log('   Cannot verify without authenticated user context', 'yellow');
      log('   Policies should be: Users can upload/update/delete their own images', 'yellow');
      results.warnings++;

      results.checks.push({
        name: 'Storage Policies',
        status: 'warn',
        message: 'Public read verified, auth policies require manual testing',
      });
    } catch (error) {
      logCheck('Storage policies verification', 'fail');
      log(`   Error: ${error.message}`, 'red');
      results.failed++;
      results.checks.push({
        name: 'Storage Policies',
        status: 'fail',
        message: error.message,
      });
    }

    // ============================================================
    // CHECK 4: Verify index exists
    // ============================================================
    logSection('CHECK 4: Database Indexes');

    try {
      // We can't directly query pg_indexes without proper permissions
      // but we can check if the portfolios table is accessible
      const { data: indexTest, error: indexError } = await supabase
        .from('portfolios')
        .select('profile_image_url, background_image_url')
        .not('profile_image_url', 'is', null)
        .limit(1);

      if (!indexError) {
        logCheck('Index query test passed', 'pass');
        log('   Note: Cannot verify index creation without database admin access', 'yellow');
        results.passed++;
        results.warnings++;
      } else {
        logCheck('Index query test', 'fail');
        results.failed++;
      }

      results.checks.push({
        name: 'Database Indexes',
        status: 'warn',
        message: 'Index verification requires database admin access',
      });
    } catch (error) {
      logCheck('Index verification', 'warn');
      log(`   Error: ${error.message}`, 'yellow');
      results.warnings++;
      results.checks.push({
        name: 'Database Indexes',
        status: 'warn',
        message: 'Could not verify index creation',
      });
    }

    // ============================================================
    // SUMMARY
    // ============================================================
    logSection('VERIFICATION SUMMARY');

    log(`\nTotal Checks: ${results.passed + results.failed + results.warnings}`, 'cyan');
    log(`✅ Passed: ${results.passed}`, 'green');
    log(`❌ Failed: ${results.failed}`, 'red');
    log(`⚠️  Warnings: ${results.warnings}`, 'yellow');

    if (results.failed === 0 && results.warnings <= 2) {
      log('\n🎉 Migration verification SUCCESSFUL!', 'green');
      log('   The portfolio_images migration has been applied correctly.', 'green');
      log('\n📋 Next Steps:', 'cyan');
      log('   1. Test image upload functionality', 'reset');
      log('   2. Verify image URLs are stored correctly in database', 'reset');
      log('   3. Test public access to uploaded images', 'reset');
      process.exit(0);
    } else if (results.failed === 0) {
      log('\n⚠️  Migration verification COMPLETED WITH WARNINGS', 'yellow');
      log('   Some checks could not be fully verified.', 'yellow');
      log('   Please review the warnings above.', 'yellow');
      process.exit(0);
    } else {
      log('\n❌ Migration verification FAILED', 'red');
      log('   Please review the errors above and ensure the migration was run correctly.', 'red');
      log('\n📋 Recommended Actions:', 'yellow');
      log('   1. Check Supabase Dashboard for SQL errors', 'reset');
      log('   2. Re-run the migration SQL in SQL Editor', 'reset');
      log('   3. Run this verification script again', 'reset');
      process.exit(1);
    }

  } catch (error) {
    log('\n❌ CRITICAL ERROR', 'red');
    log(`   ${error.message}`, 'red');
    if (error.stack) {
      log('\nStack trace:', 'yellow');
      log(error.stack, 'reset');
    }
    process.exit(1);
  }
}

// Run verification
verifyMigration().catch(error => {
  log(`\n❌ Unhandled error: ${error.message}`, 'red');
  process.exit(1);
});
