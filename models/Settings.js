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
    site_host: {
        type: String,
        trim: true,
        required: 'A base URL for the site being content managed is required. It must include a host name.',
        validate: {
            validator: validator.isURL,
            message: 'Must be url that includes hostname'
        }
    },
    seamus_host: {
        type: String,
        trim: true,
        required: 'A base URL for Seamus is required. It must include a host name.',
        validate: {
            validator: validator.isURL,
            message: 'Must be url that includes hostname'
        }
    },
    extended_syntax: {
        type: contentTypesSchema,
        required: 'No extended sytax settings set'
    },
    multipage: {
        type: Boolean,
        required: 'Single- / multi-page setting not set',
        default: false
    },
    globalsPage: {
        type: Schema.ObjectId,
        ref: 'Page'
    }
},{ id: false }); //prevent auto generation of id to have more control in restricting collection to a single document

settingsSchema.plugin(beautifyUnique);

module.exports = mongoose.model('Setting', settingsSchema);