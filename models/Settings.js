const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// mongoose.Promise = global.Promise;
const validator = require('validator');
const beautifyUnique = require('mongoose-beautiful-unique-validation');


/** @constructor contentTypesSchema 
 * contentTypesSchema is a child of settingsSchema. It contains booleans to show what syntax an administrator allows users to use for text input  */
const contentTypesSchema = new Schema(
    {
        markdown: {
            type: Boolean,
            default: false
        },
        json: {
            type: Boolean,
            default: false
        },
        html: {
            type: Boolean,
            default: false
        },
        ejs: {
            type: Boolean,
            default: false
        },
        pug: {
            type: Boolean,
            default: false
        },
        jsx: {
            type: Boolean,
            default: false
        }
    }
);

const settingsSchema = new Schema({
    sitename: {
        type: String,
        required: 'A site name is required',
        trim: true
    },
    root_path: {
        type: String,
        trim: true,
        required: 'A root path (usually the domain name) is required',
        validate: [validator.isFQDN, {require_tld: false}]
    },
    extended_syntax: {
        type: contentTypesSchema,
        required: 'No extended sytax settings set'
    },
    multipage: {
        type: Boolean,
        required: 'Single- / multi-page setting not set',
        default: false
    }
},{ id: false }); //prevent auto generation of id to have more control in restricting collection to a single document

settingsSchema.plugin(beautifyUnique);

module.exports = mongoose.model('Setting', settingsSchema);