const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');
require('pug-html-loader');

// This is our JavaScript rule that specifies what to do with .js files
const javascript = {
  test: /\.(js)$/,
  use: [{
    loader: 'babel-loader',
    options: { 
      env: {
        development: {
          presets: ['env']
        },
        test: {
          plugins: ["transform-es2015-modules-commonjs"],
          presets: [["es2015", {"modules": false}]]
        },
        production: {
          presets: ['env']
        },
      babelrc: false
    } } 
  }],
};

/*
  This is our postCSS loader which gets fed into the next loader.
*/

const postcss = {
  loader: 'postcss-loader',
  options: {
    plugins() { return [autoprefixer({ browsers: 'last 3 versions' })]; }
  }
};

// this is our sass/css loader.
const styles = {
  test: /\.(scss)$/,
  // We don't just pass an array of loaders, we run them through the extract plugin so they can be outputted to their own .css file
  use: ExtractTextPlugin.extract(['css-loader?sourceMap', postcss, 'sass-loader?sourceMap'])
};

const uglify = new webpack.optimize.UglifyJsPlugin({ // eslint-disable-line
  compress: { warnings: false }
});

const pug = {
    test: /\.pug$/,
    loaders: [ 'html-loader', 'pug-html-loader' ]
};

// OK - now it's time to put it all together
const config = {
  entry: {
    // we only have 1 entry, but I've set it up for multiple in the future
    App: './public/javascripts/seamus-app.js'
  },
  // we're using sourcemaps and here is where we specify which kind of sourcemap to use
  devtool: 'source-map',
  // Once things are done, we kick it out to a file.
  output: {
    // path is a built in node module
    // __dirname is a variable from node that gives us the
    path: path.resolve(__dirname, 'public', 'dist'),
    // we can use "substitutions" in file names like [name] and [hash]
    // name will be `App` because that is what we used above in our entry
    filename: '[name].bundle.js'
  },

  // remember we said webpack sees everthing as modules and how different loaders are responsible for different file types? Here is is where we implement them. Pass it the rules for our JS and our styles
  module: {
    rules: [javascript, styles, pug]
  },
  // finally we pass it an array of our plugins - uncomment if you want to uglify
  // plugins: [uglify]
  plugins: [
    // here is where we tell it to output our css to a separate file
    new ExtractTextPlugin('style.css'),
  ]
};
// webpack is cranky about some packages using a soon to be deprecated API. shhhhhhh
process.noDeprecation = true;

module.exports = config;
