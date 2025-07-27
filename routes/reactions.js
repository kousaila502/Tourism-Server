const {Router} = require('express');
const router = Router();
const interactionController = require('../controllers/InteractionController');

// Question reactions
router.route('/discuss/questions/:questionid/like/').post(interactionController.likeContent)
router.route('/discuss/questions/:questionid/dislike/').post(interactionController.dislikeContent)

// Reply reactions  
router.route('/discuss/questions/:questionid/reply/:replyid/like/').post(interactionController.likeReply)
router.route('/discuss/questions/:questionid/reply/:replyid/dislike/').post(interactionController.dislikeReply)

// Trip reactions
router.route('/news/trips/:tripid/like').post(interactionController.likeContent)
router.route('/news/trips/:tripid/dislike').post(interactionController.dislikeContent)

// Trip reply reactions
router.route('/news/trips/:tripid/reply/:replyid/like').post(interactionController.likeReply)
router.route('/news/trips/:tripid/reply/:replyid/dislike').post(interactionController.dislikeReply)

// Story reactions
router.route('/story/:idLocation/:idPicture/like').post(interactionController.likeContent)
router.route('/story/:idLocation/:idPicture/dislike').post(interactionController.dislikeContent)

module.exports = router;