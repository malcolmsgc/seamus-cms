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
/* 0 */,
/* 1 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(1);

var _handleContentSections = __webpack_require__(10);

// IMPORT SASS FILES
var addSectionBtn = document.querySelector('#addSectionBtn');
// JS TO ADD/DELETE NEW FORM SECTIONS TO PAGE BUILDER FORM

var removeSectionBtns = document.querySelectorAll('.removeSectionBtn');
if (addSectionBtn) addSectionBtn.addEventListener('click', _handleContentSections.addContentSection);
if (removeSectionBtns) {
    console.log(removeSectionBtns);
    removeSectionBtns.forEach(function (btn) {
        console.log(btn);
        btn.addEventListener('click', _handleContentSections.removeContentSection);
    });
}
// addSectionBtn.addEventListener('click', addContentSection);

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = "<!-- add empty page object for when this snippet is compiled by webpack--><div class=\"content-section\"><hr/><button type=\"button\" onClick=\"this.parentElement.remove()\">&times;</button><p><strong>New Section</strong></p><input type=\"hidden\" name=\"_id\"/><label for=\"title\">Title for content section<span class=\"--required\">(req)</span></label><input type=\"text\" name=\"title\" placeholder=\"Untitled section\" required=\"required\"/><label for=\"index\">index</label><p>This will be used to order the content sections on the page</p><p><strong>Indexes must be unique. </strong>If no index is provided the sections will be arranged in order of their creation</p><input type=\"number\" name=\"index\" placeholder=\"0\"/><label for=\"css_selector\">CSS selector that associated with content</label><input type=\"text\" name=\"css_selector\" placeholder=\"#id\"/><label for=\"type\">What type of content will this section manage?</label><select required=\"required\" name=\"type\"><option disabled=\"disabled\" selected=\"selected\" value=\"\">Choose content type</option><option value=\"heading\">Heading</option><option value=\"text\">Text</option><option value=\"image\">Image</option></select><fieldset><legend>Rules</legend><p>Seamus currently does no policing of any content rules. Rules are displayed as a guideline for users to adhere to.</p><label for=\"rule\">Rules</label><textarea name=\"rule\"></textarea><label for=\"max_value\">Max value</label><input type=\"number\" name=\"max_value\"/><label for=\"min_value\">Min value</label><input type=\"number\" name=\"min_value\"/><label for=\"max_unit\">Unit for max value</label><input type=\"text\" name=\"max_unit\"/><label for=\"min_unit\">Unit for min value</label><input type=\"text\" name=\"min_unit\"/><label for=\"max_apply_to\">Max value applies to (e.g. height)</label><input type=\"text\" name=\"max_apply_to\"/><label for=\"min_apply_to\">Min value applies to (e.g. height)</label><input type=\"text\" name=\"min_apply_to\"/></fieldset></div>";

/***/ }),
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */,
/* 9 */,
/* 10 */
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

function removeContentSection() {
    var _this = this;

    var confirmed = window.confirm('This action will permanently delete all the saved data for this content section.\n\nAre you sure you wish to delete this content section?');
    if (confirmed) {
        var id = this.dataset.id;
        var request = new Request('/delete/content/' + id, { method: 'DELETE', credentials: 'same-origin' });
        fetch(request).then(function (res) {
            if (res.ok) {
                _this.parentNode.remove();
                return res.json();
            } else throw new Error('Delete failed\nRESPONSE STATUS: ' + res.status);
        }).then(function (json) {
            return console.log('deleted section ' + json.title);
        }).catch(function (err) {
            return alert(err);
        });
    }
}

exports.addContentSection = addContentSection;
exports.removeContentSection = removeContentSection;

/***/ })
/******/ ]);
//# sourceMappingURL=App.bundle.js.map