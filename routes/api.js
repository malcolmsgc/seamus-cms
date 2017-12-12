const express = require('express');
const router = express.Router();
// const storeController = require('../controllers/');
const { catchErrors } = require('../handlers/errorHandlers');

router.get('/v1', (req, res) => {
    res.send('Hello');
});

module.exports = router;