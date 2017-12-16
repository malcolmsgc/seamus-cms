const mongoose = require('mongoose');
const Page = mongoose.model('Page');
const Settings = mongoose.model('Setting');
// const promisify = require('es6-promisify');
const { deleteEmptyFields } = require('../helpers');
const settingsID = mongoose.Types.ObjectId(process.env.APP_SETTINGS_ID);
// const settingsID = process.env.APP_SETTINGS_ID;

exports.saveSettings = async (req, res) => {
    // NEED TO LOCK ID AS ONLY ONE DOCUMENT
    // Create new settings object
    const { markdown, html, ejs, pug, jsx } = req.body;
    const newSettings = {...req.body};
    newSettings._id = settingsID;
    newSettings.extended_syntax = { markdown, html, ejs, pug, jsx };
    // check if any document exists
    const currentSettings = await Settings.find({ _id: settingsID });
    // if it doesn't exist create it
    if (!currentSettings) {
        await (new Settings(newSettings)).save();
        req.flash('success', `Settings saved`);
        res.redirect('/');
    }
    // if it exists, update it
    else {
        res.send("Yo homey");
    }
    return;
    
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