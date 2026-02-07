const mongoose = require('mongoose');
const Word = require('./models/Word');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected');

        // Read words from JSON file
        const wordsPath = path.join(__dirname, 'words.json');
        const wordsData = fs.readFileSync(wordsPath, 'utf-8');
        const words = JSON.parse(wordsData);

        console.log(`📚 Found ${words.length} words in words.json`);

        // Clear existing words (optional - comment out if you want to keep existing)
        await Word.deleteMany({});
        console.log('🗑️  Existing words cleared');

        // Insert words, handling duplicates
        let added = 0;
        let skipped = 0;

        for (const word of words) {
            try {
                const exists = await Word.findOne({ text: word.text.toLowerCase() });
                if (exists) {
                    skipped++;
                } else {
                    await Word.create(word);
                    added++;
                }
            } catch (error) {
                console.error(`❌ Error adding word "${word.text}":`, error.message);
            }
        }

        console.log('\n📊 Summary:');
        console.log(`✅ Added: ${added} words`);
        console.log(`⏭️  Skipped: ${skipped} words (already existed)`);
        
        // Show categories count
        const categories = await Word.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        console.log('\n📂 Categories in database:');
        categories.forEach(cat => {
            console.log(`   ${cat._id}: ${cat.count} words`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();