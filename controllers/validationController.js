const { body, param, validationResult } = require('express-validator/check');
const { matchedData, sanitizeBody } = require('express-validator/filter');

// uses methods on expressValidator
exports.validateRegisterRules = [
    body('role', 'The user must be assigned a role').isIn(['administrator','editor']),
    sanitizeBody('firstname').escape(), //escape replaces <, >, &, ', " and / with HTML entities.
    body('firstname', 'You must supply a first name').isLength({min: 1}),
    sanitizeBody('lastname').escape(),
    body('lastname', 'You must supply a last name').isLength({min: 1}),
    body('email', 'That email is not valid').isEmail(),
    sanitizeBody('email').normalizeEmail({
        remove_dots: false,
        remove_extension: false,
        gmail_remove_sunaddress: false
    }),
    /** @todo add custom validation rules on the password field  */
    body('password', 'Password must contain at least 3 characters').isLength({min: 3}),
    body('confirm-password', 'Confirm password must contain at least 3 characters').isLength({min: 3}),
    body('confirm-password', 'Passwords do not match').custom((value, { req }) => value === req.body.password)
];

exports.validateRegister = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('error', errors.array()
            .map(err => err.msg));
        res.render('register', { title: 'Register', body: req.body, flashes: req.flash() });
        return;
    }
    // get sanitized and validated data and replace data on req.body with it. Done in two steps for clarity.
    const validated = matchedData(req, {body});
    req.body = validated;
    next();
};

/** @todo update to pass through all entered data. Validator's matchedData only returns fields that were validated and are currently cutting out hlaf the inputted data  */
exports.pageSchemaRules = [
    param('pageId', 'Page ID is invalid').isMongoId(),
    body('title', 'The page must have a title').isLength({min: 1}),
    sanitizeBody('title').escape() //escape replaces <, >, &, ', " and / with HTML entities.
];


/** @todo handle persistence of form values on error. Will requires looping through array and adding sections as necessary */
exports.pageSchema = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('error', errors.array()
        .map(err => err.msg));
        res.render('editPage', { title: 'Add a new CMS page', body: req.body, flashes: req.flash() });
        return;
    }
    // get validated data and replace data on req.body with it. Done in two steps for clarity.
    const validated = matchedData(req, {body});
    req.body = validated;
    next();
};

exports.pageMetaRules = [
    body('title', 'The page must have a title').isLength({min: 1}),
    sanitizeBody('title').escape(), //escape replaces <, >, &, ', " and / with HTML entities.
    sanitizeBody('subtitle').escape(),
    body('rel_path', 'You must supply a relative path for the page').isLength({min: 1})
];

/** @todo handle persistence of form values on error */
exports.pageMeta = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('error', errors.array()
        .map(err => err.msg));
        res.render('editPageMeta', { title: 'Set up new CMS page', body: req.body, flashes: req.flash() });
        return;
    }
    // get validated data and replace data on req.body with it. Done in two steps for clarity.
    const validated = matchedData(req, {body});
    req.body = validated;
    next();
};