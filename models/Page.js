import { type } from 'os';
import { String, Number } from 'core-js/library/web/timers';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// mongoose.Promise = global.Promise;
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');

const pageSchema = new Schema({
    title: {
        type: String,
        trim: true,
        validate: [validator.isAscii, 'Only ASCII characters allowed in page title'],
        default: 'Untitled Page'
    },
    subtitle: {
        type: String,
        trim: true,
        validate: [validator.isAscii, 'Only ASCII characters allowed in page subtitle'],
        default: 'Untitled'
    },
    index: {
        type: Number,
        unique: true
    },
    rel_path: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: 'Provide full relative path of page. Must be unique.'
    },
    created: {
        type: Date,
        default: Date.now
    },
    first_published: Date,
    last_published: Date,
    content: [
        {type: ObjectId, ref: 'Content'}
    ]
});

module.exports = mongoose.model('Page', pageSchema);