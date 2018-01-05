/** @module api.js exports router object that builds on /api/v[version]/
 */

const express = require('express');
const router = express.Router();
const navController = require('../controllers/navController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const pageController = require('../controllers/pageController');
const validationController = require('../controllers/validationController');
// const { authCheck } = require ('../controllers/authController');
const { catchErrors } = require('../handlers/errorHandlers');

// USER AUTHENTICATION CHECK
/** @todo
 * check req headers to see if originating host matches with site hostname. If not require user auth.
 * 
 */
// router.all('*', apiAuth);

router.get('/search', catchErrors(pageController.siteSearch) );
router.get('/selectors/page', catchErrors(pageController.getPageContentBySelectors) );
// router.get('/selectors/all', catchErrors(pageController.getSiteContentBySelectors) );
router.get('/page', catchErrors(pageController.getPageContent) );
router.get('/content', catchErrors(pageController.getContentSection) );
// router.get('/content/:type', catchErrors(pageController.getContentByType) );
router.get('/site', catchErrors(pageController.getSiteContent) );

module.exports = router;