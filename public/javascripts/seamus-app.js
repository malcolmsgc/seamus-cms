// IMPORT SASS FILES
import '../sass/style.scss';
// JS TO ADD NEW FORM SECTIONS TO PAGE BUILDER FORM
import addContentSection from './modules/addContentSection';
const addSectionBtn = document.querySelector('#addSectionBtn');
addSectionBtn.addEventListener('click', addContentSection);