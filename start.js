const mongoose = require('mongoose');

// import environmental variables from our variables.env file
require('dotenv').config({ path: 'variables.env' });

// Connect to our Database and handle any bad connections
mongoose.connect(process.env.DATABASE);
mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises
mongoose.connection.on('open', () => console.log(`DB ${process.env.DATABASE} connected`));
mongoose.connection.on('error', (err) => {
  console.error(`☠️☠️☠️ ${err.message} ☠️☠️☠️`);
});

// Models



// Start our app!
const app = require('./app');
app.set('port', process.env.PORT || 7777);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running on http://localhost:${server.address().port}`);
});

