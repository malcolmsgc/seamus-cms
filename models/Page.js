const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// mongoose.Promise = global.Promise;
const validator = require('validator');
const beautifyUnique = require('mongoose-beautiful-unique-validation');

const pageSchema = new Schema({
    title: {
        type: String,
        trim: true,
        validate: {
            validator: validator.isAscii, 
            message: 'Only ASCII characters allowed in page title'
        },
        default: 'Untitled Page'
    },
    subtitle: {
        type: String,
        trim: true,
        validate: {
            validator: validator.isAscii, 
            message: 'Only ASCII characters allowed in page subtitle'
        }
    },
    /** 
     * @property index {number}
     * index field is intended for any custom ordering within CMS
    */
    index: {
        type: Number,
        min: 0,
        default: 0
        // unique: true
    },
    rel_path: {
        type: String,
        trim: true,
        lowercase: true,
        unique: 'The relative path "{VALUE}" has already been used. Please supply a unique path.',
        required: 'Provide full relative path of page. Must be unique.'
    },
    /**
     * @property created {date}
     * date CMS page was created
     */
    created: {
        type: Date,
        default: Date.now
    },
    /**
     * @property first_published {date}
     * date content first submitted
     */
    first_published: Date,
    /**
     * @property last_published {date}
     * date content most recently submitted
     */
    last_published: Date
}, 
// MODEL OPTIONS
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

/** @property content {object}
 * A page's content as virtual field on the Page model. 
 * Requires populate() on request.
 */
pageSchema.virtual('content', {
    ref: 'Content',
    localField: '_id',
    foreignField: 'page'
});

pageSchema.index({
    title: 'text',
    subtitle: 'text',
    rel_path: 'text'
});

pageSchema.statics.timestampQuery = function (id, field, val) {
    return this.findOneAndUpdate({ _id: id },
    { $set: { [field]: val } },
    { runValidators: true, new: true });
};

pageSchema.plugin(beautifyUnique);

module.exports = mongoose.model('Page', pageSchema);