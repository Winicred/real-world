const User = require('../models/User');
const Article = require('../models/Article');

class ArticleController {
    async feedArticles(request, response) {
        /**
         * Возможные параметры запроса:
         * limit - количество статей, которое нужно вернуть;
         * offset - количество статей, которое нужно пропустить.
         */

        const limit = request.query.limit || 20;
        const offset = request.query.offset || 0;

        const filteredArticles = await Article.find({author: {$in: loggedInUser.followingUsers}})
            .limit(Number(limit))
            .skip(Number(offset))
            .sort({createdAt: 'desc'});

        const articles = await Promise.all(filteredArticles.map(async (article) => {
            return await article.toArticleResponse(request.user.id);
        }))

        return response.status(200).json({
            articles,
            articlesCount: articles.length,
        });
    }

    async listArticles(request, response) {
        /**
         * Возможные параметры запроса:
         * limit - количество статей, которое нужно вернуть;
         * offset - количество статей, которое нужно пропустить;
         * tag - тег, по которому нужно отфильтровать статьи;
         * author - имя пользователя (username) автора, по которому нужно отфильтровать статьи;
         * favorited - имя пользователя (username) того, кто поставил лайк, по которому нужно отфильтровать статьи.
         */

        const limit = request.query.limit || 20;
        const offset = request.query.offset || 0;

        let query = {};

        if (request.query.tag) {
            query.tagList = {$in: [request.query.tag]}
        }

        if (request.query.author) {
            const author = await User.findOne({username: request.query.author});
            if (author) {
                query.author = author._id;
            }
        }

        if (request.query.favorited) {
            const favoriter = await User.findOne({username: request.query.favorited});
            if (favoriter) {
                query._id = {$in: favoriter.favouriteArticles};
            }
        }

        const filteredArticles = await Article.find(query)
            .limit(Number(limit))
            .skip(Number(offset))
            .sort({createdAt: 'desc'});

        if (!request.loggedIn) {
            const articles = await Promise.all(filteredArticles.map(async (article) => {
                return await article.toArticleResponse(false);
            }))

            return response.status(200).json({
                articles,
                articlesCount: articles.length,
            });
        }

        const articles = await Promise.all(filteredArticles.map(async (article) => {
            return await article.toArticleResponse(request.user.id);
        }));

        return response.status(200).json({
            articles,
            articlesCount: articles.length,
        });
    }

    async getArticleWithSlug(request, response) {
        const {slug} = request.params;

        const article = await Article.findOne({slug});
        if (!article) {
            return response.status(404).json({message: 'Article not found.'});
        }

        return response.status(200).json({
            article: await article.toArticleResponse(request.loggedIn ? request.user.id : false)
        });
    }

    async createArticle(request, response) {
        const author = await User.findById(request.user.id);
        if (!author) {
            return response.status(401).json({message: 'You are not authorized.'});
        }

        const {title, description, body, tagList} = request.body.article;
        if (!title || !description || !body) {
            return response.status(400).json({message: "All fields are required."});
        }

        const article = await Article.create({ title, description, body });

        article.author = author._id;

        if (Array.isArray(tagList) && tagList.length > 0) {
            article.tagList = tagList;
        }

        await article.save();

        return response.status(201).json({
            article: await article.toArticleResponse(author)
        });
    }

    async deleteArticle(request, response) {
        const {slug} = request.params;

        const loggedInUser = await User.findById(request.user.id);
        if (!loggedInUser) {
            return response.status(401).json({message: 'You are not authorized.'});
        }

        const article = await Article.findOne({slug});
        if (!article) {
            return response.status(404).json({message: 'Article not found.'});
        }

        if (article.author.toString() !== loggedInUser._id.toString()) {
            return response.status(403).json({message: 'You have no permission to delete this article.'});
        }

        await Article.deleteOne({slug});

        return response.status(200).json({message: 'Article deleted.'});
    }

    async favoriteArticle(request, response) {
        const {slug} = request.params;

        const loggedInUser = await User.findById(request.user.id);
        if (!loggedInUser) {
            return response.status(401).json({message: 'You are not authorized.'});
        }

        const article = await Article.findOne({slug});
        if (!article) {
            return response.status(404).json({message: 'Article not found.'});
        }

        await loggedInUser.favorite(article._id);

        const updatedArticle = await article.updateFavoriteCount();

        return response.status(200).json({
            article: await updatedArticle.toArticleResponse(loggedInUser)
        });
    }

    async unfavoriteArticle(request, response) {
        const {slug} = request.params;

        const loggedInUser = await User.findById(request.user.id);
        if (!loggedInUser) {
            return response.status(401).json({message: 'You are not authorized.'});
        }

        const article = await Article.findOne({slug});
        if (!article) {
            return response.status(404).json({message: 'Article not found.'});
        }

        await loggedInUser.unfavorite(article._id);

        const updatedArticle = await article.updateFavoriteCount();

        return response.status(200).json({
            article: await updatedArticle.toArticleResponse(loggedInUser)
        });
    }

    async updateArticle(request, response) {
        const {article} = request.body;
        const {slug} = request.params;

        const loggedInUser = await User.findById(request.user.id);
        if (!loggedInUser) {
            return response.status(401).json({message: 'You are not authorized.'});
        }

        const target = await Article.findOne({slug});
        if (!target) {
            return response.status(404).json({message: 'Article not found.'});
        }

        if (target.author.toString() !== loggedInUser._id.toString()) {
            return response.status(403).json({message: 'You have no permission to update this article.'});
        }

        if (article.title) {
            target.title = article.title;
        }
        
        if (article.description) {
            target.description = article.description;
        }
        
        if (article.body) {
            target.body = article.body;
        }
        
        if (article.tagList) {
            target.tagList = article.tagList;
        }

        await target.save();

        return response.status(200).json({
            article: await target.toArticleResponse(loggedInUser)
        });
    }
} 

module.exports = new ArticleController();