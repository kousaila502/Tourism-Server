const {Router}= require('express');
const router = Router();
const contentController = require('../controllers/ContentController');     
const multer = require('multer')
const { requireAuth } = require('../middleware/authMiddleware');
const { validateQuestion } = require('../middleware/validation');


const Storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,'./uploads')
    },
    filename : function(req,file,cb){
        cb(null, file.originalname )
    }
})

const upload = multer({storage: Storage})

// Question routes
router.get('/discuss/questions',contentController.getQuestions)
router.post('/discuss/questions',[upload.single('picture'), validateQuestion, requireAuth],contentController.createQuestions)
router.route('/discuss/questions/:id')
            .delete(contentController.deleteQuestions)
            .patch(upload.single('picture'),contentController.updateQuestions)
            .get(contentController.getSingleQuestion)

module.exports = router;