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
    const newSettings = { ...req.body };
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

exports.savePageSchema = async (req, res, next) => {
    //if ID invalid throw error and return
    if (!mgIdIsValid(req.params.pageId)) {
        const err = new Error('Page ID is invalid');
        err.status = 400;
        next(err);
        return;
    }
    //take copy of submitted form
    let contentSchema = {...req.body};
    //check if any indexes. Indexes required by Model. If not assigned by user these need to be programatically assigned.
    console.log(req.body);
    const { index: indexes } = contentSchema;
    // sort ascending and take first (lowest) and last (highest) value
    const indexesSorted = indexes.sort((a, b) => a > b );
    const lowestIndex = parseInt( indexesSorted[0] );
    const highestIndex = parseInt( indexesSorted[indexesSorted.length - 1] );
    // if no indexes lowest index should be falsy (NaN or null) after parseInt
    if (!lowestIndex) {
        // if both lowest and highest values are falsy it means no indexes were given
        if (!highestIndex) {
            console.log('no indexes supplied');
            //transform sorted array's values to be the array index
            contentSchema.index = indexes.map( (item, index) => index );
        }
        // if no lowest value but highest value exists then some but not all indexes given
        else {
            console.log('some indexes supplied. Some are absent');
        }
    }
    // if both highest and lowest values present then all indexes should be present and function can proceed
    else {
        console.log('all indexes present.');
    }
    res.json(contentSchema);

    
    // if all indexes provided continue
    // if some indexes provided find highest and fill in the rest incrementally
    //MODEL REQUIRES INDEX SO MUST BE SET PROGRAMATICALLY IF ABSENT
    // iterate over req.body and bundle into separate objects (make a constructor?)
    //delete empty fields
    // band off request/s to DB
    res.end();
    // res.redirect(`/`);
    //on success, redirect to page edit screen
};


/** 
 * @function bulkSave
 * Bulk-upsert an array of records
 * @param  {Array}    documents  List of records to update
 * @param  {Model}    Model    Mongoose model to update
 * @param  {Object}   match    Database field to match
 * @return {Promise}  always resolves a BulkWriteResult
 */
// Adapted from answer given by konsumer on SO (https://stackoverflow.com/questions/25285232/bulk-upsert-in-mongodb-using-mongoose)
function bulkSave(documents, Model, match) {
    match = match || '_id';
    return new Promise((resolve, reject) => {
        const bulk = Model.collection.initializeUnorderedBulkOp();
        documents.forEach((document) => {
            var query = {};
            query[match] = record[match];
            bulk.find(query).upsert().updateOne(document);
        });
        bulk.execute(function (err, bulkres) {
            if (err) return reject(err);
            resolve(bulkres);
        });
    });
}