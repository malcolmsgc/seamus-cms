const markup = require('../../../views/includes/_contentSectionForm.pug');

function addContentSection() {
    const fragment = document.createDocumentFragment();
    const section = document.createElement('section');
    fragment.appendChild(section);
    section.innerHTML = markup;
    const form = this.parentNode;
    form.insertBefore(section, this);
}

export default addContentSection;