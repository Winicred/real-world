const router = require('express').Router();

router.use('/', require('./userRoutes'));
router.use('/profiles', require('./profileRoutes'));
router.use('/articles', require('./articleRoutes'));
router.use('/articles', require('./commentRoutes'));
router.use('/tags', require('./tagRoutes'));

module.exports = router;