const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');
const { catchErrors } = require('../handlers/errorHandlers');


router.get('/', testController.homePage );


module.exports = router;
