const router = require('express').Router();
const userController = require('../controllers/userController');
const verifyJWT = require('../middleware/verifyJWT');

router.get('/user', verifyJWT, userController.getMe);
router.post('/users/login', userController.login);
router.post('/users', userController.register);
router.put('/user', verifyJWT, userController.update);

module.exports = router;