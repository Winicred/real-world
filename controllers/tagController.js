const Article = require('../models/Article');

class TagController {
    async getTags(request, response) {
        const tags = await Article.find().distinct('tagList');

        return response.status(200).json({tags});
    }
}

module.exports = new TagController();