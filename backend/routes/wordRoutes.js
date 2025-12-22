const express = require('express');
const router = express.Router();
const wordController = require('../controllers/wordController');

// Route for single player random word
router.get('/random', wordController.getRandomWord);

// Route for getting all words (if needed)
router.get('/', wordController.getAllWords);

module.exports = router;