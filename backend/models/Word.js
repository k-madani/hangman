const mongoose = require('mongoose');

const WordSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, 'Please add a word'],
        unique: true,
        lowercase: true,
        trim: true
    },
    hint: {
        type: String,
        required: [true, 'Please add a hint for the word']
    },
    category: {
        type: String,
        required: [true, 'Please specify a category'],
        default: 'General'
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    isAIGenerated: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Word', WordSchema);