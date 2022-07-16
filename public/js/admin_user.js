(() => {
    const form = document.getElementById('form_user_admin'),
        message_area = document.getElementById('form_user_admin'),
        button_submit = document.getElementById('button_submit')

    function disableButton() {
        button_submit.innerHTML = `<span class="spinner-border spinner-border-sm me-2 text-white" role="status" aria-hidden="true"></span><span class="text-white">Ingresando</span>`
        button_submit.setAttribute('disabled', 'true')
    }

    function enableButton() {
        button_submit.innerHTML = '<h6 class="text-white">Ingresar</h6>'
        button_submit.removeAttribute('disabled')
    }

    form.onsubmit = async function (e) {
        e.preventDefault()
        try {
            disableButton()
            let resp = await fetch('/admin/user', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({
                    admin_name: `${e.target.primer_nombre.value.trim().toUpperCase()} ${e.target.primer_apellido.value.trim().toUpperCase()}`,
                    admin_identifier: e.target.admin_identifier.value,
                    admin_career: e.target.career.value
                })
            }).then(async res => res.json())
            if (resp.status) {
                window.location.replace('/admin/index')
            } else {
                throw new Error(resp.err)
            }
        } catch (err) {
            enableButton()
            message_area.innerHTML = `<div class="alert alert-warning alert-dismissible fade show" role="alert">Hubo un error enviando sus datos de ingreso: ${err.message}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`
        }
    }

})(document, window)