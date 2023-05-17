const router = require('express').Router();
const commentController  = require('../controllers/commentController');
const verifyJWT = require('../middleware/verifyJWT');
const verifyJWTOptional = require('../middleware/verifyJWTOptional');

router.get('/:slug/comments', verifyJWTOptional, commentController.getCommentsFromArticle);
router.post('/:slug/comments', verifyJWT, commentController.createComment);
router.delete('/:slug/comments/:id', verifyJWT, commentController.deleteComment)

module.exports = router;