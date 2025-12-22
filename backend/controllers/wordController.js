const Word = require('../models/Word');

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

// Your existing getAllWords logic...
exports.getAllWords = async (req, res) => {
    const words = await Word.find();
    res.json(words);
};