/** @module index.js exports router object
 *  @summary holds routes for app. Routes include: 
 * GET calls for page renders
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

module.exports = router;