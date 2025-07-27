const { Router } = require('express');
const router = Router();
const contentController = require('../controllers/ContentController');
const multer = require('multer')
const { requireAuth } = require('../middleware/authMiddleware');
const { requireAgency } = require('../middleware/roleMiddleware');

const Storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

const upload = multer({ storage: Storage })

// Trip routes
router.get('/news/trips', contentController.getTrips)
router.post('/news/trips', [requireAuth, requireAgency], contentController.createTrips)
router.route('/news/Trips/:tripid')
    .delete(contentController.deleteTrips)
    .patch(contentController.updateTrips)
    .get(contentController.getSingleTrip)

module.exports = router;