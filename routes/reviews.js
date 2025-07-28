const {Router} = require('express');
const router = Router();
const interactionController = require('../controllers/InteractionController');
const { validateReview } = require('../middleware/validation');


// Agency reviews
router.get('/agency/:agencyId/reviews', interactionController.getReviews)
router.post('/agency/:agencyId/reviews', validateReview, interactionController.createReviews)
router.route('/agency/:agencyId/reviews/:id')
            .delete(interactionController.deleteReviews)
            .patch(interactionController.updateReviews)

module.exports = router;