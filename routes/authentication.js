const {Router}= require('express');
const router = Router();
const authController = require('../controllers/authentication');            

const multer = require('multer')

const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,'./uploads')
    },
    filename:function(req,file,cb){
        cb(null,  file.originalname)
    }
})

const upload = multer({storage: storage})

router.post('/login',authController.postLogin)
router.post('/signupAgency',upload.single('photo'),authController.postSignUp)
router.patch('/signupAgencyf',upload.array('documents',2),authController.updateSignUp)
router.post('/signupUser', upload.single('photo'),authController.postSignupUser)
router.get('/logout',authController.getLogout)
router.post('/verifyotp',authController.verifyOTP)
router.post('/resendOTPVerification',authController.resendOTPVerification)

// Password reset routes (merged from forgetpassword.js)
router.post('/forgotpassword',authController.forgotPassword)
router.post('/verifyresetotp',authController.verifyResetOTP)
router.post('/setnewpassword',authController.setNewPassword)

module.exports = router