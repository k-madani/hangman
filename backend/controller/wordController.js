// backend/controllers/wordController.js
const Word = require('../models/Word');

// 1. Add a new word to the Knowledge Base
exports.addWord = async (req, res) => {
    try {
        const word = await Word.create(req.body);
        res.status(201).json({
            success: true,
            data: word
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// 2. Get a random word for a new game
exports.getRandomWord = async (req, res) => {
    try {
        // MongoDB Aggregation: $sample randomly selects documents
        const count = await Word.countDocuments();
        const random = Math.floor(Math.random() * count);
        const word = await Word.findOne().skip(random);

        if (!word) {
            return res.status(404).json({ message: "No words found in database" });
        }

        res.status(200).json(word);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};