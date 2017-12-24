const mg = require('mongoose');
const User = mg.model('User');
const promisify = require('es6-promisify');
// const { body, validationResult } = require('express-validator/check');
// const { matchedData, sanitizeBody } = require('express-validator/filter');


/** @function appendRole
 * Middleware that adds user role to request object and passes it to the register method.
 * query DB to see if any admin user exists
 * if no users userRole set to admin
 * else userRole should be editor
 * @todo allow admin to edit userRole so further admins can be added
 * @returns next to pass req to register middleware method
 */
exports.appendRole = async (req, res, next) => {
    // if no role (i.e. self-registered), add role based on if any admin exists
    if (!req.body.role) {
        const numAdmins = await User.find({ role: "administrator" }).count();
        req.body.role = (numAdmins >= 1) ? 'editor' : 'administrator';
        req.logUserIn = true;
    }
    next();
}


exports.register = async (req, res, next) => {
    const { email, firstname, lastname, password, role } = req.body;
    const user =  new User({ email, firstname, lastname, role });
    const register = promisify(User.register, User);
    await register(user, password);
    // If self-registering, user is logged in automatically
    if (req.logUserIn) {
        next(); //passes to authController.login
        return;
    }
    req.flash('success', `User account created for ${firstname} ${lastname}`);
    res.redirect('/users');
    
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
