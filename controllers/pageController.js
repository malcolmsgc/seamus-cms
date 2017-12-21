const mongoose = require('mongoose');
const mgIdIsValid = mongoose.Types.ObjectId.isValid;
const Page = mongoose.model('Page');
const Settings = mongoose.model('Setting');
const Content = mongoose.model('Content');
// const promisify = require('es6-promisify');
const { deleteEmptyFields } = require('../helpers');
const settingsID = mongoose.Types.ObjectId(process.env.APP_SETTINGS_ID);

/** @function saveSettings
 * @param {Object} req
 * @param {Object} res
 * @constant settingsID
 * saves global app settings from a POST from the settings form.
 * Values stored as doc in settings collection. settingsID always used as _id to prevent additional documents being created. 
 * @todo refactor the two different DB queries into a single upsert using find/findOne
 */
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

/** @todo handle singleSectionSave
 *  Split function into different middleware
 * @todo ensure _id captured and brought through for each content section when updating
 */
exports.savePageSchema = async (req, res, next) => {
    //if ID invalid throw error and return
    if (!mgIdIsValid(req.params.pageId)) {
        const err = new Error('Page ID is invalid');
        err.status = 400;
        next(err);
        return;
    }
    //take copy of submitted form
    const contentSchema = {...req.body};
    //check if any indexes. Indexes required by Model. If not assigned by user these need to be programatically assigned.
    const { index: indexes } = contentSchema;
    //check if single content section submitted. Check for string should suffice but added number in case some browser does some weird parsing.
    const singleSectionSave = (typeof indexes === "string" || typeof indexes === "number");
    console.log({singleSectionSave});
    if (singleSectionSave) {
        res.json(req.body);
        return;
    }
    // sort ascending and take first (lowest) and last (highest) value
    const indexesSorted = indexes.sort((a, b) => a > b );
    const numDocs = indexesSorted.length;
    const lowestIndex = parseInt( indexesSorted[0] );
    let highestIndex = parseInt( indexesSorted[numDocs - 1] );
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
            // keep existing indexes. Where no int supplied as index add an index by incrementing the previous highestIndex
            contentSchema.index = indexes.map( (item, index) => {
                const parsed = parseInt(item);
                if (parsed) 
                    return parsed;
                else
                    return ++highestIndex;
            });
        }
    }
    // if both highest and lowest values present then all indexes should be present and function can proceed
    else {
        console.log('all indexes present.');
    }
    // iterate over contentSchema and turn into array of document objects
    // get keys of form object - checked every time in case of Model / form updates
    const formFields = Object.keys(contentSchema);
    const documents = contentSchema.index.reduce( (docs, schemaIndex, index ) => {
        const doc = {};
        formFields.forEach( (field) => {
            doc[field] = contentSchema[field][index]
        });
        const mgDoc = new Content(doc); //careful with this as will create new _ids if none exist already
        docs.push(mgDoc);
        return docs;
    }, []);

    res.json(documents);
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