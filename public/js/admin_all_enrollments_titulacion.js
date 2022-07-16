(() => {
    const
        admin_name = document.getElementById('admin_name').value,
        admin_identifier = document.getElementById('admin_identifier').value,
        socket = io.connect({
            auth: {
                type: 'A',
                user: [admin_identifier, admin_name]
            }
        }),
        message_area = document.getElementById('message_area'),
        form_filter = document.getElementById('form_filter'),
        // enrollments_container = document.getElementById('enrollments_container'),
        watchButtons = document.querySelectorAll('.watch'),
        deleteButtons = document.querySelectorAll('.delete'),
        downloadForms = document.querySelectorAll('.modal_form'),
        downloadAllButton = document.getElementById('downloadAllButton'),
        excel_buttons = document.querySelectorAll('button[data-excel]')
        
    var filters = (() => {
        let filters = new URL(window.location.href).searchParams.get('filters')
        return filters ? JSON.parse(filters) : null
    })() || []

    function spinner(message){
        return `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span><span>${message}</span>`
    }

    function getMessage(status, message) {
        return `<div class="alert alert-${status ? 'success' : 'warning'} alert-dismissible fade show" role="alert">${message}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`
    }

    function addListeners(elements, event, cb) {
        elements.forEach(e => {
            e.addEventListener(event, cb)
        })
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
                response = await fetch(`/student/mis_matriculas_titulacion/${student}?period=${period}&year=${year}`)
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
            message_area.innerHTML = getMessage(false, `Hubo un error obteniendo la documentación del estudiante: ${err}, esto puede ser debido a que la matrícula acaba de ser eliminada, por favor recargue la página o inténtelo más tarde.`)
        }
    }

    function downloadToClientExcel(file, name, e = null, name_button = null) {
        try{
            const url = window.URL.createObjectURL(new Blob([file]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${name}.xlsx`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            if(e) {
                e.target.innerHTML = name_button
                e.target.removeAttribute('disabled') 
            }        
        }
        catch(err){
            message_area.innerHTML = getMessage(false, err.message)
        }
    }

    async function downloadStudentExcel(e) {
        e.preventDefault()
        e.target.innerHTML = spinner('Descargando')
        e.target.setAttribute('disabled', '')
        try {
            let [enrollment_id, no_identifier, period, year] = JSON.parse(e.target.dataset.excel),
                response = await fetch(`/admin/all_enrollments_titulacion/${enrollment_id}`)
            if (response.status == 200) {
                let file = await response.blob()
                downloadToClientExcel(file, `${no_identifier}_${period}_${year}`, e, 'Descargar excel')
            } else {
                e.target.innerHTML = 'Descargar excel'
                e.target.removeAttribute('disabled')
                let {
                    message
                } = await response.json()
                throw message
            }
        } catch (err) {
            e.target.innerHTML = 'Descargar excel'
            e.target.removeAttribute('disabled')
            message_area.innerHTML = getMessage(false, `Hubo un error obteniendo la información de la matrícula: ${err}, esto puede ser debido a que la matrícula acaba de ser eliminada, por favor recargue la página o inténtelo más tarde.`)
        }
    }

    async function downloadAllEnrollmentsExcel(e) {
        e.preventDefault()
        e.stopPropagation()
        e.target.innerHTML = spinner('Descargando')
        e.target.setAttribute('disabled', '')
        try {
            if(filters.length > 0){
                let options = {
                    method: 'POST',
                    body: JSON.stringify({filters}),
                    headers:{'Content-Type': 'application/json'}
                },
                response = await fetch(`/admin/all_enrollments_titulacion`, options)
                if (response.status == 200) {
                    let file = await response.blob(),
                        name = `${filters.map( f => {
                            let key = Object.keys(f)[0]
                            return `${key.toUpperCase()}_${f[key]}_`
                        })}`
                    downloadToClientExcel(file, name, e, 'Descargar todas')
                } else {
                    e.target.innerHTML = 'Descargar todas'
                    e.target.removeAttribute('disabled')
                    let {
                        message
                    } = await response.json()
                    throw message
                }
            }
            else {
                e.target.removeAttribute('disabled')
                e.target.innerHTML = 'Descargar todas'
                message_area.innerHTML = getMessage(false, 'Por favor proporcione un filtro para generar el respectivo excel.')
            }
        } catch (err) {
            e.target.removeAttribute('disabled')
            e.target.innerHTML = 'Descargar todas'
            message_area.innerHTML = getMessage(false, `Hubo un error generando el excel de las matrículas: ${err}.`)
        }
    }

    function openModal(e){
        try{
            let modal = document.getElementById('staticBackdrop' + e.target.id),
                myModal = new bootstrap.Modal(modal)
                myModal.show()
        }
        catch(err){
            message_area.innerHTML = getMessage(false, `Hubo un error, por favor recargue la página: ${err.message}`)
        }
    }

    function deleteEnrollment(e){
        e.preventDefault()
        e.stopPropagation()
        e.target.innerHTML = spinner('Eliminando')
        e.target.setAttribute('disabled', '')
        try{
            console.log(e.target.dataset._id)
            socket.emit('delete_enrollment_admin_title', e.target.dataset._id)
        }
        catch(e){
            e.target.innerHTML = 'Eliminar'
            e.target.removeAttribute('disabled')
            message_area.innerHTML = getMessage(false, `Hubo un error procesando su petición, por favor recargue la página: ${err.message}`)
        }
    }

    // function generateFilter(filters) {
    //     let queries = ''
    //     filters.forEach(v => {
    //         let key = Object.keys(v)[0]
    //         queries += `[data-${key}="${v[key]}"]`
    //     })
    //     return queries
    // }

    function filterEnroll(filters) {
        window.location.replace(`${window.location.pathname}?filters=${JSON.stringify(filters)}`)
        // let childs = Array.from(enrollments_container.querySelectorAll(generateFilter(filters)))
        // if (childs.length > 0) {
        //     message_area.innerHTML = ''
        //     childs.forEach(child => {
        //         enrollments_container.removeChild(child)
        //         enrollments_container.prepend(child)
        //     })
        // } else {
        //     message_area.innerHTML = getMessage(false, 'No se ha encontrado ninguna matricula que coincida con los filtros.')
        // }
    }

    function logOut() {
        alert('El número de identificación que ha ingresado ya está en uso, por cuestiones de seguridad se cerrará esta sesión.')
        window.location.replace('/logOut')
    }

    function recharge() {
        window.location.reload()
    }

    socket.on('noValidPass', logOut)
    socket.on('delete_enrollment_admin_title_success', recharge)
    socket.on('delete_enrollment_admin_title_error', message => {
        message_area.innerHTML = getMessage(false, message)
        message_area.focus()
    })

    form_filter.onsubmit = function (e) {
        try {
            e.preventDefault()
            e.stopPropagation()
            filters = []
            if (e.target.year_filter.value) filters.push({
                year: e.target.year_filter.value
            })
            if (e.target.type_filter.value) filters.push({
                type: e.target.type_filter.value
            })
            if (e.target.period_filter.value) filters.push({
                period: e.target.period_filter.value 
            })
            if (e.target.ci_filter.value) filters.push({
                student: e.target.ci_filter.value
            })
            if (e.target.career_filter.value) filters.push({
                career: e.target.career_filter.value
            })
            if (filters.length > 0) filterEnroll(filters)
        } catch (err) {
            message_area.innerHTML = getMessage(false, err.message)
        }
    }

    downloadAllButton.onclick = downloadAllEnrollmentsExcel

    addListeners(watchButtons, 'click', openModal)
    addListeners(excel_buttons, 'click', downloadStudentExcel)
    addListeners(downloadForms, 'submit', downloadEnrollmentDocumentation)
    addListeners(deleteButtons, 'click', deleteEnrollment)

})(document, window, io, bootstrap)