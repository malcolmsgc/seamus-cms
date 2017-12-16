const mongoose = require('mongoose');
const User = mongoose.model('User');
const Settings = mongoose.model('Setting');
const promisify = require('es6-promisify');
const settingsID = mongoose.Types.ObjectId(process.env.APP_SETTINGS_ID);


exports.mainPage = (req, res) => {
    res.render('console', {title: 'console'});
};

exports.loginPage = (req, res) => {
    res.render('login', {title: 'login'});
};

exports.settingsPage = async (req, res) => {
    const settings = await (Settings.findOne({ _id: settingsID })) || {};
    res.render('settings', {title: 'Settings', s: settings });
};

exports.addPage = (req, res) => {
    if (!req.params.step || req.params.step == '1') {
        res.render('editPageMeta', {title: 'Add a new CMS page'});
    }
    else if (req.params.step == '2') {
        res.render('editPage', {title: 'Add a new CMS page'});
    }
    else
        res.statusCode(404);
};

exports.setUpPage = (req, res) => {
    res.render('editPage', {title: 'Set up page'});
};