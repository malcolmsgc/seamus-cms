const mongoose = require('mongoose');
const User = mongoose.model('User');
const Page = mongoose.model('Page');
const Settings = mongoose.model('Setting');
const promisify = require('es6-promisify');
const settingsID = mongoose.Types.ObjectId(process.env.APP_SETTINGS_ID);

exports.loginPage = (req, res) => {
    res.render('login', {title: 'login'});
};

exports.registerPage = (req, res) => {
    const title = req.user ? 'Add new user' : 'Register';
    res.render('register', { title });
};

exports.mainPage = (req, res) => {
    res.render('console', { title: 'console' });
};

exports.settingsPage = async (req, res) => {
    const settings = await (Settings.findOne({ _id: settingsID })) || {};
    res.render('settings', { title: 'Settings', s: settings });
};

exports.usersPage = async (req, res) => {
    const users = await (User.find({})) || {};
    res.render('users', { title: 'Users', users });
};

/** @function addPage
 * routes user to step 1 or 2 of sequence to add a page
 * validation of page's existence managed by preceding middleware @function checkPageExists in @module pageController.
 * Id for page document is added to request in checkPageExists. It is accessed in addPage directly of of the req object as req.pid.
 * @throws 404 error is step param not handled by cases. This is necessary as the standard catch for this misses the error as it appears valid die to the :step param on the route.
 */
exports.addPage = (req, res, next) => {
    if (!req.params.step || req.params.step == '1') {
        res.render('editPageMeta', { title: 'Add a new CMS page', formAction: 'add' });
    }
    else if (req.params.step == '2') {
        res.render('editPage', { title: `Edit content sections for ${page.title || 'new page'}`, page: { _id: req.pid } });
    }
    else {
        const err = new Error('Not Found');
        err.status = 404;
        next(err);
    }
};

/** @function editPageMeta
 * fetches page data by page id and then renders editPageMeta view
 */
exports.editPageMeta = async (req, res, next) => {
    const page = await Page.findOne({ _id: req.params.pageId });
    res.render('editPageMeta', { title: `Edit page details`, page, formAction: `edit/${req.params.pageId}` });
};

/** @function editPageDetails
 * fetches page content and page title by page id and then renders editPage view
 */
exports.editPageDetails = async (req, res, next) => {
    const page =  await Page.findOne({_id: req.params.pageId})
        .populate({
            path: 'content',
            options: { sort: { index: 1 } }
        })
        .select('title content')
        .exec();
    res.render('editPage', { title: `Edit content sections for ${page.title}`, page });
};


exports.setUpPage = (req, res) => {
    res.render('editPage', { title: 'Set up page' });
};