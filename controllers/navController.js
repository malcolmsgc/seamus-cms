const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');

exports.mainPage = (req, res) => {
    res.render('console', {title: 'console'});
};

exports.loginPage = (req, res) => {
    res.render('login', {title: 'login'});
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