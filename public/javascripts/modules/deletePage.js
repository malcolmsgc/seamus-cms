function deletePage() {
    const confirmed = window.confirm('This action will permanently delete this page and all its content.\n\nDo you wish to proceed?');
    if (confirmed) {
        const id = this.dataset.id;
        const request = new Request(`/delete/page/${id}`, { method: 'DELETE', credentials: 'same-origin' });
        fetch(request)
            .then(
                (res) => {
                    if (res.ok) {
                        return res.json(); 
                    }
                    else throw new Error (`Delete page failed\nRESPONSE STATUS: ${res.status}`);
                })
            .then(
                (json) => {
                    location.assign('/');
                })
            .catch(
                (err) => console.error(err)
            );
    }
}

export default deletePage;