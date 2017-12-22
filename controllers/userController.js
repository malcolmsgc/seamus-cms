const mg = require('mongoose');
const User = mg.model('User');
const promisify = require('es6-promisify');

// uses methods on expressValidator
exports.validateRegister = (req, res, next) => {
    req.sanitizeBody('firstname');
    req.checkBody('firstname', 'You must supply a first name').notEmpty();
    req.sanitizeBody('lastname');
    req.checkBody('lastname', 'You must supply a last name').notEmpty();
    req.checkBody('email', 'That email is not valid').isEmail();
    req.sanitizeBody('email').normalizeEmail({
        remove_dots: false,
        remove_extension: false,
        gmail_remove_sunaddress: false
    });
    req.checkBody('password', 'Password cannot be blank').notEmpty();
    req.checkBody('confirm-password', 'Confirm password cannot be blank').notEmpty();
    req.checkBody('confirm-password', 'Passwords do not match').equals(req.body.password);

    const errors = req.validationErrors();
    if (errors) {
        req.flash('error', errors.map(err => err.msg));
        res.render('register', { title: 'Register', body: req.body, flashes: req.flash() });
        return;
    }
    next();
};

/** @function appendRole
 * Middleware that adds user role to request object and passes it to the register method.
 * query DB to see if any admin user exists
 * if no users userRole set to admin
 * else userRole should be editor
 * @todo allow admin to edit userRole so further admins can be added
 * @returns next to pass req to register middleware method
 */
exports.appendRole = async (req, res, next) => {
    const numAdmins = await User.find({ role: "administrator" }).count();
    req.body.role = (numAdmins >= 1) ? 'editor' : 'administrator';
    next();
}


exports.register = async (req, res, next) => {
    const { email, firstname, lastname, password, role } = req.body;
    const user =  new User({ email, firstname, lastname, role });
    const register = promisify(User.register, User);
    await register(user, password);
    next(); //passes to authController.login
};

exports.account = (req, res) => {
    res.render('account', {title: 'Edit your account'});
}

exports.updateAccount = async (req, res) => {
    const updates = {
        name: req.body.name,
        email: req.body.email
    };
    const query = { _id: req.user._id };
    const update = { $set: updates };
    const options = { new: true, runValidators: true, context: 'query' };
    const user = await User.findOneAndUpdate(query, update, options);
    req.flash('success', 'User updated');
    res.redirect('back');
}
