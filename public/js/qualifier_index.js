(() => {
    const
        qualifier_name = document.getElementById('qualifier_name').value,
        qualifier_identifier = document.getElementById('qualifier_identifier').value,
        socket = io.connect({
            auth: {
                type: 'Q',
                identifier: qualifier_identifier
            }
        }),
        enrollments_ids = JSON.parse(document.getElementById('enrollments_ids').value),
        message_area = document.getElementById('message_area'),
        form_filter = document.getElementById('form_filter'),
        enrollments_container = document.getElementById('enrollments_container'),
        watchButtons = document.querySelectorAll('.watch'),
        closeButtons = document.querySelectorAll('.close_button'),
        downloadForms = document.querySelectorAll('.modal_form'),
        acceptButtons = document.querySelectorAll('.accept'),
        denyButtons = document.querySelectorAll('.deny')

    function getMessage(status, message) {
        return `<div class="alert alert-${status ? 'success' : 'warning'} alert-dismissible fade show" role="alert">${message}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`
    }

    function spinner(message){
        return `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span><span>${message}</span>`
    }

    function addListeners(elements, event, cb) {
        elements.forEach(e => {
            e.addEventListener(event, cb)
        })
    }

    function existInDOM(id) {
        return (document.getElementById(id)) ? true : false
    }

    function downloadToClient(file, name, e = null) {
        try{
            const url = window.URL.createObjectURL(new Blob([file]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${name[0]}_${name[1]}_${name[2]}.zip`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            if(e) {
                e.innerHTML = 'Descargar documentacion relacionada a la matricula.'
                e.removeAttribute('disabled') 
            }        
        }
        catch(err){
            message_area.innerHTML = getMessage(false, err.message)
        }
    }

    async function downloadEnrollmentDocumentation(e) {
        e.preventDefault()
        e.stopPropagation()
        e.target.querySelector('button[type="submit"]').innerHTML = spinner('Descargando')
        e.target.querySelector('button[type="submit"]').setAttribute('disabled', '')
        try {
            let student = e.target.student.value,
                period = e.target.period.value,
                year = e.target.year.value,
                response = await fetch(`/student/mis_matriculas/${student}?period=${period}&year=${year}`)
            if (response.status == 200) {
                let file = await response.blob()
                downloadToClient(file, [student, period, year], e.target.querySelector('button[type="submit"]'))
            } else {
                e.target.querySelector('button[type="submit"]').innerHTML = 'Descargar documentacion relacionada a la matricula.'
                e.target.querySelector('button[type="submit"]').removeAttribute('disabled')
                let {
                    message
                } = await response.json()
                throw message
            }
        } catch (err) {
            e.target.querySelector('button[type="submit"]').innerHTML = 'Descargar documentacion relacionada a la matricula.'
            e.target.querySelector('button[type="submit"]').removeAttribute('disabled')
            message_area.innerHTML = getMessage(false, `Hubo un error obteniendo la documentación del estudiante: ${err}, por favor intentelo más tarde.`)
        }
    }

    function generateFilter(filters) {
        let string = ''
        filters.forEach(v => {
            let key = Object.keys(v)[0]
            string += `[data-${key}="${v[key]}"]`
        })
        return string
    }

    function leaveWatching() {
        socket.emit('stopWatchingQualifier', qualifier_identifier)
    }

    function qualifierWorking() {
        socket.emit('qualifierWorking', {
            enrollment_id: this.id,
            qualifier_identifier
        })
        let my_modal = new bootstrap.Modal(document.getElementById('staticBackdrop' + this.id))
        my_modal.show()
    }

    function acceptEnrollment(e) {
        try{
            e.preventDefault()
            e.stopPropagation()
            let _id = e.target.dataset.id
            let parallel = document.getElementById(`staticBackdrop${_id}`).querySelector('select').value
            console.log(parallel)
            e.target.innerHTML = spinner('Aceptando')
            e.target.setAttribute('disabled', '')
            socket.emit('accept_enrollment', {
                _id,
                parallel,
                qualifier_name
            })
        }
        catch(e){
            message_area.innerHTML = getMessage(false, `Hubo un error al procesar la petición, ${err.message}, por favor recargue la página.`)
        }
    }

    function denyEnrollment(e) {
        try{
            e.preventDefault()
            e.stopPropagation()
            let message = prompt('Ingrese la razón de rechazo')
            let _id = e.target.dataset.id
            if (message.length > 0) {
                e.target.innerHTML = spinner('Rechazando')
                e.target.setAttribute('disabled', '')
                socket.emit('deny_enrollment', {
                    _id,
                    qualifier_name,
                    message
                })
            }
        }
        catch(e){
            message_area.innerHTML = getMessage(false, `Hubo un error al procesar la petición, ${err.message}, por favor recargue la página.`)
        }
    }

    function filterEnroll(filters) {
        let childs = Array.from(enrollments_container.querySelectorAll(generateFilter(filters)))
        if (childs.length > 0) {
            message_area.innerHTML = ''
            childs.forEach(child => {
                enrollments_container.removeChild(child)
                enrollments_container.prepend(child)
            })
        } else {
            message_area.innerHTML = getMessage(false, 'No se ha encontrado ninguna matricula que coincida con los filtros.')
        }
    }

    function logOut() {
        alert('El número de identificación que ha ingresado ya está en uso, por cuestiones de seguridad se cerrará esta sesión.')
        window.location.replace('/logOut')
    }

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
            if (filters.length > 0) filterEnroll(filters)
        } catch (err) {
            message_area.innerHTML = getMessage(false, err.message)
        }
    }

    socket.once('connect', () => {
        socket.emit('enrollmentStudentInReview', enrollments_ids)
    })

    socket.on('noValidPass', logOut)

    socket.on('student_cancel_enrollment', id => {
        try {
            if (existInDOM(id)) {
                let s_enroll = document.getElementById(id + 'CONTAINER')
                enrollments_container.removeChild(s_enroll)
            }
        } catch (err) {
            message_area.innerHTML = getMessage(false, err.message)
        }
    })

    socket.on('error_in_server', err => {
        message_area.innerHTML = getMessage(false, err)
    })

    socket.on('enrollmentInReview', ids => {
        try {
            ids.forEach(id => {
                if (existInDOM(id + 'CONTAINER')) {
                    let enrollContainer = document.getElementById(id + 'CONTAINER')
                    enrollContainer.querySelector('.deny').style.display = 'none'
                    enrollContainer.querySelector('.accept').style.display = 'none'
                    enrollContainer.querySelector('.watch').style.display = 'none'
                }
            })
            watchButtons.forEach( e => e.style.visibility = 'visible')
            acceptButtons.forEach( e => e.style.visibility = 'visible')
            denyButtons.forEach( e => e.style.visibility = 'visible')
        } catch (err) {
            message_area.innerHTML = getMessage(false, err.message)
        }
    })

    socket.on('err_modify', err => {
        message_area.innerHTML = getMessage(false, err)
    })

    socket.on('checked_sucess', mesg => {
        window.location.replace(window.location.href)
    })

    socket.on('enroll_cheked', _id => {
        try {
            if (existInDOM(_id + 'CONTAINER')) {
                let rowEnroll = document.getElementById(_id + 'CONTAINER')
                enrollments_container.removeChild(rowEnroll)
            }
            if (existInDOM('staticBackdrop' + _id)) {
                let modalEnroll = document.getElementById('staticBackdrop' + _id)
                document.body.removeChild(modalEnroll)
            }
        } catch (err) {
            message_area.innerHTML = getMessage(false, err.message)
        }
    })

    addListeners(watchButtons, 'click', qualifierWorking)
    addListeners(closeButtons, 'click', leaveWatching)
    addListeners(acceptButtons, 'click', acceptEnrollment)
    addListeners(denyButtons, 'click', denyEnrollment)
    addListeners(downloadForms, 'submit', downloadEnrollmentDocumentation)

})(document, window, io, bootstrap)