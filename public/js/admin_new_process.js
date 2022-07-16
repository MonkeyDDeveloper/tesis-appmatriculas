(() => {
    'use strict'
    const admin_name = document.getElementById('admin_name').value,
        admin_identifier = document.getElementById('admin_identifier').value,
        socket = io.connect({
            auth: {
                type: 'A',
                user: [admin_identifier, admin_name]
            }
        }),
        deleteButtons = document.querySelectorAll('.delete_button'),
        form = document.getElementById('form_enrollment'),
        btn_submit = document.getElementById('btn_submit'),
        message_area = document.getElementById('message_area')

    var spinner = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span><span>Publicando</span>`

    function getFormData(form) {
        return new Promise((res, rej) => {
            try {
                let formData = new FormData(form)
                let data = {}
                for (let pair of formData.entries()) {
                    data[pair[0]] = pair[1]
                }
                Object.assign(data, {
                    published_by: [admin_name, admin_identifier]
                })
                res(data)
            } catch (err) {
                rej('Hubo un error convirtiendo los datos')
            }
        })
    }

    function spinnerr(message){
        return `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span><span>${message}</span>`
    }

    function addListeners(elements, event, cb) {
        elements.forEach(e => {
            e.addEventListener(event, cb)
        })
    }

    function getMessage(status, message) {
        return `<div class="alert alert-${status ? 'success' : 'warning'} alert-dismissible fade show" role="alert">${message}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`
    }

    function disableButton() {
        btn_submit.innerHTML = spinner
        btn_submit.setAttribute('disabled', 'true')
    }

    function enableButton() {
        btn_submit.innerHTML = `<h6 class="text-white m-0">Publicar matrícula</h6>`
        btn_submit.removeAttribute('disabled')
    }

    function deleteEnrollment(e) {
        e.target.innerHTML = spinnerr('Eliminando')
        e.target.setAttribute('disabled', '')
        socket.emit('deleteEnrollment', [e.target.id, admin_name])
    }
    
    function logOut() {
        alert('El número de identificación que ha ingresado ya está en uso, por cuestiones de seguridad se cerrará esta sesión.')
        window.location.replace('/logOut')
    }

    socket.on('noValidPass', logOut)

    socket.on('save_success', () => {
        try {
            window.location.replace('/admin/nuevo_proceso?action=1')
        } catch (err) {
            message_area.innerHTML = getMessage(false, err)
        }
    })

    socket.on('save_failure', err => {
        enableButton()
        message_area.innerHTML = getMessage(false, err)
    })

    socket.on('delete_success', () => {
        try {
            window.location.replace('/admin/nuevo_proceso?action=0')
        } catch (err) {
            message_area.innerHTML = getMessage(false, err)
        }
    })

    socket.on('delete_error', err => {
        message_area.innerHTML = getMessage(false, err)
    })

    form.onsubmit = async function (e) {
        e.preventDefault()
        try {
            if (form.checkValidity()) {
                disableButton()
                let formData = await getFormData(this)
                socket.emit('saveNewEnrollment', formData)
            }
            form.classList.add('was-validated')
        } catch (err) {
            enableButton()
            message_area.innerHTML = getMessage(false, `Hubo un error procesando el formulario: ${err}`)
        }
    }

    addListeners(deleteButtons, 'click', deleteEnrollment)

})(document, window, io)