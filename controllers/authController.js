const passport = require('passport');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');
const mail = require('../handlers/mail');

/** @constant authExceptions
 *  @type array of strings
 *  @required for authCheck method
 *  Array of paths that unauthenticated users can access
 */
const authExceptions = ["/login", "/register"];

/** @todo add in routes for Admin level access */
/** @constant administratorOnly
 *  @type array of strings
 *  @required for permissionsCheck method
 *  Array of paths that administrator role can access, i.e. other roles should not access
 */
const administratorOnly = ["/addpage", "/delete/user/:userId"];

exports.login = passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: 'Failed Login',
    successRedirect: '/',
    successFlash: 'Welcome! You have been logged in.'
});

exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'You have been logged out');
    res.redirect('/login');
};

exports.authCheck = (req, res, next) => {
    if (req.isAuthenticated() || authExceptions.includes(req.url)) {
        next();
        return;
    }
    else {
        res.redirect('/login');
    }
};

/** @function permissionsCheck
 *  Checks role of user against @constant administratorOnly array
 *  Allows access to pages allowed to role.
 *  Halts navigation for users without role. This is recautionary only as user model requires role to be set
 */
exports.permissionsCheck = (req, res, next) => {
    if (user.role === 'administrator') {
        next();
        return;
    }
    else if (user.role === 'editor' && administratorOnly.includes(req.url)) {
        res.redirect('back');
        req.flash('error', 'You must be an administrator to view that page');
        return;
    }
    else {
        throw new Error('User has no role set. Please contact an administrator to set a role');
        req.flash('error', 'User has no role set. Please contact an administrator to set a role');
        res.redirect('/');
        return;
    }
};


exports.forgot = async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        req.flash('error', 'That email address does not have an account');
        res.redirect('back');
    }
    else {
        user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordExpires = Date.now() + 25000; //25 min window
        await user.save();
        const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
        const emailOptions = {
            user,
            subject: 'Password Reset',
            resetURL,
            filename: 'password-reset'
        };
        mail.send(emailOptions);
        req.flash('success', `You have been emailed a password reset link.`);
        res.redirect('back');
    }
};

exports.reset = async (req, res) => {
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
        req.flash('error', 'Password reset is invalid or has expired');
        return res.redirect('/login');
    }
    else {
        res.render('reset', { title: "Reset your password" });
    }
}

exports.confirmedPasswords = (req, res, next) => {
    if (req.body.password === req.body['confirm-password']) {
        next();
        return;
    }
    else {
        req.flash('error', 'Passwords do not match');
        res.redirect('back');
    }
};

exports.updatePassword = async (req, res) => {
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
        req.flash('error', 'Password reset is invalid or has expired');
        return res.redirect('/login');
    }
    else {
        const setPassword = promisify(user.setPassword, user);
        await setPassword(req.body.password);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        const updatedUser = await user.save();
        await req.login(updatedUser);
        req.flash('success','Your password has been reset');
        res.redirect('/');
    }

};