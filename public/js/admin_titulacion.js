(function () {
    const admin_name = document.getElementById('admin_name').value,
        admin_identifier = document.getElementById('admin_identifier').value,
        socket = io.connect({
            auth: {
                type: 'A',
                user: [admin_identifier, admin_name]
            }
        }),
        enrollments_ids = JSON.parse(document.getElementById('enrollments_ids').value),
        qualifiesForms = document.querySelectorAll('._form'),
        watchButtons = document.querySelectorAll('.watch'),
        closeButtons = document.querySelectorAll('.close_button'),
        message_area = document.getElementById('message_area'),
        form_filter = document.getElementById('form_filter'),
        e_c = document.getElementById('e_c')

    function getMessage(status, message) {
        return `<div class="alert alert-${status ? 'success' : 'warning'} alert-dismissible fade show" role="alert">${message}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`
    }

    function addListeners(elements, event, cb) {
        elements.forEach(e => {
            e.addEventListener(event, cb)
        })
    }

    function spinner(message){
        return `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span><span>${message}</span>`
    }

    function leaveWatching() {
        socket.emit('stopWatchingAdmin', admin_identifier)
    }

    function startWatching(e) {
        try {
            let my_modal = new bootstrap.Modal(document.getElementById('staticBackdrop' + this.id))
            my_modal.show()
            socket.emit('adminWorking', {
                enrollment_id: this.id,
                admin_identifier
            })
        } catch (e) {
            message_area.innerHTML = getMessage(false, e.message)
        }
    }

    function existInDOM(id) {
        return (document.getElementById(id)) ? true : false
    }

    function processSubmit(e) {
        try {
            e.preventDefault()
            e.stopPropagation()
            if (e.target.checkValidity()) {
                let data = Object.fromEntries(new FormData(e.target).entries())
                data.enrollment = /[^FORM].+/g.exec(this.id)[0]
                data.student = [e.target.dataset.student]
                data.admin = [admin_name, admin_identifier]
                e.target.querySelector('button[type="submit"]').innerHTML = spinner('Finalizando')
                e.target.querySelector('button[type="submit"]').setAttribute('disabled', '')
                socket.emit('admin_qualifies_title', data)
            }
            e.target.classList.add('was-validated')
        } catch (err) {
            e.target.querySelector('button[type="submit"]').innerHTML = 'Finalizar'
            e.target.querySelector('button[type="submit"]').removeAttribute('disabled')
            message_area.innerHTML = getMessage(false, err.message)
        }
    }

    function removeEnrollmentInDom(id) {
        if (existInDOM(id + 'CONTAINER')) {
            let e = document.getElementById(id + 'CONTAINER')
            e_c.removeChild(e);
        }
        if (existInDOM('staticBackdrop' + id)) {
            let e = document.getElementById('staticBackdrop' + id)
            e.querySelector('.close_button').click();
            document.body.removeChild(e)
        }
        message_area.innerHTML = getMessage(true, 'La matricula fue calificada con éxito')
    }

    function generateFilter(filters) {
        let string = ''
        filters.forEach(v => {
            let key = Object.keys(v)[0]
            string += `[data-${key}="${v[key]}"]`
        })
        return string
    }

    function filterEnroll(filters) {
        let childs = Array.from(e_c.querySelectorAll(generateFilter(filters)))
        if (childs.length > 0) {
            message_area.innerHTML = ''
            childs.forEach(child => {
                e_c.removeChild(child)
                e_c.prepend(child)
            })
        } else {
            message_area.innerHTML = getMessage(false, 'No se ha encontrado ninguna matricula que coincida con los filtros.')
        }
    }

    function logOut() {
        alert('El número de identificación que ha ingresado ya está en uso, por cuestiones de seguridad se cerrará esta sesión.')
        window.location.replace('/logOut')
    }

    socket.on('connect', () => {
        socket.emit('enrollmentStudentInReviewA', enrollments_ids)
    })

    socket.on('noValidPass', logOut)

    socket.on('enrollmentInReviewA', ids => {
        try {
            ids.forEach(id => {
                if (existInDOM(id + 'CONTAINER')) {
                    let enrollContainer = document.getElementById(id + 'CONTAINER')
                    enrollContainer.querySelector('.watch').style.display = 'none'
                }
            })
            watchButtons.forEach( e => e.style.visibility = 'visible')
        } catch (err) {
            message_area.innerHTML = getMessage(false, err.message)
        }
    })

    socket.on('admin_qualifies_title_error', mesg => {
        message_area.innerHTML = getMessage(false, mesg)
    })

    socket.on('admin_qualifies_title_success', id => {
        try {
            window.location.reload()
        } catch (err) {
            message_area.innerHTML = getMessage(false, err.message)
        }
    })

    socket.on('enroll_qualified_title', _id => {
        try {
            if (existInDOM(_id + 'CONTAINER')) {
                let rowEnroll = document.getElementById(_id + 'CONTAINER')
                e_c.removeChild(rowEnroll)
            }
            if (existInDOM('staticBackdrop' + _id)) {
                let modalEnroll = document.getElementById('staticBackdrop' + _id)
                document.body.removeChild(modalEnroll)
            }
        } catch (err) {
            message_area.innerHTML = getMessage(false, err.message)
        }
    })

    socket.on('error_in_server', err => {
        message_area.innerHTML = getMessage(false, err)
    })

    form_filter.onsubmit = function (e) {
        try {
            e.preventDefault()
            e.stopPropagation()
            let filters = []
            if (e.target.ci_filter.value) filters.push({
                no_identifier: e.target.ci_filter.value
            })
            if (e.target.type_filter.value) filters.push({
                type: e.target.type_filter.value
            })
            if (e.target.career_filter.value) filters.push({
                career: e.target.career_filter.value
            })
            if (filters.length > 0) filterEnroll(filters)
        } catch (err) {
            message_area.innerHTML = getMessage(false, err.message)
        }
    }

    addListeners(watchButtons, 'click', startWatching)
    addListeners(closeButtons, 'click', leaveWatching)
    addListeners(qualifiesForms, 'submit', processSubmit)

})(document, window, io, bootstrap)