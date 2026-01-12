#!/usr/bin/env node
/**
 * Copy Migration SQL to Clipboard
 *
 * Copies the entire database migration SQL to your clipboard
 * so you can easily paste it into Supabase SQL Editor.
 *
 * Usage: node scripts/copy-migration-sql.js
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function main() {
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260111_initial_schema.sql');

  try {
    // Read the migration file
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Try to copy to clipboard (Windows)
    const clipCommand = `echo ${sql.replace(/"/g, '\\"')} | clip`;

    exec('clip', (error, stdout, stderr) => {
      if (error) {
        // Clipboard copy failed, just show the file path
        log('\n📋 Migration SQL File Location:', 'cyan');
        log(migrationPath, 'yellow');
        log('\n📝 Manual Steps:', 'cyan');
        log('1. Open the file above in your text editor');
        log('2. Select all (Ctrl+A) and copy (Ctrl+C)');
        log('3. Go to Supabase Dashboard > SQL Editor');
        log('4. Click "New query"');
        log('5. Paste (Ctrl+V)');
        log('6. Click "Run"\n');
      } else {
        // Write SQL to clipboard
        require('child_process').spawn('clip').stdin.end(sql);
        log('\n✅ Migration SQL copied to clipboard!', 'green');
        log('\n📝 Next Steps:', 'cyan');
        log('1. Go to Supabase Dashboard > SQL Editor');
        log('2. Click "New query"');
        log('3. Paste (Ctrl+V)');
        log('4. Click "Run"\n');
      }
    });

    // Also show file path
    log('📁 File Location:', 'cyan');
    log(migrationPath, 'yellow');

    // Show a preview
    log('\n📄 SQL Preview (first 500 chars):', 'cyan');
    log(sql.substring(0, 500) + '...', 'reset');
    log(`\n(Total length: ${sql.length} characters, ${sql.split('\n').length} lines)\n`);

  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

main();
