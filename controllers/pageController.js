const mongoose = require('mongoose');
const Page = mongoose.model('Page');
const Settings = mongoose.model('Setting');
const Content = mongoose.model('Content');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');
const { check, body, validationResult } = require('express-validator/check');
const { matchedData, sanitizeBody } = require('express-validator/filter');
// const promisify = require('es6-promisify');
const { deleteEmptyFields, emptyString } = require('../helpers');
const ObjectId = mongoose.Types.ObjectId;
const mgIdIsValid = ObjectId.isValid;
const settingsID = ObjectId(process.env.APP_SETTINGS_ID);

const imgUploadOptions = {
    storage: multer.memoryStorage(),
    fileFilter(req, file, cb) {
        const isImage = file.mimetype.startsWith('image/');
        /** @todo add customisable settings */
        if (isImage) {
            cb(null, true);
        }
        else {
            cb({ message: 'That filetype is not supported for this content section' }, false);
        }
    }
};

exports.imgUpload = multer(imgUploadOptions).array('image');

exports.imgWrite = async (req, res, next) => {
    if (!req.files.length) {
        next();
        return;
    }
    const errors = [];
    const images = [];
    req.files.forEach(async (img) => {
        try {
            const ext = img.mimetype.split('/')[1];
            const filename = `${uuid.v4()}.${ext}`;
            images.push(filename);
            const photo = await jimp.read(img.buffer);
            // limit images by pixel widthElements. 5120px is largest retina display as of 2017
            /** @todo make max image width/size (can restrict with multer) allowable configurable by admin */
            if (photo.bitmap.width > 5120) {
                await photo.resize(5120, jimp.AUTO);
            };
            await photo.write(`./public/uploads/gallery/originals/${filename}`);
        }
        catch (err) {
            errors.push(err);
            console.error(err);
        }
    });
    req.body.images = images;
    if (errors.length) {
        errors.forEach((err) => req.flash('error', err.message));
        res.redirect('back');
        return;
    }
    next();
    return;
};

/** @todo santize, esp important as bulk operations bypass moongoose validators and cannot run them independatly in this case without much more faff */
exports.massageRawContent = (req, res, next) => {
    const newBody = {...req.body};
    const idArr = Object.keys(newBody);
    const docsArr = [];
    for (const key of idArr) {
        // handle images as a special case. Use 'images' array as this will only appear when new images selected by user
        if (key === "images") {
            // loop through image_ids array and match up with content in images array
            newBody.image_ids.forEach( (id, index) => {
                const filename = newBody.images[index];
                if (filename) {
                    const doc = {};
                    doc._id = ObjectId(id);
                    const content = filename;
                    doc.$set = { content };
                    docsArr.push(doc);
                }
            } );
        }
        // images already dealt with so we skip it.
        else if (key === "image_ids") { continue; }
        else {
            const doc = {};
            doc._id = ObjectId(key);
            doc.$set = { content: `${newBody[key][0]}` };
            docsArr.push(doc); 
        }
    }
    req.body = docsArr;
    next();
    return;
};

exports.saveContent = async (req, res, next) => {
    const documents = [...req.body];
    const bulkResponse = await bulkSave(documents, Content, '_id', false);
    if (bulkResponse.writeErrors) {
        console.error('Write error within pageController.saveContent using bulkSave function\n' + bulkResponse.writeErrors);
        const err = new Error('Error saving. Please try again. If error persists please contact an administrator.');
        err.status = 500;
        next(err);

    }
    if (bulkResponse.writeConcernErrors) {
        console.error('Write concern error within pageController.savePageSchema using bulkSave function\n' + bulkResponse.writeErrors);
        const err = new Error('Error saving. Please try again. If error persists please contact an administrator.');
        err.status = 500;
        next(err);
    }
    else {
        //on success, redirect to page edit screen
        console.log(`MongoDB bulk execution response -- ok: ${bulkResponse.ok}`);
        req.flash('success', `Your content changes have been published.`);
        const timestamp = Date.now();
        const newDoc = await Page.timestampQuery(req.params.pageId, 'last_published', timestamp).exec();
        if (!newDoc.first_published) {
            await Page.timestampQuery(req.params.pageId, 'first_published', timestamp).exec();
        }
        res.redirect(`/page/${req.params.pageId}`);
    }
    return;
}

/** @function fetchPages
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 * @summary Loads console and page summaries
 * Fetches pages from DB and sends page info to console view, which is then rendered
 * Default sort
 */
exports.fetchPages = async (req, res, next) => {
    const sortBy = req.query.sort || "last_published";
    const sortAsc = req.query.asc || 1;
    console.log('fetching existing pages');
    // const paginationPage = req.params.page || 1;
    // const limit = 6;
    // const skip = (paginationPage * limit) - limit;
    const pagesPromise = Page.find({})
        .sort({ [sortBy]: [sortAsc] });
    // .skip(skip)
    // .limit(limit)
    const countPromise = Page.count();
    const [pages, count] = await Promise.all([pagesPromise, countPromise]);
    // const numPages = Math.ceil(count / limit); //for console pagination, not number of pages to content manage
    // if (!pages.length && skip) {
    //     req.flash('info', `You asked for page ${page} but it doesn't exist. You have been taken to the last page.`);
    //     res.redirect(`/stores/page/${numPages}`);
    //     return;
    // }
    res.render('console', { title: "Console", pages, count });
    return;
}


/** @function fetchPage
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 * @summary Loads page content into view user can use to edit content
 * Fetches page from DB and sends page info to 'edit' view, which is then rendered
 */
exports.fetchPage = async (req, res, next) => {
    const page = await Page.findOne({ _id: req.params.pageId })
        .populate({
            path: 'content',
            options: { sort: { index: 1 } }
        })
        .exec();
    res.render('contentManagePage', { title: "Edit page content", page });
    return;
}


/** @function saveSettings
 * @param {Object} req
 * @param {Object} res
 * @constant settingsID
 * saves global app settings from a POST from the settings form.
 * Values stored as doc in settings collection. settingsID always used as _id to prevent additional documents being created. 
 * @todo refactor the two different DB queries into a single upsert using find/findOne
 * @todo add sitename to app locals to be used within a session
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

exports.saveNewPageMeta = async (req, res) => {
    const pageMeta = deleteEmptyFields(req.body);
    const page = await (new Page(pageMeta)).save();
    req.flash('success', `Page created for ${page.title}`);
    res.redirect(`/addpage/2?pid=${page._id}`);
};

exports.savePageMeta = async (req, res) => {
    req.body._id = req.params.pageId;
    const pageMeta = new Page(deleteEmptyFields(req.body));
    const page = await Page.findOneAndUpdate(
        // query
        { _id: req.params.pageId },
        // new doc
        pageMeta,
        // options
        { runValidators: true, new: true });
    req.flash('success', `Page details for '${page.title}' updated`);
    res.redirect(`/page/${req.params.pageId}`);
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
    const result = ObjectId.isValid(req.pid) ?
        await Page.findById(req.pid, { id: 1, title: 1 })
        : null;
    if (result) {
        res.locals.pageTitle = result.title;
        next();
        return;
    }
    else {
        req.flash('error', 'You tried to edit a page that does not yet exist. Please add the page first or edit an existing page.');
        res.redirect(`/`);
    }
};


exports.pageSchemaSaveSwitch = (req, res, next) => {
    const indexVal = req.body.index;
    //check if single content section submitted. Check for string should suffice but added number in case some browser does some weird parsing.
    req.singleSectionSave = (typeof indexVal === "string" || typeof indexVal === "number");
    next();
}

const abstractContentRules = (reqData = {}, pageId, loopIndex = null) => {
    const contentSchema = { ...reqData };
    const formFields = Object.keys(contentSchema);
    const rulesFieldRegex = /^(min)|^(max)|^(rule)/;
    const doc = {
        rules: []
    };
    doc.page = pageId;
    /** @todo LOW PRIORITY - extend how this handles rules to that multiple rules may be handled
     * keeping it simplish to start with and hardcoding it to a single rule but should have a base structure to easily refactor to accomodate more whenever needed
     */
    let ruleset = {};
    formFields.forEach((field) => {
        // move rules into embedded-object
        //different loop for single vs mulitp section
        // first deal with multi, i.e. has loopIndex
        if (typeof loopIndex === 'number') {
            if (rulesFieldRegex.test(field))
                ruleset[field] = contentSchema[field][loopIndex];
            else doc[field] = contentSchema[field][loopIndex];
        }
        // else deal with single section
        else {
            if (rulesFieldRegex.test(field))
                ruleset[field] = contentSchema[field];
            else doc[field] = contentSchema[field];
        }
    });
    ruleset = deleteEmptyFields(ruleset);
    // if no rules delete the key on the doc
    if (!Object.keys(ruleset).length) delete doc.rules;
    else {
        // add rules to array
        doc.rules.push(ruleset);
    }
    return doc;
}

exports.savePageSchema = async (req, res, next) => {
    // If only one content section to save pass to next function: SavePageSchemaSingle
    // This is because multi-section save uses array methods that fail on a Number
    // SavePageSchemaSingle performs a single operation DB query whereas savePageSchema performs a bulk one
    if (req.singleSectionSave) {
        next()
        return;
    }
    // Continue with multi document handling
    // take copy of submitted form
    const contentSchema = { ...req.body };
    //check if any indexes. Indexes required by Model. If not assigned by user these need to be programatically assigned.
    const { index: indexes } = contentSchema;
    // sort ascending and take first (lowest) and last (highest) value
    const indexesSorted = [...indexes].sort((a, b) => a > b);
    const lowestIndex = parseInt(indexesSorted[0]);
    let highestIndex = parseInt(indexesSorted[indexesSorted.length - 1]);
    // if no indexes lowest index should be falsy (NaN or null) after parseInt
    // needs check for highest/lowest index of 0 which is also falsy
    if (lowestIndex != 0 && !lowestIndex) {
        // if both lowest and highest values are falsy it means no indexes were given
        if (highestIndex != 0 && !highestIndex) {
            console.log('no indexes supplied');
            //transform sorted array's values to be the array index
            contentSchema.index = indexes.map((item, index) => index);
        }
        // if no lowest value but highest value exists then some but not all indexes given
        else {
            console.log('some indexes supplied. Some are absent');
            // keep existing indexes. Where no int supplied as index add an index by incrementing the previous highestIndex
            contentSchema.index = indexes.map((item, index) => {
                const parsed = parseInt(item);
                if (parsed === 0 || parsed)
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
    const mgValidationErrors = [];
    const documents = contentSchema.index.reduce((docs, schemaIndex, index) => {
        const rulesFieldRegex = /^(min)|^(max)|^(rule)/;
        const doc = abstractContentRules(contentSchema, req.params.pageId, index);
        // check for existing ID. Create new id if none exists
        // not really nec if using mongoose model as constructor but leaving check for id in case mongoose schema put aside for some reason. Basically, I'm doing a little foolproofing.
        if (!doc._id) {
            doc._id = new mongoose.Types.ObjectId();
            console.log(`new Mongo ID added: ${doc._id}`);
        }
        // Use model as constructor
        // careful with this as will create new _ids if none exist already
        const mgDoc = new Content(deleteEmptyFields(doc));
        // run mongoose validators
        const vErr = mgDoc.validateSync();
        // push into validation errors array if error returned
        if (vErr) mgValidationErrors.push(vErr);
        // add to reduce's accumulator array
        docs.push(mgDoc);
        return docs;
    }, []);
    if (mgValidationErrors.length) {
        mgValidationErrors.forEach((errObj) => {
            console.error("--ERROR--");
            console.error(errObj);
            req.flash('error', `Server response: ${errObj.message}`);
        });
        res.redirect('back');
        return;
    }
    // TEST IT'S WORKING -- Next 2 lines
    // res.json(documents);
    // return;
    const bulkResponse = await bulkSave(documents, Content, '_id');
    if (bulkResponse.writeErrors) {
        console.error('Write error within pageController.savePageSchema using bulkSave function' + bulkResponse.writeErrors);
        const err = new Error('Error saving. Please try again. If error persists please contact an administrator.');
        err.status = 500;
        next(err);

    }
    if (bulkResponse.writeConcernErrors) {
        console.error('Write concern error within pageController.savePageSchema using bulkSave function' + bulkResponse.writeErrors);
        const err = new Error('Error saving. Please try again. If error persists please contact an administrator.');
        err.status = 500;
        next(err);
    }
    else {
        //on success, redirect to page edit screen
        console.log(`MongoDB bulk execution response -- ok: ${bulkResponse.ok}`);
        req.flash('success', `Page content settings saved`);
        res.redirect(`/page/${req.params.pageId}`);
    }
    return;
};

exports.savePageSchemaSingle = async (req, res, next) => {
    const contentSchema = { ...req.body };
    // assign content section index
    contentSchema.index = parseInt(contentSchema.index) || 0;
    let doc = abstractContentRules(contentSchema, req.params.pageId);
    if (!doc._id) {
        doc._id = new mongoose.Types.ObjectId();
        console.log(`new Mongo ID added: ${doc._id}`);
    }
    doc = deleteEmptyFields(doc);
    const result = await Content.findOneAndUpdate({ _id: doc._id }, doc, { upsert: true, new: true, runValidators: true }).exec();
    req.flash('success', `Page content settings saved`);
    res.redirect(`/page/${req.params.pageId}`);
}


/** 
 * @function bulkSave
 * Bulk-upsert an array of records
 * @param  {Array}    documents  List of records to update
 * @param  {Model}    Model    Mongoose model to update
 * @param  {Object}   match    Database field to match
 * @return {Promise}  always resolves a BulkWriteResult
 */
// Adapted from answer given by konsumer on S.O. (https://stackoverflow.com/questions/25285232/bulk-upsert-in-mongodb-using-mongoose)
function bulkSave(documents, Model, match, doUpsert = true) {
    match = match || '_id';
    return new Promise((resolve, reject) => {
        const bulk = Model.collection.initializeUnorderedBulkOp();
        documents.forEach((document) => {
            const query = {};
            query[match] = document[match];
            if (doUpsert) {
                bulk.find(query).upsert().updateOne(document);
            }
            else {
                // Intended for bulk $set so need to remove id from document or will fail. See shape of document passed from massageRawContent.
                console.log('setting content for ' + document._id);
                delete document._id;
                bulk.find(query).updateOne(document);
            }
        });
        bulk.execute((err, bulkres) => {
            if (err) return reject(err);
            resolve(bulkres);
        });
    });
}

// DELETIONS
    /** @todo this should probably be moved to api  */
exports.deleteContentSection = async (req, res, next) => {
    const returned = await Content.findByIdAndRemove(req.params.contentId).exec();
    res.json(returned);
};



