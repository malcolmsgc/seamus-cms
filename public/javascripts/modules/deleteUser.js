function deleteUser() {
    const confirmed = window.confirm('This action will permanently delete all the saved data for this user.\n\nDo you wish to proceed?');
    if (confirmed) {
        const id = this.dataset.id;
        const request = new Request(`/delete/user/${id}`, { method: 'DELETE', credentials: 'same-origin' });
        fetch(request)
            .then(
                (res) => {
                    if (res.ok) { 
                        this.parentNode.remove();
                        return res.json(); 
                    }
                    else throw new Error (`Delete user failed\nRESPONSE STATUS: ${res.status}`);
                })
            .then(
                (json) => console.log(`deleted user ${json.firstname} ${json.firstname}: ${json._id}`)
            )
            .catch(
                (err) => alert(err)
            );
    }
}

export default deleteUser;