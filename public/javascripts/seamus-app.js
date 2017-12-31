// IMPORT SASS FILES
import '../sass/style.scss';

// JS TO ADD/DELETE NEW FORM SECTIONS TO/FROM PAGE BUILDER FORM
import { addContentSection, removeContentSection } from './modules/handleContentSections';
const addSectionBtn = document.querySelector('#addSectionBtn');
const removeSectionBtns = document.querySelectorAll('.removeSectionBtn');
if (addSectionBtn) addSectionBtn.addEventListener('click', addContentSection);
if (removeSectionBtns.length) {
    removeSectionBtns.forEach( (btn) => {
        console.log(btn);
        btn.addEventListener('click', removeContentSection );
    } );
}