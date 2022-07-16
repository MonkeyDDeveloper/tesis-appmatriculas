(() => {
    const d = document,
        admin_name = d.getElementById('admin_name').value,
        admin_identifier = d.getElementById('admin_identifier').value,
        socket = io.connect({
            auth: {
                type: 'A',
                user: [admin_identifier, admin_name]
            }
        }),
        message_area = document.getElementById('message_area'),
        m_s_a = document.getElementById('m_s_a'),
        form_filter = document.getElementById('form_filter'),
        act_student_forms = document.querySelectorAll('.act_student_form'),
        e_subs = document.querySelectorAll('.e_sub'),
        s_subs = document.querySelectorAll('.s_sub'),
        delete_buttons = document.querySelectorAll('button[data-student]'),
        excel_buttons = document.querySelectorAll('button[data-excel]')

    var s_no_identifier = (() => {
        let ci = new URL(window.location.href).searchParams.get('s_no_identifier')
        console.log(ci)
        return ci ? ci : null
    })() || null

    function spinner(message){
        return `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span><span>${message}</span>`
    }

    function getMessage(status, message) {
        return `<div class="alert alert-${status ? 'success' : 'warning'} alert-dismissible fade show" role="alert">${message}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`
    }

    // function generateFilter(filters) {
    //     let string = ''
    //     filters.forEach(v => {
    //         let key = Object.keys(v)[0]
    //         string += `[data-${key}="${v[key]}"]`
    //     })
    //     return string
    // }

    function lookForStudent() {
        if(s_no_identifier) {
            window.location.replace(`${window.location.pathname}?s_no_identifier=${s_no_identifier}`)
        }
        // let childs = Array.from(m_s_a.querySelectorAll(generateFilter(filters)))
        // if (childs.length > 0) {
        //     message_area.innerHTML = ''
        //     childs.forEach(child => {
        //         m_s_a.removeChild(child)
        //         m_s_a.prepend(child)
        //     })
        // } else {
        //     message_area.innerHTML = getMessage(false, 'No se ha encontrado ningún estudiante que coincida con los filtros.')
        // }
    }

    // function closeModal(id) {
    //     try {
    //         let closeModalButton = document.getElementById(`closeModalButton${id}`)
    //         closeModalButton.click();
    //     } catch (err) {
    //         message_area.innerHTML = getMessage(false, err.message);
    //     }
    // }

    function act_student(e) {
        try {
            e.preventDefault();
            e.stopPropagation();
            if (e.target.checkValidity()) {
                let formData = Object.fromEntries(new FormData(e.target).entries())
                formData._id = this.id
                formData.admin = [admin_name, admin_identifier]
                if (formData.password.trim() == '') delete formData.password
                socket.emit('admin_act_student', formData)
                e.target.querySelector('button[type="submit"]').innerHTML = spinner('Actualizando')
                e.target.querySelector('button[type="submit"]').setAttribute('disabled', '')
            }
            e.target.classList.add('was-validated')
        } catch (e) {
            e.target.querySelector('button[type="submit"]').removeAttribute('disabled')
            e.target.querySelector('button[type="submit"]').innerHTML = 'Actualizar'
            message_area.innerHTML = getMessage(false, e.message)
        }
    }

    function addListeners(elements, event, fn) {
        elements.forEach(e => {
            e.addEventListener(event, fn)
        })
    }

    function removeDisabledInputs(e) {
        try {
            e.stopPropagation()
            let inputs = Array.from(this.querySelectorAll('input'))
            inputs.forEach(i => i.disabled = false)
        } catch (err) {
            message_area.innerHTML = getMessage(false, err.message)
        }
    }

    function deleteStudent(e) {
        e.preventDefault()
        e.stopPropagation()
        try {
            let acceptDelete = confirm('Esta acción eliminará al estudiante de la base de datos, sin embargo se seguirá conservando la documentación del mismo, así como las matriculas que este haya realizado. De click en aceptar si desea continuar de todas formas.')
            if (acceptDelete) {
                e.target.innerHTML = spinner('Eliminando')
                e.target.setAttribute('disabled', '')
                socket.emit('admin_delete_student', e.target.dataset.student)
            }
        } catch (err) {
            e.target.innerHTML = 'Eliminar estudiante'
            e.targer.removeAttribute('disabled')
            message_area.innerHTML = getMessage(false, err.message)
        }
    }

    function downloadToClientExcel(file, name, e = null) {
        try{
            const url = window.URL.createObjectURL(new Blob([file]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${name}.xlsx`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            if(e) {
                e.target.innerHTML = 'Descargar información del estudiante.'
                e.target.removeAttribute('disabled')
            }       
        }
        catch(err){
            message_area.innerHTML = getMessage(false, err.message)
        }
    }

    async function downloadStudentExcel(e) {
        e.preventDefault()
        e.stopPropagation()
        e.target.innerHTML = spinner('Descargando')
        e.target.setAttribute('disabled', '')
        try {
            let [_id, no_identifier] = JSON.parse(e.target.dataset.excel),
                response = await fetch(`/admin/act_student/${_id}`)
            if (response.status == 200) {
                let file = await response.blob()
                downloadToClientExcel(file, no_identifier, e)
            } else {
                e.target.removeAttribute('disabled')
                e.target.innerHTML = 'Descargar información del estudiante.'
                let {
                    message
                } = await response.json()
                throw message
            }
        } catch (err) {
            e.target.removeAttribute('disabled')
            e.target.innerHTML = 'Descargar información del estudiante.'
            message_area.innerHTML = getMessage(false, `Hubo un error obteniendo la información del estudiante: ${err}, por favor intentelo más tarde.`)
        }
    }

    function logOut() {
        alert('El número de identificación que ha ingresado ya está en uso, por cuestiones de seguridad se cerrará esta sesión.')
        window.location.replace('/logOut')
    }

    socket.on('noValidPass', logOut)

    socket.on('admin_act_student_success', resp => {
        window.location.reload()
    })

    socket.on('server_error', message => {
        try {
            message_area.innerHTML = getMessage(false, message);
        } catch (err) {
            message_area.innerHTML = getMessage(false, err.message)
        }
    })

    socket.on('admin_delete_student_success', _id => {
        window.location.reload()
    })

    socket.on('admin_delete_student_error', message => {
        message_area.innerHTML = getMessage(false, message)
    })

    form_filter.onsubmit = function (e) {
        try {
            e.preventDefault()
            e.stopPropagation()
            if(e.target.ci_filter.value) {
                s_no_identifier = e.target.ci_filter.value
                lookForStudent()
            }
            else throw new Error('Ingrese un número de identificación')
        } catch (err) {
            message_area.innerHTML = getMessage(false, err.message)
        }
    }

    addListeners(e_subs, 'click', removeDisabledInputs)
    addListeners(s_subs, 'click', removeDisabledInputs)
    addListeners(excel_buttons, 'click', downloadStudentExcel)
    addListeners(act_student_forms, 'submit', act_student)
    addListeners(delete_buttons, 'click', deleteStudent)

})(document, io, bootstrap, window)