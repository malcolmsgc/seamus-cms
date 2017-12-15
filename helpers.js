/*
  This is a file of data and helper functions that we can expose and use in our templating function
*/


// moment.js is a handy library for displaying dates. We need this in our templates to display things like "Posted 5 minutes ago"
exports.moment = require('moment');

// Dump is a handy debugging function we can use to sort of "console.log" our data
exports.dump = (obj) => JSON.stringify(obj, null, 2);

// FS is a built in module to node that let's us read files from the system we're running on
const fs = require('fs');

// inserting an SVG
exports.icon = (name) => fs.readFileSync(`./public/images/icons/${name}.svg`);

// Some details about the site
exports.siteName = `Seamus CMS`;

exports.menu = [
  { slug: '/', title: 'Console', icon: 'top', },
  { slug: '/top', title: '{sitename}', icon: 'top', },
  { slug: '/tags', title: 'Tags', icon: 'tag', },
  { slug: '/addpage/', title: 'Add Page', icon: 'add', },
  { slug: '/settings', title: 'Settings', icon: 'cog', },
];
