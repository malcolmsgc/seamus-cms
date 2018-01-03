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
// router.all('*', apiAuth);

router.get('/search', catchErrors(pageController.siteSearch) );
router.get('selectors/page', catchErrors(pageController.getPageContentBySelectors) );
router.get('/page', catchErrors(pageController.getPageContent) );
// router.get('/content', catchErrors(pageController.siteSearch) );
// router.get('/site', catchErrors(pageController.siteSearch) );
// router.get('/content', catchErrors(pageController.siteSearch) );

module.exports = router;