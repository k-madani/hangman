/**
 * scripts/refreshWords.js
 * 
 * Manual trigger for the weekly word refresh.
 * Run with: node scripts/refreshWords.js
 * 
 * Useful for:
 *  - Testing your Groq API key before Sunday's cron fires
 *  - Seeding AI words for the first time
 *  - Re-running after adding a new category
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const { runWordRefresh } = require('../jobs/cronJob');

(async () => {
    await connectDB();
    await runWordRefresh();
    await mongoose.disconnect();
    process.exit(0);
})();