const {Router} = require('express');
const router = Router();
const userController = require('../controllers/UserController');

const multer = require('multer')

const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,'./uploads')
    },
    filename:function(req,file,cb){
        cb(null, file.originalname)
    }
})

const upload = multer({storage: storage})

// Profile management routes
router.patch('/userprofiledit', upload.single('picture'), userController.updateUserProfile)
router.patch('/agencyprofiledit', upload.single('picture'), userController.updateUserProfile)
router.get('/profile/:userId?', userController.getUserProfile)
router.get('/profile/:userId/stats', userController.getUserStats)

// Follow system routes
router.post('/agency/:agencyid/follow', userController.toggleFollow)
router.post('/user/:userId/follow', userController.toggleFollow)
router.get('/user/:userId/followers', userController.getFollowers)
router.get('/user/:userId/following', userController.getFollowing)

// Search and discovery routes
router.get('/users/search', userController.searchUsers)

module.exports = router;