import '../sass/style.scss';

import addContentSection from './modules/addContentSection';

const addSectionBtn = document.querySelector('#addSectionBtn');
addSectionBtn.addEventListener('click', addContentSection);