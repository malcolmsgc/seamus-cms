const mongoose = require('mongoose');
const Page = mongoose.model('Page');
// const promisify = require('es6-promisify');
const { deleteEmptyFields } = require('../helpers');


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