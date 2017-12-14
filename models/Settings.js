const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// mongoose.Promise = global.Promise;
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');

const settingsSchema = new Schema({
    //your site's name
    // allow html?
    // root / tld
    // single or multi page
    // admin exsits?
});

module.exports = mongoose.model('Setting', settingsSchema);