
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
const { authCheck } = require ('../controllers/authController');
const { catchErrors } = require('../handlers/errorHandlers');

// USER AUTHENTICATION CHECK
router.all('*', authCheck);

// APP NAVIGATION
router.get('/', catchErrors(pageController.fetchPages) );
router.get('/login', navController.loginPage );
router.get('/logout', authController.logout );
router.get('/register', navController.registerPage );
router.get('/settings', navController.settingsPage );
router.get('/users', catchErrors(navController.usersPage) );
router.get('/page/:pageId', catchErrors(pageController.fetchPage) );
router.get('/addpage/?(:step)?', catchErrors(pageController.checkPageExists), navController.addPage );
router.get('/editpage/:pageId/1', catchErrors(navController.editPageMeta) );
router.get('/editpage/:pageId/2', catchErrors(navController.editPageDetails) );

// FORM SUBMISSIONS
    // USER AUTH
router.post('/register',
    catchErrors(userController.appendRole),
    validationController.validateRegisterRules,
    validationController.validateRegister,
    userController.register,
    authController.login
);
router.post('/login', authController.login );
    // CMS MANAGEMENT
router.post('/settings', catchErrors(pageController.saveSettings) );
/** @todo update to pass through all entered data. Validator's matchedData only returns fields that were validated and are currently cutting out hlaf the inputted data  */
router.post('/meta/add', 
    // validationController.pageMetaRules,
    // validationController.pageMeta,
    catchErrors(pageController.saveNewPageMeta) );
router.post('/meta/edit/:pageId', 
    // validationController.pageMetaRules,
    // validationController.pageMeta,
    catchErrors(pageController.savePageMeta) );
router.post('/schema/:pageId',
    // validationController.pageSchemaRules,
    // validationController.pageSchema,
    pageController.pageSchemaSaveSwitch,
    catchErrors(pageController.savePageSchema), 
    catchErrors(pageController.savePageSchemaSingle) 
);
router.post('/page/:pageId',
    pageController.imgUpload,
    catchErrors(pageController.imgWrite),
    pageController.massageRawContent,
    catchErrors(pageController.saveContent),
);


module.exports = router;
