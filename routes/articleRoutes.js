const router = require('express').Router();
const articleController = require('../controllers/articleController');
const verifyJWT = require('../middleware/verifyJWT');
const verifyJWTOptional = require('../middleware/verifyJWTOptional');

router.get('/feed', verifyJWTOptional, articleController.feedArticles);
router.get('/', verifyJWTOptional, articleController.listArticles);
router.get('/:slug', articleController.getArticleWithSlug);
router.post('/', verifyJWT, articleController.createArticle);
router.post('/:slug/favorite', verifyJWT, articleController.favoriteArticle);
router.put('/:slug', verifyJWT, articleController.updateArticle);
router.delete('/:slug', verifyJWT, articleController.deleteArticle);
router.delete('/:slug/favorite', verifyJWT, articleController.unfavoriteArticle);

module.exports = router;