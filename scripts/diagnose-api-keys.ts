/**
 * API Key Diagnostic Script
 *
 * Tests which AI providers are available and configured correctly.
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { status: 'missing', message: 'OPENAI_API_KEY not configured' };
  }

  try {
    const OpenAI = (await import('openai')).default;
    const client = new OpenAI({ apiKey });

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Say "test successful"' }],
      max_tokens: 20
    });

    return {
      status: 'working',
      message: 'OpenAI API is functional',
      model: 'gpt-4o-mini',
      response: response.choices[0].message.content
    };
  } catch (error: any) {
    return {
      status: 'error',
      message: error.message,
      details: error.response?.data || error
    };
  }
}

async function testAnthropic() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { status: 'missing', message: 'ANTHROPIC_API_KEY not configured' };
  }

  try {
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 20,
      messages: [{ role: 'user', content: 'Say "test successful"' }]
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';
    return {
      status: 'working',
      message: 'Anthropic API is functional',
      model: 'claude-3-haiku-20240307',
      response: content
    };
  } catch (error: any) {
    return {
      status: 'error',
      message: error.message,
      details: error.response?.data || error
    };
  }
}

async function testGoogleAI() {
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    return { status: 'missing', message: 'GOOGLE_API_KEY not configured' };
  }

  // Try different model names
  const modelsToTry = [
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-pro',
    'gemini-1.0-pro'
  ];

  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(apiKey);

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Say "test successful"');
      const response = await result.response;

      return {
        status: 'working',
        message: 'Google AI API is functional',
        model: modelName,
        response: response.text()
      };
    } catch (error: any) {
      // Try next model
      continue;
    }
  }

  return {
    status: 'error',
    message: 'Could not find a working Google AI model',
    triedModels: modelsToTry
  };
}

async function main() {
  console.log('🔍 AI API Diagnostic Report\n');
  console.log('='.repeat(70));
  console.log('\n');

  // Test OpenAI
  console.log('1️⃣ OpenAI (GPT-4)');
  console.log('-'.repeat(70));
  const openaiResult = await testOpenAI();
  console.log(`Status: ${openaiResult.status.toUpperCase()}`);
  console.log(`Message: ${openaiResult.message}`);
  if (openaiResult.model) console.log(`Model: ${openaiResult.model}`);
  if (openaiResult.response) console.log(`Response: ${openaiResult.response}`);
  if (openaiResult.details) console.log(`Details:`, openaiResult.details);
  console.log('\n');

  // Test Anthropic
  console.log('2️⃣ Anthropic (Claude)');
  console.log('-'.repeat(70));
  const anthropicResult = await testAnthropic();
  console.log(`Status: ${anthropicResult.status.toUpperCase()}`);
  console.log(`Message: ${anthropicResult.message}`);
  if (anthropicResult.model) console.log(`Model: ${anthropicResult.model}`);
  if (anthropicResult.response) console.log(`Response: ${anthropicResult.response}`);
  if (anthropicResult.details) console.log(`Details:`, anthropicResult.details);
  console.log('\n');

  // Test Google AI
  console.log('3️⃣ Google AI (Gemini)');
  console.log('-'.repeat(70));
  const googleResult = await testGoogleAI();
  console.log(`Status: ${googleResult.status.toUpperCase()}`);
  console.log(`Message: ${googleResult.message}`);
  if (googleResult.model) console.log(`Model: ${googleResult.model}`);
  if (googleResult.response) console.log(`Response: ${googleResult.response}`);
  if ((googleResult as any).triedModels) console.log(`Tried models:`, (googleResult as any).triedModels);
  console.log('\n');

  // Summary
  console.log('='.repeat(70));
  console.log('📊 Summary\n');

  const workingProviders = [
    openaiResult.status === 'working' ? 'OpenAI' : null,
    anthropicResult.status === 'working' ? 'Anthropic' : null,
    googleResult.status === 'working' ? 'Google AI' : null
  ].filter(Boolean);

  if (workingProviders.length === 0) {
    console.log('❌ No AI providers are currently working!');
    console.log('\n⚠️  ACTION REQUIRED:');
    console.log('   You need to add at least one valid API key to .env.local:');
    console.log('   - OPENAI_API_KEY (recommended for production)');
    console.log('   - ANTHROPIC_API_KEY (alternative)');
    console.log('   - GOOGLE_API_KEY (alternative)');
  } else {
    console.log(`✅ Working providers: ${workingProviders.join(', ')}`);
    console.log('\n💡 Recommendation:');
    if (workingProviders.includes('OpenAI')) {
      console.log('   OpenAI is working - this is the recommended provider for production.');
    } else if (workingProviders.includes('Anthropic')) {
      console.log('   Anthropic is working - good choice, similar quality to OpenAI.');
    } else {
      console.log('   Google AI is working - acceptable but may have different output quality.');
    }
  }

  console.log('\n');
}

main().catch(console.error);
