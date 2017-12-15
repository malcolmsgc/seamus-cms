const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// mongoose.Promise = global.Promise;
const md5 = require('md5');
const validator = require('validator');
/** @requires mongoose-beautiful-unique-validation
 * mongoose-mongodb-errors is npm module used in User model to provide human readable error messages in case of a duplicate key, which in this case is the user's email address.
 */
const beautifyUnique = require('mongoose-beautiful-unique-validation');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    email: {
        type: String,
        unique: '{VALUE} has already been used.',
        lowercase: true,
        trim: true,
        validate: [validator.isEmail, 'Invalid email address'],
        required: 'Please supply an email address'
    },
    firstname: {
        type: String,
        required: 'Please supply a first name',
        trim: true
    },
    lastname: {
        type: String,
        required: 'Please supply a last name',
        trim: true
    },
    /** @property role
     * Options are 'editor' or 'administrator'
     * Roles are mutually exclusive
     * Should be set as lowercase but will be normalised to lowercase
     * Editor can manage content only
     * Administrator can manage content and also manage users, API settings, and set the schema for the content
     */
    role: {
        type: String,
        lowercase: true,
        enum: { 
            values: ['editor', 'administrator'],
            message: 'enum validator failed for path `{PATH}`. Allowed values are ["editor", "administrator"].'
        },
        required: "User must be assigned a role"
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

userSchema.virtual('gravatar').get(function () {
    const hash = md5(this.email);
    return `https://gravatar.com/avatar/${hash}?s=200`;
});

userSchema.static.adminExists = function() {
    const numAdmins = this.find({ role: 'administrator'}).count();
    return numAdmins > 0;
};


userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });
userSchema.plugin(beautifyUnique);

module.exports = mongoose.model('User', userSchema);