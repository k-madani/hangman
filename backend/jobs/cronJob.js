const cron = require('node-cron');
const Word = require('../models/Word');
const { generateWordsForCategory, CATEGORIES } = require('../services/llmservice');

const MAX_AI_WORDS_PER_CATEGORY = 50; // Oldest AI words pruned beyond this
const WORDS_TO_GENERATE = 15;
const DELAY_MS = 3000; // 3s delay between categories to avoid rate limits

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Refreshes one category:
 * 1. Ask Groq for `WORDS_TO_GENERATE` new words
 * 2. Insert each, skipping duplicates
 * 3. If AI-word count > MAX, delete the oldest AI words (seed words are never touched)
 */
const refreshCategory = async (category) => {
    console.log(`🔄 [${category}] Generating ${WORDS_TO_GENERATE} words...`);

    let words = [];
    try {
        words = await generateWordsForCategory(category, WORDS_TO_GENERATE);
        console.log(`   LLM returned ${words.length} valid words`);
    } catch (err) {
        console.error(`   ❌ LLM error for ${category}: ${err.message}`);
        return { added: 0, skipped: 0, deleted: 0 };
    }

    let added = 0;
    let skipped = 0;

    for (const word of words) {
        try {
            const exists = await Word.findOne({ text: word.text });
            if (exists) {
                skipped++;
            } else {
                await Word.create(word);
                added++;
            }
        } catch {
            skipped++;
        }
    }

    // Prune: keep only the newest MAX_AI_WORDS_PER_CATEGORY AI-generated words
    const aiWords = await Word.find({ category, isAIGenerated: true }).sort({ createdAt: 1 });
    let deleted = 0;

    if (aiWords.length > MAX_AI_WORDS_PER_CATEGORY) {
        const excess = aiWords.length - MAX_AI_WORDS_PER_CATEGORY;
        const idsToDelete = aiWords.slice(0, excess).map((w) => w._id);
        await Word.deleteMany({ _id: { $in: idsToDelete } });
        deleted = excess;
    }

    console.log(`   ✅ Added: ${added} | Skipped: ${skipped} | Pruned: ${deleted}`);
    return { added, skipped, deleted };
};

/**
 * Runs the full refresh across all categories sequentially.
 * Exported so it can also be triggered manually via a script.
 */
const runWordRefresh = async () => {
    console.log('\n🚀 Word Refresh Started:', new Date().toISOString());

    const totals = { added: 0, skipped: 0, deleted: 0 };

    for (const category of CATEGORIES) {
        const result = await refreshCategory(category);
        totals.added   += result.added;
        totals.skipped += result.skipped;
        totals.deleted += result.deleted;
        await sleep(DELAY_MS);
    }

    console.log(`\n📊 Refresh Complete — Added: ${totals.added} | Skipped: ${totals.skipped} | Pruned: ${totals.deleted}`);
    console.log('✅ Word Refresh Done:', new Date().toISOString(), '\n');
};

/**
 * Registers the cron job. Call once on server startup.
 * Schedule: Every Sunday at 2:00 AM UTC.
 */
const startCronJob = () => {
    if (!process.env.GROQ_API_KEY) {
        console.warn('⚠️  GROQ_API_KEY not set — word refresh cron will NOT run');
        return;
    }

    cron.schedule('0 2 * * 0', runWordRefresh, {
        scheduled: true,
        timezone: 'UTC'
    });

    console.log('⏰ Word refresh cron scheduled (Sundays 2:00 AM UTC)');
};

module.exports = { startCronJob, runWordRefresh };