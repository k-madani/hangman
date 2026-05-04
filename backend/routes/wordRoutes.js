const express = require('express');
const router = express.Router();
const wordController = require('../controllers/wordController');

// Get available categories with word counts
router.get('/categories', wordController.getCategories);

// Route for single player random word
router.get('/random', wordController.getRandomWord);

// Route for getting all words
router.get('/', wordController.getAllWords);

// Add a single word
router.post('/add', wordController.addWord);

// Bulk add multiple words
router.post('/bulk-add', wordController.bulkAddWords);

// Manually trigger Groq word refresh
// POST /api/words/refresh-words
router.post('/refresh-words', wordController.manualRefresh);

module.exports = router;