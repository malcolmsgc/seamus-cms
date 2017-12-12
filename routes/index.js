
const express = require('express');
const router = express.Router();
const navController = require('../controllers/navController');
const { authCheck } = require ('../controllers/authController');
const { catchErrors } = require('../handlers/errorHandlers');

// USER AUTHENTICATION CHECK
router.all('*', authCheck);

// APP NAVIGATION
router.get('/', navController.mainPage );
router.get('/login', navController.loginPage );
router.get('/register', navController.registerPage );


module.exports = router;
