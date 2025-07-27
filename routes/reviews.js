const {Router} = require('express');
const router = Router();
const interactionController = require('../controllers/InteractionController');

// Agency reviews
router.get('/agency/:agencyId/reviews', interactionController.getReviews)
router.post('/agency/:agencyId/reviews', interactionController.createReviews)
router.route('/agency/:agencyId/reviews/:id')
            .delete(interactionController.deleteReviews)
            .patch(interactionController.updateReviews)

module.exports = router;