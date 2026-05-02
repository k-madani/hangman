const axios = require('axios');

const CATEGORIES = ['Technology', 'Movies', 'Countries', 'Animals', 'Science', 'Sports', 'Food', 'Music'];

/**
 * Calls Groq to generate `count` unique Hangman words for a given category.
 * Returns a validated, cleaned array ready to insert into MongoDB.
 */
const generateWordsForCategory = async (category, count = 15) => {
    const allowProperNouns = ['Movies', 'Countries'].includes(category);

    const prompt = `Generate ${count} unique single-word Hangman words for the "${category}" category.

Rules:
- Single word only (no spaces, no hyphens)
- Length: 4 to 14 characters
- Real, well-known words
- ${allowProperNouns ? 'Proper nouns are allowed for this category' : 'No proper nouns'}
- Hint: ≤8 words, descriptive but must NOT contain the word itself
- difficulty: "easy" (4–6 letters, very common), "medium" (7–9 letters), "hard" (10+ letters or obscure)

Return ONLY a raw JSON array — no markdown, no code fences, no explanation:
[{"text":"example","hint":"brief hint here","difficulty":"easy"}]`;

    const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
            model: 'llama-3.1-8b-instant',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.85,
            max_tokens: 1500
        },
        {
            headers: {
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        }
    );

    const raw = response.data.choices[0].message.content.trim();
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    if (!Array.isArray(parsed)) throw new Error('LLM did not return an array');

    return parsed
        .filter(w =>
            w.text &&
            w.hint &&
            typeof w.text === 'string' &&
            !w.text.includes(' ') &&
            w.text.length >= 4 &&
            w.text.length <= 14
        )
        .map(w => ({
            text: w.text.toLowerCase().trim(),
            hint: w.hint.trim(),
            category,
            difficulty: ['easy', 'medium', 'hard'].includes(w.difficulty) ? w.difficulty : 'medium',
            isAIGenerated: true
        }));
};

module.exports = { generateWordsForCategory, CATEGORIES };