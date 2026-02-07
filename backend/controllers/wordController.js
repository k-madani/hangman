const Word = require('../models/Word');

// Get all unique categories with word counts
exports.getCategories = async (req, res) => {
    try {
        const categories = await Word.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    name: '$_id',
                    count: 1,
                    _id: 0
                }
            },
            {
                $sort: { name: 1 }
            }
        ]);

        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

// Fetch a random word by category
exports.getRandomWord = async (req, res) => {
    try {
        const { category } = req.query;
        
        // Find all words in the given category
        const words = await Word.find({ category: { $regex: new RegExp(category, 'i') } });

        if (words.length === 0) {
            return res.status(404).json({ message: "No words found for this category" });
        }

        // Pick a random one from the list
        const randomWord = words[Math.floor(Math.random() * words.length)];
        
        res.json(randomWord);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

// Get all words
exports.getAllWords = async (req, res) => {
    try {
        const words = await Word.find();
        res.json(words);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

// Add a single word
exports.addWord = async (req, res) => {
    try {
        const { text, hint, category, difficulty } = req.body;

        if (!text || !hint || !category) {
            return res.status(400).json({ 
                message: "Missing required fields: text, hint, and category are required" 
            });
        }

        const existingWord = await Word.findOne({ 
            text: text.toLowerCase().trim() 
        });

        if (existingWord) {
            return res.status(400).json({ 
                message: "This word already exists in the database" 
            });
        }

        const newWord = new Word({
            text: text.toLowerCase().trim(),
            hint: hint.trim(),
            category: category.trim(),
            difficulty: difficulty || 'medium'
        });

        await newWord.save();

        res.status(201).json({ 
            message: "Word added successfully",
            word: newWord 
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ 
                message: "This word already exists in the database" 
            });
        }
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Bulk add multiple words
exports.bulkAddWords = async (req, res) => {
    try {
        const { words } = req.body;

        if (!Array.isArray(words) || words.length === 0) {
            return res.status(400).json({ 
                message: "Please provide an array of words" 
            });
        }

        const invalidWords = words.filter(w => !w.text || !w.hint || !w.category);
        if (invalidWords.length > 0) {
            return res.status(400).json({ 
                message: "All words must have text, hint, and category fields" 
            });
        }

        const formattedWords = words.map(w => ({
            text: w.text.toLowerCase().trim(),
            hint: w.hint.trim(),
            category: w.category.trim(),
            difficulty: w.difficulty || 'medium'
        }));

        const results = {
            added: [],
            skipped: [],
            errors: []
        };

        for (const word of formattedWords) {
            try {
                const existing = await Word.findOne({ text: word.text });
                if (existing) {
                    results.skipped.push(word.text);
                } else {
                    const newWord = await Word.create(word);
                    results.added.push(newWord);
                }
            } catch (error) {
                results.errors.push({ word: word.text, error: error.message });
            }
        }

        res.status(201).json({
            message: "Bulk add completed",
            summary: {
                total: words.length,
                added: results.added.length,
                skipped: results.skipped.length,
                errors: results.errors.length
            },
            results
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};