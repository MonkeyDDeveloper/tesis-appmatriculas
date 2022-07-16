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

    function getMessage(status, message) {
        return `<div class="alert alert-${status ? 'success' : 'warning'} alert-dismissible fade show" role="alert">${message}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`
    }

    form.onsubmit = async function (e) {
        e.preventDefault()
        try {
            if (form.checkValidity()) {
                disableButton()
                let qualifierData = {
                        qualifier_name: `${e.target.primer_nombre.value.trim().toUpperCase()} ${e.target.primer_apellido.value.trim().toUpperCase()}`,
                        qualifier_identifier: e.target.admin_identifier.value
                    },
                    resp = await fetch('/qualifiers/user', {
                        method: 'POST',
                        headers: {
                            'Content-type': 'application/json'
                        },
                        body: JSON.stringify(qualifierData)
                    })
                if (resp.status == 200) {
                    window.location.replace('/qualifiers/index')
                } else {
                    let {
                        message
                    } = await resp.json()
                    throw new Error(message)
                }
            }
            form.classList.add('was-validated')
        } catch (err) {
            enableButton()
            message_area.innerHTML = getMessage(false, `Hubo un error enviando sus datos de ingreso: ${err.message}`)
        }
    }

})(document, window)