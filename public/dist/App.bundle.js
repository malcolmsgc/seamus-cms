/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
var markup = __webpack_require__(3);

function addContentSection() {
    var fragment = document.createDocumentFragment();
    var section = document.createElement('section');
    fragment.appendChild(section);
    section.innerHTML = markup;
    var form = this.parentNode;
    form.insertBefore(section, this);
}

exports.default = addContentSection;

/***/ }),
/* 1 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(1);

var _addContentSection = __webpack_require__(0);

var _addContentSection2 = _interopRequireDefault(_addContentSection);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// IMPORT SASS FILES
var addSectionBtn = document.querySelector('#addSectionBtn');
// JS TO ADD NEW FORM SECTIONS TO PAGE BUILDER FORM

addSectionBtn.addEventListener('click', _addContentSection2.default);

/***/ }),
/* 3 */
/***/ (function(module, exports) {

throw new Error("Module build failed: TypeError: Cannot read property 'content' of undefined\n    at eval (eval at wrap (/Users/malcolm/Dev/Projects/Seamus CMS/dev/node_modules/pug-runtime/wrap.js:6:10), <anonymous>:3:374)\n    at template (eval at wrap (/Users/malcolm/Dev/Projects/Seamus CMS/dev/node_modules/pug-runtime/wrap.js:6:10), <anonymous>:5:2545)\n    at Object.module.exports (/Users/malcolm/Dev/Projects/Seamus CMS/dev/node_modules/pug-html-loader/lib/index.js:33:10)");

/***/ })
/******/ ]);
//# sourceMappingURL=App.bundle.js.map