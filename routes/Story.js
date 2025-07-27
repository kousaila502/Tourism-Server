const {Router} = require('express');
const router = Router(); 
const contentController = require('../controllers/ContentController');
const multer = require('multer'); 

const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,'./uploads')
    },
    filename : function(req,file,cb){
        cb(null, file.originalname);
    }
})

const uploads = multer({storage: storage})

// Story routes
router.post('/story/:idLocation', uploads.single('picture'), contentController.createStory)
router.get('/story/:idLocation', contentController.getStoriesByLocation)
router.delete('/story/:idLocation/:idPicture', contentController.deleteStory)
router.patch('/story/:idLocation/:idPicture', contentController.updateStory)

module.exports = router;