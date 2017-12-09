const mg = require('mongoose');
const Schema = mg.Schema;
mg.Promise = global.Promise;
const md5 = require('md5');
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
 email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Invalid email address'],
    required: 'Please supply an email address'
 },
 name: {
     type: String,
     required: 'Please supply a name',
     trim: true
 },
 resetPasswordToken : String,
 resetPasswordExpires: Date,
 hearts: [
     { type: mg.Schema.ObjectId, ref: 'Store' }
 ]
});

userSchema.virtual('gravatar').get(function() {
    const hash = md5(this.email);
    return `https://gravatar.com/avatar/${hash}?s=200`;
});
userSchema.plugin(passportLocalMongoose, { usernameField: 'email'});
userSchema.plugin(mongodbErrorHandler);

module.exports = mg.model("User", userSchema);