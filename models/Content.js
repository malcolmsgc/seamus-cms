import { type } from 'os';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// mongoose.Promise = global.Promise;
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');

const contentSchema = new Schema({
    
    content
        section title
        section index
        anchor
        content type
        content

});

module.exports = mongoose.model('Content', contentSchema);