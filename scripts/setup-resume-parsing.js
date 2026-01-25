const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const appDir = path.join(rootDir, 'app');
const actionsDir = path.join(appDir, 'actions');

// 1. Create Server Action
if (!fs.existsSync(actionsDir)) fs.mkdirSync(actionsDir);

const actionContent = `'use server';

import { parseResume } from '@/lib/parsers';
import { ParseResult } from '@/lib/parsers/types';

export async function parseResumeAction(formData: FormData): Promise<ParseResult> {
  try {
    const file = formData.get('file') as File;
    
    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    try {
      const text = await parseResume(file);
      
      return {
        success: true,
        data: {
          text,
          metadata: {
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
          }
        }
      };
    } catch (e: any) {
      console.error('Parse error:', e);
      return { success: false, error: e.message || 'Failed to extract text from file' };
    }

  } catch (error: any) {
    console.error('Server action error:', error);
    return { success: false, error: error.message || 'Internal server error' };
  }
}
`;

fs.writeFileSync(path.join(actionsDir, 'parse-resume.ts'), actionContent);
console.log('✅ Created app/actions/parse-resume.ts');

// 2. Update page.tsx
const pagePath = path.join(appDir, '(dashboard)/dashboard/portfolios/new/page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');

// Add import
if (!pageContent.includes('parseResumeAction')) {
  pageContent = pageContent.replace(
    "import { createBrowserClient } from '@/lib/db/supabase';",
    "import { createBrowserClient } from '@/lib/db/supabase';\nimport { parseResumeAction } from '@/app/actions/parse-resume';"
  );
}

// Add parsing logic
const uploadLogic = `
      const { error: uploadError } = await supabase.storage
        .from('portfolios')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      // Parse resume text
      const formData = new FormData();
      formData.append('file', file);
      const parseResult = await parseResumeAction(formData);
      
      let parsedText = '';
      if (parseResult.success && parseResult.data) {
        parsedText = parseResult.data.text;
      } else {
        console.warn('Resume parsing failed:', parseResult.error);
        // We continue even if parsing fails, but maybe log it
      }
`;

if (!pageContent.includes('parseResumeAction(formData)')) {
  pageContent = pageContent.replace(
    /const { error: uploadError }[\s\S]*?if \(uploadError\) {\s*throw uploadError;\s*}/,
    uploadLogic
  );
  
  // Add text to insert
  pageContent = pageContent.replace(
    /resume_data: {\s*file_path: fileName,\s*file_name: file.name,\s*uploaded_at: new Date\(\)\,.toISOString\(\),\s*}/,
    `resume_data: {
            file_path: fileName,
            file_name: file.name,
            uploaded_at: new Date().toISOString(),
            text: parsedText,
          },`
  );
}

fs.writeFileSync(pagePath, pageContent);
console.log('✅ Updated dashboard/portfolios/new/page.tsx to use parser');
