function addContentSection() {
    const fragment = document.createDocumentFragment();
    const section = document.createElement('section');
    fragment.appendChild(section);
    const markup = `
        <h1>NEW SECTION</h1>
    `;
    section.innerHTML = markup;
    const form = this.parentNode;
    form.insertBefore(section, this);
}



export default addContentSection;