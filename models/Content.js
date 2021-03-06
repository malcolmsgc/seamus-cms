const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// mongoose.Promise = global.Promise;
const validator = require('validator');
const beautifyUnique = require('mongoose-beautiful-unique-validation');

/** @property rules {array}
     *  @constructs contentRulesSchema
     *  stores information about rules, instructions and restrictions on content
     * All values are optional in the model. Some defaults may be applied for specific data types. e.g. Images will be restricted on only one axis.
     * IMPORTANT: Rules do not imply validation or enforcement. The 'rule' field will be displayed to user. Other values are intended for processing. 
     * @todo add form validation based on rules
     * @example {
     * rule: "The hero image must be at least 600px wide. Larger images will be cropped to 800px width.",
     *  max_value: 800,
     *  max_unit: 'px',
     *  min_unit: 'px',
     *  max_apply_to: 'width',
     *  min_apply_to: 'width
     * }
     */
const contentRulesSchema = new Schema({
        rule: String,
        max_value: Number,
        min_value: Number,
        max_unit: String,
        min_unit: String,
        max_apply_to: String,
        min_apply_to: String
});

const contentSchema = new Schema({
    page: {
        type: Schema.ObjectId,
        ref: 'Page',
        required: 'Content must include a page _id'
    },
    //title of the section. User given name of the section, not its content
    title: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: validator.isAscii,
            message: 'Only ASCII characters allowed in title'
        },
        maxLength: [30, 'The value of `{PATH}` (`{VALUE}`) exceeds the maximum allowed length ({MAXLENGTH}).']
    },
    /** 
     * @property index {number}
     * index field is intended for any custom ordering within CMS
     * by default the content shown for a page will be ordered by index
     * @todo draggable UI that makes index ordering automagical
    */
    index: {
        type: Number,
        min: 0,
        required: 'An index for a content section must be recorded'
    },
    /** @property {string} type
     * type specifies the type of content. Possible values are:
     * 
     * Not all types are necessarily available to a user. Some may be restricted.
     * Image is anything with the image mimetype. 
     * Svg isn't supported unless added as html
     * Video and audio are not supported
     * 
     * type will determine what input field is provided to user
     */
    type: {
        type: String,
        enum: [ 'image','text','html','md','ejs','pug','jsx','heading' ],
        required: 'You must supply your selection for the type of content'
    },
    /** @property rules {array}
     *  @extends contentRulesSchema
     *  stores information about rules, instructions and restrictions on content
     * All values are optional in the model. Some defaults may be applied for specific data types. e.g. Images will be restricted on only one axis.
     * IMPORTANT: Rules do not imply validation or enforcement. The 'rule' field will be displayed to user. Other values are intended for processing.
     */
    rules: [contentRulesSchema],
    /** @property css_selector
     * intended to be available in some API calls for easy and possibly automated assignment of content to container nodes
     * @todo add validation on front end to add warning to user presubmission and to allow duplicates in the DB instead of strictly preventing them
     */
    css_selector: {
        type: String,
        trim: true
        // unique: true
    },
    content: {
        type: String
    },
    dirname: {
        type: String,
        validate: {
            validator: validator.isURL,
            options: {
                require_tld: false,
                require_protocol: false,
                require_host: false,
                require_valid_protocol: false,
                allow_underscores: true,
                allow_protocol_relative_urls: true 
            },
            message: 'A valid URL path is required. Omit protocol, host and filename.'
        }
    }
});

contentSchema.index({
    title: 'text',
    content: 'text'
});

contentSchema.statics.getContentBySelectors = function (query) {
    query = query || {};
    return this.aggregate([
        { $lookup: { from: 'pages',
        localField: 'page',
        foreignField: '_id',
        as: 'page'
        }},
        { $match: query },
        { $project: { 
            _id : 0,
            content : 1,
            css_selector: 1
        }}
    ]);
};

contentSchema.plugin(beautifyUnique);

module.exports = mongoose.model('Content', contentSchema);