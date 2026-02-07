const express = require('express');
const router = express.Router();
const wordController = require('../controllers/wordController');

// Get available categories with word counts
router.get('/categories', wordController.getCategories);

// Route for single player random word
router.get('/random', wordController.getRandomWord);

// Route for getting all words (if needed)
router.get('/', wordController.getAllWords);

// Add a new word
router.post('/add', wordController.addWord);

// Bulk add multiple words
router.post('/bulk-add', wordController.bulkAddWords);

module.exports = router;