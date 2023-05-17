const mongoose = require('mongoose');

const Tag = mongoose.model('Tag', new Schema({
    tagName: {
        type: String,
        required: true,
        unique: true
    },
    articles: [{
        type: Schema.Types.ObjectId,
        ref: 'Article'
    }]
}));

module.exports = Tag;