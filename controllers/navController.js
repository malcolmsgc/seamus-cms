const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');

exports.mainPage = (req, res) => {
    res.render('main', {title: 'this is where user will edit content'});
};

exports.loginPage = (req, res) => {
    res.render('login', {title: 'login'});
};
