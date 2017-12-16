const mongoose = require('mongoose');

// import environmental variables from our variables.env file
require('dotenv').config({ path: 'variables.env' });

// Connect to our Database and handle any bad connections
const mongooseOptions = {
  useMongoClient: true,
  promiseLibrary: global.Promise
};
mongoose.connect(process.env.DATABASE, mongooseOptions);
// mongoose.Promise = global.Promise;
// assert.equal(query.exec().constructor, global.Promise);
mongoose.connection.on('open', () => console.log(`DB ${process.env.DATABASE} connected`));
mongoose.connection.on('error', (err) => {
  console.error(`☠️☠️☠️ ${err.message} ☠️☠️☠️`);
});

// Models
console.log('Requiring models...');
require('./models/User');
// require('./models/Content');
require('./models/Page');
require('./models/Settings');

// Start our app!
const app = require('./app');
app.set('port', process.env.PORT || 7777);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running on http://localhost:${server.address().port}`);
});

