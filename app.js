const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
/** @todo debug: Jest (and Mocha) timing out on tests. Possibly a problem with promises. Added promise assignment here in attempt to fix but no dice */
mongoose.Promise = global.Promise; 
const MongoStore = require('connect-mongo')(session);
const path = require('path');
const cookieParser = require('cookie-parser'); //TO DO - CHECK: no longer nec for express session. May still be needed for passport. 
const bodyParser = require('body-parser');
const passport = require('passport');
const promisify = require('es6-promisify');
const flash = require('connect-flash');
console.log('Requiring routes...');
const routes = require('./routes/index');
const api = require('./routes/api');
const helpers = require('./helpers');
const errorHandlers = require('./handlers/errorHandlers');
require('./handlers/passport');

// create our Express app
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug'); 

// serves up static files from the public folder. Anything in public/ will just be served up as the file it is
app.use(express.static(path.join(__dirname, 'public')));

// Takes the raw requests and turns them into usable properties on req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Exposes a bunch of methods for validating data. Used heavily on userController.validateRegister
// Deprecated - applying v4, which (I think) no longer needs the global middleware
// app.use(expressValidator());

// populates req.cookies with any cookies that came along with the request
app.use(cookieParser());

// Sessions allow us to store data on visitors from request to request
// This keeps users logged in and allows us to send flash messages
app.use(session({
  secret: `${process.env.SECRET || "test"}`,
  key: `${process.env.KEY || "session"}`,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

// // Passport JS is what we use to handle our logins
app.use(passport.initialize());
app.use(passport.session());

// // The flash middleware let's us use req.flash('error', 'Shit!'), which will then pass that message to the next page the user requests
app.use(flash());

// pass variables to our templates + all requests
app.use((req, res, next) => {
  res.locals.h = helpers;
  res.locals.flashes = req.flash();
  res.locals.user = req.user || null;
  res.locals.currentPath = req.path;
  next();
});

// promisify some callback based APIs
app.use((req, res, next) => {
  req.login = promisify(req.login, req);
  next();
});

// After allllll that above middleware, we finally handle our own routes!
app.use('/', routes);
app.use('/api/v1', api);

// If routes didnt work, we 404 them and forward to error handler
app.use(errorHandlers.notFound);

// One of our error handlers will see if these errors are just validation errors
app.use(errorHandlers.flashValidationErrors);

// development error handler - prints stack trace
if (app.get('env') === 'development') {
  app.use(errorHandlers.developmentErrors);
}

// production error handler
app.use(errorHandlers.productionErrors);

// done! we export it so we can start the site in start.js
module.exports = app;
