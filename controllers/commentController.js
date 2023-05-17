const User = require('../models/User');
const Article = require('../models/Article');
const Comment = require('../models/Comment');

class CommentController {
    async getCommentsFromArticle(request, response) {
        const { slug } = request.params;

        const article = await Article.findOne({ slug });
        if (!article) {
            return response.status(404).json({ message: 'Article not found.' });
        }

        const { loggedIn } = request;

        if (!loggedIn) {
            return response.status(200).json({
                comments: await Promise.all(article.comments.map(async (commentId) => {
                    const commentObj = await Comment.findById(commentId);
                    return await commentObj.toCommentResponse(false);
                }))
            });
        }

        const loggedInUser = await User.findOne({ email: request.user.email });

        return response.status(200).json({
            comments: await Promise.all(article.comments.map(async commentId => {
                const commentObj = await Comment.findById(commentId).exec();
                return await commentObj.toCommentResponse(loggedInUser);
            }))
        });
    }

    async createComment(request, response) {
        const author = await User.findById(request.user.id);
        if (!author) {
            return response.status(401).json({ message: 'You are not authorized.' });
        }

        const { slug } = request.params;

        const article = await Article.findOne({ slug });
        if (!article) {
            return response.status(404).json({ message: 'Article not found.' });
        }

        const { body } = request.body.comment;

        const newComment = await Comment.create({
            body,
            author: author._id,
            article: article._id
        });

        await article.addComment(newComment._id);

        return response.status(200).json({
            comment: await newComment.toCommentResponse(author)
        });
    }

    async deleteComment(request, response) {
        const author = await User.findById(request.user.id);
        if (!author) {
            return response.status(401).json({ message: 'You are not authorized.' });
        }

        const {slug, id} = request.params;

        const article = await Article.findOne({slug});
        if (!article) {
            return response.status(404).json({message: 'Article not found.'});
        }

        const comment = await Comment.findById(id);
        if (!comment) {
            return response.status(404).json({message: 'Comment not found.'});
        }

        if (comment.author.toString() !== author._id.toString()) {
            return response.status(403).json({message: 'You have no permission to delete this comment.'});
        }

        await article.removeComment(comment._id);
        await Comment.deleteOne({_id: comment._id});

        return response.status(200).json({message: 'Comment deleted.'});
    }
}

module.exports = new CommentController();