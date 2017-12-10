const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');

exports.homePage = (req, res) => {
    res.render('home', {title: 'home'});
};