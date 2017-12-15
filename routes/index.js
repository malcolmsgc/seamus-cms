
/** @module index.js exports router object
 *  @summary holds routes for app. Routes include: 
 * GET calls for page renders
 */

const express = require('express');
const router = express.Router();
const navController = require('../controllers/navController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { authCheck } = require ('../controllers/authController');
const { catchErrors } = require('../handlers/errorHandlers');

// USER AUTHENTICATION CHECK
router.all('*', authCheck);

// APP NAVIGATION
router.get('/', navController.mainPage );
router.get('/login', userController.loginPage );
router.get('/logout', authController.logout );
router.get('/register', userController.registerPage );
router.get('/addpage/(:step)?', navController.addPage );
// router.get('/page/:page/edit/:step', navController.editPage );

// FORM SUBMISSIONS
router.post('/register',
userController.validateRegister,
catchErrors(userController.appendRole),
userController.register,
authController.login
);

router.post('/login', authController.login );

router.post('/meta', navController.savePageMeta );
router.post('/schema', navController.savePageSchema );


module.exports = router;
