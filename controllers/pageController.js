const mongoose = require('mongoose');
const mgIdIsValid = mongoose.Types.ObjectId.isValid;
const Page = mongoose.model('Page');
const Settings = mongoose.model('Setting');
const Content = mongoose.model('Content');
// const promisify = require('es6-promisify');
const { deleteEmptyFields, emptyString } = require('../helpers');
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

// ADAPT FOR FORM
exports.validateContentSchema = (req, res, next) => {
    req.sanitizeBody('firstname');
    req.checkBody('firstname', 'You must supply a first name').notEmpty();
    req.sanitizeBody('lastname');
    req.checkBody('lastname', 'You must supply a last name').notEmpty();
    req.checkBody('email', 'That email is not valid').isEmail();
    req.sanitizeBody('email').normalizeEmail({
        remove_dots: false,
        remove_extension: false,
        gmail_remove_sunaddress: false
    });
    req.checkBody('password', 'Password cannot be blank').notEmpty();
    req.checkBody('confirm-password', 'Confirm password cannot be blank').notEmpty();
    req.checkBody('confirm-password', 'Passwords do not match').equals(req.body.password);

    const errors = req.validationErrors();
    if (errors) {
        req.flash('error', errors.map(err => err.msg));
        res.render('register', { title: 'Register', body: req.body, flashes: req.flash() });
        return;
    }
    next();
};

/** @todo handle singleSectionSave
 *  Split function into different middleware
 * @todo ensure _id captured and brought through for each content section when updating
 */
exports.savePageSchemaPrep = (req, res, next) => {
    //if ID invalid throw error and return
    if (!mgIdIsValid(req.params.pageId)) {
        const err = new Error('Page ID is invalid');
        err.status = 400;
        next(err);
        return;
    }
    const indexVal = req.body.index;
    //check if single content section submitted. Check for string should suffice but added number in case some browser does some weird parsing.
    req.singleSectionSave = (typeof indexVal === "string" || typeof indexVal === "number");
    // console.log({singleSectionSave});
    // req.singleSectionSave = singleSectionSave;
    next();
}

exports.savePageSchema = async (req, res, next) => {
    // If only one content section to save pass to next function: SavePageSchemaSingle
    // SavePageSchemaSingle performs a single operation DB query whereas savePageSchema performs a bulk one
    if (req.singleSectionSave) {
        next()
        return;
    }
    // Continue with multi document handling
    // take copy of submitted form
    const contentSchema = {...req.body};
    //check if any indexes. Indexes required by Model. If not assigned by user these need to be programatically assigned.
    const { index: indexes } = contentSchema;
    // sort ascending and take first (lowest) and last (highest) value
    const indexesSorted = indexes.sort((a, b) => a > b );
    const lowestIndex = parseInt( indexesSorted[0] );
    let highestIndex = parseInt( indexesSorted[indexesSorted.length - 1] );
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
    const validationErrors = [];
    const documents = contentSchema.index.reduce( (docs, schemaIndex, index ) => {
        const rulesFieldRegex = /^(min)|^(max)|^(rule)/;
        const doc = {};
        doc.page = req.params.pageId;
        /** @todo LOW PRIORITY - extend how this handles rules to that multiple rules may be handled
         * keeping it simplish to start with and hardcoding it to a single rule but should have a base structure to easily refactor to accomodate more whenever needed
         */
        const rules = [{}];
        formFields.forEach( (field) => {
            // move rules into embedded-object
            if (rulesFieldRegex.test(field)) {
                rules[0][field] = contentSchema[field][index];
            }
            else doc[field] = contentSchema[field][index]
        });
        doc.rules = deleteEmptyFields(rules[0]);
        // console.log(rules);
        // check for existing ID. Create new id if none exists
        // not really nec if using mongoose model as constructor but leaving check for id in case mongoose schema put aside for some reason. Basically, I'm doing a little foolproofing.
        if (!doc._id) {
            doc._id = new mongoose.Types.ObjectId();
            console.log(`new Mongo ID added: ${doc._id}`);
        }
        const mgDoc = new Content(deleteEmptyFields(doc)); //careful with this as will create new _ids if none exist already
        // run mongoose validators
        
        // const vErr = mgDoc.validateSync();
        // validationErrors.push(vErr.errors);
        
        docs.push(mgDoc);
        return docs;
    }, []);
    if (validationErrors.length) {
        validationErrors.forEach( (errObj) => {
            console.error(errObj);
        });
        req.flash('error', 'Model validation failed');
        res.redirect('back');
        return;
    }
    // res.json(documents);
    // return;
    //delete empty fields - not necessary if we can use Content model constructor
    // hand off request/s to DB
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
        console.log(`MongoDB bulk execution response -- ok: ${bulkResponse.ok}`);
        req.flash('success', 'Page content settings saved');
        res.redirect(`/`);
    }
   return;
    //on success, redirect to page edit screen
};

exports.savePageSchemaSingle = async (req, res, next) => {
    res.json(req.body);
}


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
            const query = {};
            query[match] = document[match];
            bulk.find(query).upsert().updateOne(document);
        });
        bulk.execute( (err, bulkres) => {
            if (err) return reject(err);
            resolve(bulkres);
        });
    });
}