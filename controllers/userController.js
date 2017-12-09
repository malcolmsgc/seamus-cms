const mg = require('mongoose');
const User = mg.model('User');
const promisify = require('es6-promisify');

exports.loginForm = (req, res) => {
    res.render('login', {title: 'login'});
};

exports.registerForm = (req, res) => {
    res.render('register', {title: 'register'});
};

// uses methods on expressValidator
exports.validateRegister = (req, res, next) => {
    req.sanitizeBody('name');
    req.checkBody('name', 'You must supply a name').notEmpty();
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

exports.register = async (req, res, next) => {
    const { email, name, password } = req.body;
    const user =  new User({ email, name });
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
