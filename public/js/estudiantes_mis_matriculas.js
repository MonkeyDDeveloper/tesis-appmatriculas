(() => {
    const ci = document.getElementById('ci').value,
        socket = io.connect({
            auth: {
                type: 'S',
                user: ci
            }
        }),
        enrollments_ids = JSON.parse(document.getElementById('enrolls_ids').value),
        downloadForms = document.querySelectorAll('.modal_form'),
        delete_buttons = document.querySelectorAll('.delete'),
        message_area = document.getElementById('message_area'),
        uploadNewFilesForms = document.querySelectorAll('.upload_new_files')


    function addListeners(elements, event, fn) {
        elements.forEach(e => {
            e.addEventListener(event, fn)
        })
    }
    
    function spinner(message){
        return `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span><span>${message}</span>`
    }

    function getMessage(status, message) {
        return `<div class="alert alert-${status ? 'success' : 'warning'} alert-dismissible fade show" role="alert">${message}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`
    }

    function existInDOM(id) {
        return (document.getElementById(id + 'CONTAINER')) ? true : false
    }

    function downloadToClient(file, name, e = null) {
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
            message_area.innerHTML = getMessage(false, `Hubo un error obteniendo la documentación de la matrícula: ${err}, por favor intentelo más tarde.`)
        }
    }

    function comprobePDF(value) {
        if (/^.*\.(pdf|PDF)$/.test(value)) return true
        else return false
    }

    function validateFile(object, message_area) {
        let status = true
        if (!comprobePDF(object.value)) {
            message_area.innerHTML = getMessage(false, 'Este campo solo acepta archivos PDF.')
            status = false
            object.value = ''
        } else if (object.files[0].size > Math.pow(10, 6)) {
            message_area.innerHTML = getMessage(false, 'El archivo a subir debe ser de un tamaño menor a 1mb.')
            status = false
            object.value = ''
        } else {
            message_area.innerHTML = ''
            status = true
        }
        return status
    }

    async function sendNewFilesForEnrollment(e) {
        e.stopPropagation()
        e.preventDefault()
        let message_area_modal = e.target.querySelector('.message_area_modal')
        if (e.target.checkValidity()) {
            if(validateFile(e.target.querySelector("input[type='file']"), message_area_modal)){
                e.target.querySelector('button[type="submit"]').innerHTML = spinner('Descargando')
                e.target.querySelector('button[type="submit"]').setAttribute('disabled', '')
                message_area_modal.innerHTML = ''
                try{
                    let bodyReq = {
                        method: 'PUT',
                        body: new FormData(e.target)
                    }
                    let res = await fetch('/student/update_enroll_documentation', bodyReq)
                    let json = await res.json()
                    if(json.status == true) {
                        e.target.querySelector('button[type="submit"]').innerHTML = 'Subir nueva documentación'
                        e.target.querySelector('button[type="submit"]').removeAttribute('disabled')
                        message_area_modal.innerHTML = getMessage(true, `Los documentos de su matrícula se han actualizado correctamente`)
                    }
                    else {
                        throw json.err
                    }
                }
                catch (err) {
                    e.target.querySelector('button[type="submit"]').innerHTML = 'Subir nueva documentación'
                    e.target.querySelector('button[type="submit"]').removeAttribute('disabled')
                    message_area_modal.innerHTML = getMessage(false, `Hubo un error subiendo la nueva documentación: ${err}, por favor intentelo más tarde.`)
                }
            }
        }
        e.target.classList.add('was-validated')
    }

    function cancelEnrollment(e) {
        e.target.innerHTML = spinner('Eliminando')
        e.target.setAttribute('disabled', '')
        socket.emit('cancelStudentEnrollment', {
            ci,
            enrollId: this.id
        })
    }

    socket.once('connect', () => {
        socket.emit('enrollmentStudentInReviewS', enrollments_ids)
    })

    socket.on('cancelStudentEnrollment_success', () => {
        window.location.replace('/student/mis_matriculas')
    })

    socket.on('cancelStudentEnrollment_error', err_message => {
        message_area.innerHTML = getMessage(false, err_message)
    })

    socket.on('error_in_server', err => {
        message_area.innerHTML = getMessage(false, err)
    })

    socket.on('enrollmentInReviewS', ids => {
        try {
            ids.forEach(id => {
                if (existInDOM(id)) {
                    let enrollContainer = document.getElementById(id + 'CONTAINER'),
                    deleteB = enrollContainer.querySelector('.delete')
                    if(deleteB) {
                        deleteB.style.display = 'none'
                    }
                }
            })
            delete_buttons.forEach( e => e.style.visibility = 'visible')
        } catch (err) {
            message_area.innerHTML = getMessage(false, err.message)
        }
    })

    socket.on('enroll_cheked', id => {
        window.location.replace('/student/mis_matriculas')
    })

    addListeners(downloadForms, 'submit', downloadEnrollmentDocumentation)
    addListeners(uploadNewFilesForms, 'submit', sendNewFilesForEnrollment)
    addListeners(delete_buttons, 'click', cancelEnrollment)

})(document, window, io)