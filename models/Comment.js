const mongoose = require('mongoose');
const User = require('./User');

const Comment = mongoose.model('comments', new mongoose.Schema(
    {
        body: {
            type: String,
            required: true
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        article: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Article'
        }
    },
    {
        timestamps: true
    })
);

Comment.prototype.toCommentResponse = async function (user) {
    const authorObj = await User.findById(this.author).exec();
    
    return {
        id: this._id,
        body: this.body,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        author: authorObj.toProfileResponse(user)
    }
};

module.exports = Comment;