const router = require('express').Router();
const profileController = require('../controllers/profileController');
const verifyJWT = require('../middleware/verifyJWT');
const verifyJWTOptional = require('../middleware/verifyJWTOptional');

router.get('/:username', verifyJWTOptional, profileController.getProfile);
router.post('/:username/follow', verifyJWT, profileController.followUser);
router.delete('/:username/follow', verifyJWT, profileController.unfollowUser);

module.exports = router;