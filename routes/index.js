const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');
const { catchErrors } = require('../handlers/errorHandlers');

// Routers
//storeController
router.get('/', catchErrors(storeController.getStores));
router.get('/stores', catchErrors(storeController.getStores));
router.get('/stores/page/:page', catchErrors(storeController.getStores));
router.get('/stores/:id/edit', authController.authCheck, catchErrors(storeController.editStore));
router.get('/add', authController.authCheck, storeController.addStore);
router.get('/store/:slug', catchErrors(storeController.getStorebySlug));
router.get('/tags', catchErrors(storeController.getStoresByTag));
router.get('/tags/:tag', catchErrors(storeController.getStoresByTag));
router.get('/map', storeController.mapPage);
router.get('/hearts', authController.authCheck, catchErrors(storeController.getHearts));
router.get('/top', catchErrors(storeController.getTopStore));

router.post('/add', storeController.upload,
                    catchErrors(storeController.resize),
                    catchErrors(storeController.createStore));
router.post('/add/:id/', storeController.upload,
                        catchErrors(storeController.resize),
                        catchErrors(storeController.updateStore));

    //review controller
router.post('/reviews/:id', authController.authCheck, catchErrors(reviewController.addReview));
                   

    // authentication
router.get('/login', userController.loginForm);
router.get('/register', userController.registerForm);
router.get('/logout', authController.logout);

router.post('/login', authController.login);
router.post('/register', 
    userController.validateRegister,
    catchErrors(userController.register),
    authController.login
);
    // user management
router.get('/account', authController.authCheck, userController.account);
router.get('/account/reset/:token', catchErrors(authController.reset));

router.post('/account', catchErrors(userController.updateAccount));
router.post('/account/forgot', catchErrors(authController.forgot));
router.post('/account/reset/:token', 
    authController.confirmedPasswords,
    catchErrors(authController.update)
);


//  API ROUTES

router.get('/api/search', catchErrors(storeController.searchStores));
router.get('/api/stores/near', catchErrors(storeController.mapStores));

router.post('/api/stores/:id/heart', catchErrors(storeController.heart));


//  END OF API ROUTES


module.exports = router;
