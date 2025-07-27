const {Router} = require('express');
const router = Router();
const interactionController = require('../controllers/InteractionController');

// Favorite routes
router.route('/discuss/questions/:questionid/favorie').post(interactionController.toggleFavorite)
router.route('/news/trips/:tripid/favorie').post(interactionController.toggleFavorite)
router.route('/Favorie').get(interactionController.getFavorites)

module.exports = router;