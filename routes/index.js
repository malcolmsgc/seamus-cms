
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
const { authCheck } = require ('../controllers/authController');
const { catchErrors } = require('../handlers/errorHandlers');

// USER AUTHENTICATION CHECK
router.all('*', authCheck);

// APP NAVIGATION
router.get('/', navController.mainPage );
router.get('/login', navController.loginPage );
router.get('/logout', authController.logout );
router.get('/register', navController.registerPage );
router.get('/settings', navController.settingsPage );
router.get('/users', catchErrors(navController.usersPage) );
router.get('/addpage/(:step)?', catchErrors(pageController.checkPageExists), navController.addPage );
// router.get('/page/:page/edit/:step', navController.editPage );

// FORM SUBMISSIONS
    // USER AUTH
router.post('/register',
    catchErrors(userController.appendRole),
    userController.validateRegisterRules,
    userController.validateRegister,
    userController.register,
    authController.login
);
router.post('/login', authController.login );
    // CMS MANAGEMENT
router.post('/settings', catchErrors(pageController.saveSettings) );
router.post('/meta', catchErrors(pageController.saveNewPageMeta) );
router.post('/schema/:pageId', 
    pageController.savePageSchemaPrep,
    catchErrors(pageController.savePageSchema), 
    catchErrors(pageController.savePageSchemaSingle) 
);


module.exports = router;
