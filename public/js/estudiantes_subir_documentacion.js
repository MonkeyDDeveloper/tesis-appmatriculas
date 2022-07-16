(() => {
    const message_area = document.getElementById('message_area'),
        btn_submit = document.getElementById('btn_submit'),
        form = document.getElementById('form_upload_docs'),
        spinner = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span><span>Actualizando</span>`


    function addListeners() {
        document.querySelectorAll('.dwnl_button').forEach((element) => {
            element.addEventListener('click', (e) => {
                e.preventDefault()
                e.target.style.visibility = 'hidden'
                downloadAFile(element.dataset.name, e.target)
            })
        })
    }

    function comprobePDF(value) {
        if (/^.*\.(pdf|PDF)$/.test(value)) return true
        else return false
    }

    function disableEmptyFields() {
        document.querySelectorAll('input[type="file"]').forEach((element) => {
            if (element.value == '') {
                element.setAttribute('disabled', '')
            }
        })
    }

    function enableFields() {
        document.querySelectorAll('input[type="file"]').forEach((element) => {
            if (element.value == '') {
                element.removeAttribute('disabled')
            }
        })
    }

    function disableButton() {
        btn_submit.innerHTML = spinner
        btn_submit.setAttribute('disabled', 'true')
    }

    function enableButton() {
        btn_submit.innerHTML = `Actualizar`
        btn_submit.removeAttribute('disabled')
    }

    function validateFile(object, number) {
        let status = true
        let message_area = document.getElementById(`err_pdf_area_${number}`)
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

    function getMessage(status, message) {
        return `<div class="alert alert-${status ? 'success' : 'warning'} alert-dismissible fade show" role="alert">${message}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`
    }

    function getMessageIndex(status, message) {
        return `<div class="alert alert-${status ? 'success' : 'warning'} alert-dismissible fade show" role="alert">${message} Regrese al <a href="/student/index">inicio.</a><button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`
    }

    function downloadToClient(file, name, e = null) {
        const url = window.URL.createObjectURL(new Blob([file]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${name[0]}.zip`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        if(e) e.style.visibility = 'visible';
    }

    async function downloadAFile(fileName, e) {
        try {
            let name = fileName
            let response = await fetch(`/student/subir_documentacion/get_a_file/${fileName}`)
            if (response.status == 200) {
                let file = await response.blob()
                downloadToClient(file, [name], e)
            } else {
                let {
                    message
                } = await response.json()
                throw message
            }
        } catch (err) {
            e.style.visibility = 'visible'
            message_area.innerHTML = getMessage(false, `Hubo un error obteniendo el archivo: ${err}, por favor intentelo más tarde.`)
        }
    }

    function validateFiles() {
        let status = true
        document.querySelectorAll('input[type="file"]').forEach((element, i) => {
            if (element.value != '') {
                if (!validateFile(element, i + 1)) status = false
            }
        })
        return status
    }

    function sendDocsToSave(formData) {
        return new Promise((res, rej) => { 
            try {
                fetch(window.location.href, {
                    method: 'POST',
                    body: formData,

                })
                    .then(_res => _res.json())
                    .then( json => {
                        if(!json.status){
                            rej(json.message)
                        }
                        else res(json.message)
                    })
                    .catch( err => {
                        rej(err.message)
                    })
            } catch (err) {
                rej(err)
            }
        })
    }

    form.onsubmit = async function (e) {
        try {
            e.preventDefault()
            if (form.checkValidity()) {
                let validFiles = validateFiles()
                if (validFiles == true) {
                    disableEmptyFields()
                    disableButton()
                    let message = await sendDocsToSave(new FormData(e.target))
                    message_area.innerHTML = getMessageIndex(true, message)
                    enableButton()
                    enableFields()
                }
            }
            form.classList.add('was-validated')
        } catch (err) {
            enableFields()
            enableButton()
            message_area.innerHTML = getMessage(false, `Hubo un error enviando sus documentos: ${err}, por favor siga las siguientes recomendaciones: verifique que esta conectado a una red privada, evite las redes públicas (como las redes del trabajo o gobierno), intente subir su documentación deste un computador, deshabilite las extenciones en su navegador web, y procure que el mismo esté actualizado, asegurese de que su documentación no está dañada o corrupta.`)
        }
    } 

    addListeners()

})(document, window, io)