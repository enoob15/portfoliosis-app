const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.join(__dirname, '..');
const libDir = path.join(rootDir, 'lib');
const parsersDir = path.join(libDir, 'parsers');

// Ensure directories exist
if (!fs.existsSync(libDir)) fs.mkdirSync(libDir);
if (!fs.existsSync(parsersDir)) fs.mkdirSync(parsersDir);

console.log('📦 Installing dependencies...');
try {
  execSync('npm install pdf-parse mammoth', { stdio: 'inherit', cwd: rootDir });
  execSync('npm install --save-dev @types/pdf-parse', { stdio: 'inherit', cwd: rootDir });
  console.log('✅ Dependencies installed.');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error);
  process.exit(1);
}

// Create pdf-parser.ts
const pdfParserContent = `import pdf from 'pdf-parse';

export async function parsePdf(buffer: Buffer): Promise<string> {
  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF file');
  }
}
`;
fs.writeFileSync(path.join(parsersDir, 'pdf-parser.ts'), pdfParserContent);
console.log('✅ Created lib/parsers/pdf-parser.ts');

// Create docx-parser.ts
const docxParserContent = `import mammoth from 'mammoth';

export async function parseDocx(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error('Error parsing DOCX:', error);
    throw new Error('Failed to parse DOCX file');
  }
}
`;
fs.writeFileSync(path.join(parsersDir, 'docx-parser.ts'), docxParserContent);
console.log('✅ Created lib/parsers/docx-parser.ts');

// Create index.ts
const indexContent = `import { parsePdf } from './pdf-parser';
import { parseDocx } from './docx-parser';

export async function parseResume(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  
  if (file.type === 'application/pdf') {
    return parsePdf(buffer);
  } else if (
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
    file.name.endsWith('.docx')
  ) {
    return parseDocx(buffer);
  }
  
  throw new Error('Unsupported file type. Please upload a PDF or DOCX file.');
}
`;
fs.writeFileSync(path.join(parsersDir, 'index.ts'), indexContent);
console.log('✅ Created lib/parsers/index.ts');

console.log('🎉 Setup complete! You can now use the resume parsers.');
