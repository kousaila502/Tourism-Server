const {Router} = require('express');
const router = Router();
const searchController = require('../controllers/SearchController');

// Main search and filter routes
router.get('/filter', searchController.search)
router.get('/search', searchController.searchAll)

// Specific search routes
router.get('/search/users', searchController.searchUsers)
router.get('/search/trips', searchController.searchTrips)
router.get('/search/questions', searchController.searchQuestions)
router.get('/search/stories', searchController.searchStories)

// Trending content
router.get('/trending', searchController.getTrending)

module.exports = router;