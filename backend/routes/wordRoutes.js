const express = require('express');
const router = express.Router();
const wordController = require('../controllers/wordController');

// Path: /api/words
router.route('/')
    .get(wordController.getRandomWord)
    .post(wordController.addWord);

module.exports = router;