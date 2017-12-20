const mongoose = require('mongoose');
const User = mongoose.model('User');
const Page = mongoose.model('Page');
const Settings = mongoose.model('Setting');
const promisify = require('es6-promisify');
const settingsID = mongoose.Types.ObjectId(process.env.APP_SETTINGS_ID);


exports.mainPage = (req, res) => {
    res.render('console', { title: 'console' });
};

exports.loginPage = (req, res) => {
    res.render('login', { title: 'login' });
};

exports.settingsPage = async (req, res) => {
    const settings = await (Settings.findOne({ _id: settingsID })) || {};
    res.render('settings', { title: 'Settings', s: settings });
};

/** @function addPage
 * routes user to step 1 or 2 of sequence to add a page
 * validation of page's existence managed by preceding middleware @function checkPageExists in @module pageController.
 * Id for page document is added to request in checkPageExists. It is accessed in addPage directly of of the req object as req.pid.
 * @throws 404 error is step param not handled by cases. This is necessary as the standard catch for this misses the error as it appears valid die to the :step param on the route.
 */
exports.addPage = (req, res, next) => {
    if (!req.params.step || req.params.step == '1') {
        res.render('editPageMeta', { title: 'Add a new CMS page' });
    }
    else if (req.params.step == '2') {
        console.log('addPage pid: ' + req.pid);
            res.render('editPage', { title: 'Set up new CMS page', page: { _id: req.pid, verb: "Add" } });
    }
    else {
        const err = new Error('Not Found');
        err.status = 404;
        next(err);
    }
};

exports.setUpPage = (req, res) => {
    res.render('editPage', { title: 'Set up page' });
};