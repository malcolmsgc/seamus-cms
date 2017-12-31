const markup = require('../../../views/includes/_contentSectionForm.pug');

function addContentSection() {
    const fragment = document.createDocumentFragment();
    const section = document.createElement('section');
    fragment.appendChild(section);
    section.innerHTML = markup;
    const form = this.parentNode;
    form.insertBefore(section, this);
}

function removeContentSection() {
    const confirmed = window.confirm('This action will permanently delete all the saved data for this content section.\n\nAre you sure you wish to delete this content section?');
    if (confirmed) {
        const id = this.dataset.id;
        const request = new Request(`/delete/content/${id}`, { method: 'DELETE', credentials: 'same-origin' });
        fetch(request)
            .then(
                (res) => {
                    if (res.ok) { 
                        this.parentNode.remove();
                        return res.json(); 
                    }
                    else throw new Error (`Delete failed\nRESPONSE STATUS: ${res.status}`);
                })
            .then(
                (json) => console.log(`deleted section ${json.title}`)
            )
            .catch(
                (err) => alert(err)
            );
    }
}


export { addContentSection, removeContentSection };