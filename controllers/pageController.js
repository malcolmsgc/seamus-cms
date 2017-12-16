const mongoose = require('mongoose');
const Page = mongoose.model('Page');
const Settings = mongoose.model('Setting');
// const promisify = require('es6-promisify');
const { deleteEmptyFields } = require('../helpers');
const settingsID = mongoose.Types.ObjectId(process.env.APP_SETTINGS_ID);
// const settingsID = process.env.APP_SETTINGS_ID;

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

exports.savePageMeta = async (req, res) => {
    const pageMeta = deleteEmptyFields(req.body);
    const page = await (new Page(pageMeta)).save();
    req.flash('success', `Page created for ${page.title}`);
    res.redirect('/addpage/2');
    // res.json({...req.body, pageMeta});
};

exports.savePageSchema = (req, res) => {
    res.send('👷🏼‍ Under construction');
};