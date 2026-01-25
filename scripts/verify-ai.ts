require('dotenv').config({ path: '.env.local' });
const { extractResumeData, genAI } = require('../lib/ai/gemini');

const sampleResumeText = `
John Doe
Software Engineer
john.doe@example.com
Summary: Developer.
`;

async function testAI() {
    console.log('--- Debugging Gemini Models ---');
    try {
        // NOTE: The Google Generative AI Node SDK might not expose listModels directly on the main class effortlessly
        // without using the ModelManager or similar.
        // However, let's try a direct fetch if the SDK verification fails again.
        // But first, let's try the fallback models.

        console.log("Attempting extraction with default 'gemini-1.5-flash'...");
        try {
            const data = await extractResumeData(sampleResumeText);
            console.log('Extraction Success with default!');
            console.log(JSON.stringify(data, null, 2));
            return;
        } catch (e) {
            if (e instanceof Error) {
                console.log("Default model failed:", e.message);
            }
        }
    } catch (error) {
        console.error('Test Failed:', error);
    }
}

testAI();
