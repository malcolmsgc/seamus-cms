const mongoose = require('mongoose');
const mgIdIsValid = mongoose.Types.ObjectId.isValid;
const Page = mongoose.model('Page');
const Settings = mongoose.model('Setting');
// const promisify = require('es6-promisify');
const { deleteEmptyFields } = require('../helpers');
const settingsID = mongoose.Types.ObjectId(process.env.APP_SETTINGS_ID);

exports.saveSettings = async (req, res) => {
    // Create new settings object
    const { markdown, html, ejs, pug, jsx } = req.body;
    const newSettings = {...req.body};
    newSettings._id = settingsID;
    newSettings.extended_syntax = { markdown, html, ejs, pug, jsx };
    // check if the document already exists
    const currentSettings = await Settings.find({ _id: settingsID });
    // if it doesn't exist create it
    if (!currentSettings.length) {
        await (new Settings(newSettings)).save();
        req.flash('success', `Settings saved`);
        req.flash('info', `Next, create a page`);
        res.redirect('/');
    }
    // if it exists, update it
    else {
        await Settings.findOneAndUpdate({ _id: settingsID }, newSettings, { new: true, runValidators: true }).exec();
        req.flash('success', `Settings updated`);
        res.redirect('back');
    }
};

/** @todo either a separate function or an adaption to this one to allow editing. Will need page ID */
exports.saveNewPageMeta = async (req, res) => {
    const pageMeta = deleteEmptyFields(req.body);
    const page = await (new Page(pageMeta)).save();
    req.flash('success', `Page created for ${page.title}`);
    res.redirect(`/addpage/2?pid=${page._id}`);
    // res.json({...page, ...req.body, ...res.locals});
};


/** @function checkPageExists
 * validation of page's existence
 * Id for page document is taken from either query string or url param and added to request as req.pid.
 * Id structure is validated (if not mongoose returns ugly cast error)
 * Query by id to see if document exists
 * @throws error flash message if id invalid or if document doesn't exist.
 */
exports.checkPageExists = async (req, res, next) => {
    if (req.params.step !== '2') {
        next();
        return;
    }
    req.pid = req.query.pid || req.params.pageId;
    // check if id is properly formed and document for page exists
    const result = mgIdIsValid(req.pid) ? 
        await Page.findById(req.pid, { id: 1 })
        : null;
    if (result) { 
        next();
        return;
    }
    else {
        req.flash('error', 'You tried to edit a page that does not yet exist. Please add the page first or edit an existing page.');
        res.redirect(`/`);
    }
};

exports.savePageSchema = (req, res) => {
    //check page exists - redirect if not
    console.log(req.params.pageId);
    const formatted = {};
    res.redirect(`/`);
};