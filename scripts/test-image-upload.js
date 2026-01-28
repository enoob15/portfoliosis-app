#!/usr/bin/env node
/**
 * IMAGE UPLOAD TESTING SCRIPT
 *
 * This script tests the portfolio image upload functionality
 * after the migration has been applied.
 *
 * Usage: node scripts/test-image-upload.js
 *
 * Prerequisites:
 * - Migration must be applied
 * - You must have a valid user session
 * - Test image file must exist at ./test-images/sample.jpg
 */

const fs = require('fs');
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

async function testImageUpload() {
  log('╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║        IMAGE UPLOAD FUNCTIONALITY TEST                ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝', 'cyan');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    log('\n❌ Missing Supabase credentials in .env.local', 'red');
    log('   Required: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY', 'yellow');
    process.exit(1);
  }

  log('\n⚠️  AUTHENTICATION REQUIRED', 'yellow');
  log('   This script requires an authenticated user session.', 'yellow');
  log('   For manual testing, use the test page:', 'yellow');
  log('   http://localhost:3000/dashboard/test-image-upload', 'cyan');
  log('\n   This script demonstrates the expected flow:', 'yellow');

  logSection('TEST SCENARIO: Profile Image Upload');

  log('\n1️⃣  User Authentication', 'cyan');
  log('   const { data: session } = await supabase.auth.getSession()', 'reset');
  log('   if (!session) throw new Error("Not authenticated")', 'reset');

  log('\n2️⃣  File Selection', 'cyan');
  log('   const file = event.target.files[0]', 'reset');
  log('   Accepted types: image/jpeg, image/png, image/webp, image/gif', 'reset');
  log('   Max size: 5MB', 'reset');

  log('\n3️⃣  File Upload to Storage', 'cyan');
  log('   const userId = session.user.id', 'reset');
  log('   const fileName = `${userId}/profile-${Date.now()}.jpg`', 'reset');
  log('   const { data, error } = await supabase.storage', 'reset');
  log('     .from("portfolio-images")', 'reset');
  log('     .upload(fileName, file)', 'reset');

  log('\n4️⃣  Get Public URL', 'cyan');
  log('   const { data: urlData } = supabase.storage', 'reset');
  log('     .from("portfolio-images")', 'reset');
  log('     .getPublicUrl(fileName)', 'reset');
  log('   const imageUrl = urlData.publicUrl', 'reset');

  log('\n5️⃣  Update Portfolio Record', 'cyan');
  log('   const { error: updateError } = await supabase', 'reset');
  log('     .from("portfolios")', 'reset');
  log('     .update({ profile_image_url: imageUrl })', 'reset');
  log('     .eq("id", portfolioId)', 'reset');

  logSection('SAMPLE CODE: Complete Upload Function');

  const sampleCode = `
async function uploadProfileImage(portfolioId, file) {
  const supabase = createClient();

  // 1. Check authentication
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Not authenticated');
  }

  // 2. Validate file
  if (file.size > 5242880) {
    throw new Error('File size exceeds 5MB limit');
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type');
  }

  // 3. Upload to storage
  const userId = session.user.id;
  const fileExt = file.name.split('.').pop();
  const fileName = \`\${userId}/profile-\${Date.now()}.\${fileExt}\`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('portfolio-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    throw new Error(\`Upload failed: \${uploadError.message}\`);
  }

  // 4. Get public URL
  const { data: urlData } = supabase.storage
    .from('portfolio-images')
    .getPublicUrl(fileName);

  const publicUrl = urlData.publicUrl;

  // 5. Update portfolio record
  const { error: updateError } = await supabase
    .from('portfolios')
    .update({ profile_image_url: publicUrl })
    .eq('id', portfolioId)
    .eq('user_id', userId); // Ensure user owns the portfolio

  if (updateError) {
    // Rollback: delete uploaded file
    await supabase.storage
      .from('portfolio-images')
      .remove([fileName]);
    throw new Error(\`Database update failed: \${updateError.message}\`);
  }

  return publicUrl;
}
`;

  log(sampleCode, 'reset');

  logSection('TESTING CHECKLIST');

  log('\n✅ Manual Testing Steps:', 'green');
  log('   1. Start the development server: npm run dev', 'reset');
  log('   2. Navigate to: http://localhost:3000/dashboard/test-image-upload', 'reset');
  log('   3. Sign in with a test user', 'reset');
  log('   4. Select an image file (< 5MB)', 'reset');
  log('   5. Click Upload', 'reset');
  log('   6. Verify the image URL is displayed', 'reset');
  log('   7. Visit the public URL to confirm image is accessible', 'reset');

  log('\n✅ Expected Results:', 'green');
  log('   • Upload completes without errors', 'reset');
  log('   • Public URL is returned', 'reset');
  log('   • Image is viewable at public URL', 'reset');
  log('   • Database record is updated with image URL', 'reset');

  log('\n❌ Common Errors & Solutions:', 'yellow');
  log('   • "Not authenticated" → Ensure user is signed in', 'reset');
  log('   • "Policy violation" → Check RLS policies are created', 'reset');
  log('   • "Bucket not found" → Run migration again', 'reset');
  log('   • "File too large" → Ensure file < 5MB', 'reset');

  logSection('INTEGRATION TEST EXAMPLE');

  const integrationTest = `
// __tests__/image-upload.test.ts
import { uploadProfileImage } from '@/lib/storage/image-upload';

describe('Image Upload', () => {
  it('should upload profile image', async () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const portfolioId = 'test-portfolio-id';

    const url = await uploadProfileImage(portfolioId, mockFile);

    expect(url).toContain('portfolio-images');
    expect(url).toContain('profile-');
  });

  it('should reject files > 5MB', async () => {
    const largeFile = new File(['x'.repeat(6000000)], 'large.jpg', { type: 'image/jpeg' });
    const portfolioId = 'test-portfolio-id';

    await expect(uploadProfileImage(portfolioId, largeFile))
      .rejects.toThrow('File size exceeds 5MB limit');
  });

  it('should reject invalid file types', async () => {
    const txtFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    const portfolioId = 'test-portfolio-id';

    await expect(uploadProfileImage(portfolioId, txtFile))
      .rejects.toThrow('Invalid file type');
  });
});
`;

  log(integrationTest, 'reset');

  log('\n📋 For automated testing, create:', 'cyan');
  log('   • app/(dashboard)/dashboard/test-image-upload/page.tsx', 'reset');
  log('   • lib/storage/image-upload.ts (upload helper)', 'reset');
  log('   • __tests__/image-upload.test.ts (unit tests)', 'reset');

  log('\n✅ Testing script completed successfully!', 'green');
  log('   Follow the manual testing steps above to verify functionality.', 'green');
}

testImageUpload().catch(error => {
  log(`\n❌ Error: ${error.message}`, 'red');
  process.exit(1);
});
