const {Router} = require('express');
const router = Router();
const interactionController = require('../controllers/InteractionController');

const multer = require('multer')

const Storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,'./uploads')
    },
    filename : function(req,file,cb){
        cb(null, file.originalname )
    }
})

const upload = multer({storage: Storage})

// Question replies
router.route('/discuss/questions/:questionId/reply/:replyId')
            .delete(interactionController.deleteReply)
            .patch(upload.single('picture'),interactionController.updateReply)
            .get(interactionController.getSingleReply)

router.route('/discuss/questions/:questionId/reply/')
            .get(interactionController.getReplies)
            .post(upload.single('picture'),interactionController.createReply)

module.exports = router;