const mongoose = require('mongoose');

const WordSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, 'Please add a word'],
        unique: true, // Prevents duplicate words in your game
        lowercase: true,
        trim: true
    },
    hint: {
        type: String,
        required: [true, 'Please add a hint for the word']
    },
    category: {
        type: String,
        required: [true, 'Please specify a category (e.g., Tech, Animals)'],
        default: 'General'
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'], // Only allows these three values
        default: 'medium'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Word', WordSchema);