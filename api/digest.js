const { Groq } = require('groq-sdk');
const fetch = require('node-fetch');

const groq = new Groq({});

// Можете да користите RSS feed или друг API за вести
const NEWS_API_URL = 'https://cointelegraph.com/feed'; 

module.exports = async (req, res) => {
    try {
        // 1. Земање на вестите
        const newsResponse = await fetch(NEWS_API_URL);
        const newsData = await newsResponse.text(); 

        // 2. Дефинирање на промптот за сумирање
        const systemPrompt = `
            You are a Crypto Analyst AI. 
            Analyze the following raw news data (in XML/RSS format). 
            Your task is to extract the top 3 most important, market-moving headlines. 
            Format your final response ONLY as a clean JSON array of objects, with keys: 'headline', 'summary', and 'source'.
            Do NOT include any extra text, only the JSON.
        `;

        // 3. Повикување на Groq API
        const groqResponse = await groq.chat.completions.create({
            model: 'llama-3.8b-it',
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Raw News Data: ${newsData.slice(0, 10000)}` }
            ],
            temperature: 0.1,
        });

        const rawGroqContent = groqResponse.choices[0].message.content;
        const digestData = JSON.parse(rawGroqContent);

        res.status(200).json({ status: 'success', digest: digestData });

    } catch (error) {
        console.error("Groq/Fetch Error:", error);
        // Важно: Прикажете чиста грешка за да помогнете во дебагирањето
        res.status(500).json({ 
            status: 'error', 
            message: 'Failed to generate digest. Check Vercel logs.', 
            details: error.message 
        });
    }
};
