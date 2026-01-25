const https = require('https');
require('dotenv').config({ path: '.env.local' });

const key = process.env.GOOGLE_AI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log('Available Models:');
            if (json.models) {
                json.models.forEach(m => console.log(`- ${m.name} (${m.supportedGenerationMethods.join(', ')})`));
            } else {
                console.log(JSON.stringify(json, null, 2));
            }
        } catch (e) {
            console.error(e.message);
            console.log(data);
        }
    });
}).on('error', (e) => {
    console.error(e);
});
