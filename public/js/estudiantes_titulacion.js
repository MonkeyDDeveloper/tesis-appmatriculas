(() => {
    const ci = document.getElementById('identifier').value,
        socket = io.connect({
            auth: {
                type: 'S',
                user: ci
            }
        }),
        message_area = document.getElementById('message_area'),
        message_area_signatures = document.getElementById('signatures_message_area'),
        modal_close = document.getElementById('modal_close'),
        files_message_area = document.getElementById('files_message_area'),
        submit_button = document.getElementById('submit_button'),
        title_form = document.getElementById('title_form'),
        card_enrollments = document.getElementById('card_enrollments'),
        enrollWindow = document.getElementById('staticBackdrop'),
        first_element = document.getElementById('floatingSelect1'),
        student_occupation = document.getElementById('floatingSelect2'),
        student_income = document.getElementById('floatingSelect3'),
        type_scholarship = document.getElementById('floatingSelect5'),
        scholarship_reason = document.getElementById('floatingSelect6'),
        scholarship_amount = document.getElementById('floatingInput1'),
        emergency_contact = document.getElementById('floatingInput3'), 
        title_name = document.getElementById('floatingInput5'), 
        tariff_coverage = document.getElementById('tariff_coverage'),
        maintenance_coverage = document.getElementById('maintenance_coverage'),
        scholarship_funding = document.getElementById('floatingSelect7'),
        tariff_coverage_area = document.getElementById('tariff_coverage_area'),
        maintenance_coverage_area = document.getElementById('maintenance_coverage_area'),
        f_registration_form = document.getElementById('formFile1'),
        f_language_form = document.getElementById('formFile2'),
        f_dual_form = document.getElementById('formFile3'),
        f_society_form = document.getElementById('formFile4'),
        f_extra_form = document.getElementById('formFile5'),
        f_conclution_form = document.getElementById('formFile6'),
        f_egretation_form = document.getElementById('formFile7'),
        f_mensual_form = document.getElementById('formFile8'),
        f_final_form = document.getElementById('formFile9'),
        f_finalescrito_form = document.getElementById('formFile10'),
        f_cientifico_form = document.getElementById('formFile11'),
        certificated_payment = document.getElementById('formFile12'),
        files = [f_registration_form, f_language_form, f_dual_form, f_society_form, f_extra_form, f_conclution_form, f_egretation_form, f_mensual_form, f_final_form, f_finalescrito_form, f_cientifico_form, certificated_payment],
        spinner = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span><span>Guardando matricula</span>`,
        enrollment_features = JSON.parse(document.getElementById('enrollment_features').value)


    function deleteVars() {
        let nodesToDelete = [document.getElementById('enrollment_features')]
        nodesToDelete.forEach(node => document.body.removeChild(node))
    }

    function disableButton() {
        submit_button.innerHTML = spinner
        submit_button.setAttribute('disabled', '')
    }

    function enableButton() {
        submit_button.innerHTML = `<h6 class="text-white m-0">Matricularse</h6>`
        submit_button.removeAttribute('disabled')
    }

    function validPDF(object) {
        if (/^.*\.(pdf|PDF)$/.test(object.files[0].name)) {
            if (object.files[0].size < Math.pow(10, 6)) return true
            else return false
        } else return false
    }

    function getMessage(status, message) {
        return `<div class="alert alert-${status ? 'success' : 'warning'} alert-dismissible fade show" role="alert">${message}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`
    }

    function deleteCardEnrollment(id) {
        return new Promise((res, rej) => {
            try {
                let cardEnrollment = document.getElementById(id + 'CONTAINER')
                if (cardEnrollment) {
                    card_enrollments.removeChild(cardEnrollment)
                    document.getElementById('modal_close').click()
                    res(true)
                } else res(false)
            } catch (err) {
                rej(`Error eliminando la publicación de la matricula: ${err}`)
            }
        })
    }

    function getDataForm(e) {
        return new Promise((res, rej) => {
            try {
                let files = new FormData(e)
                files.set('enrollment_features', JSON.stringify(enrollment_features))
                files.set('student', ci)
                res(files)
            } catch (err) {
                rej(err)
            }
        })
    }

    function sendNewStudentEnrollment(files) {
        return new Promise(async (res, rej) => {
            try {
                let options = {
                    method: 'POST',
                    body: files
                }
                let {
                    status,
                    message
                } = await fetch('/student/new_title_period', options).then(res => res.json())
                if (!status) throw message
                res(message)
            } catch (err) {
                rej(err)
            }
        })
    }

    function successEnrollment(message) {
        window.location.href = '/student/mis_matriculas_titulacion'
    }

    function disableEmptyInputs() {
        try{
            files.forEach( e => {
                if(e.value ==  ''){
                    e.setAttribute('disabled', '')
                }
            })
        }
        catch(err){
            message_area.innerHTML = getMessage(false, err.message)
        }
    }
    
    function enableEmptyInputs() {
        try{
            files.forEach( e => {
                e.removeAttribute('disabled')
            })
        }
        catch(err){
            message_area.innerHTML = getMessage(false, err.message)
        }
    }

    student_occupation.onchange = function () {
        if (this.value == 'TRABAJA Y ESTUDIA') {
            student_income.removeAttribute('disabled')
            student_income.setAttribute('required', '')
        } else {
            student_income.value = ''
            student_income.removeAttribute('required')
            student_income.setAttribute('disabled', '')
        }
    }

    type_scholarship.onchange = function () {
        if (this.value != 'NO APLICA') {
            scholarship_reason.removeAttribute('disabled')
            scholarship_reason.setAttribute('required', '')
            scholarship_amount.removeAttribute('disabled')
            scholarship_amount.setAttribute('required', '')
            tariff_coverage.removeAttribute('disabled')
            tariff_coverage.setAttribute('required', '')
            tariff_coverage.value = '55'
            tariff_coverage.dispatchEvent(new Event('change'))
            maintenance_coverage.removeAttribute('disabled')
            maintenance_coverage.setAttribute('required', '')
            maintenance_coverage.value = '55'
            maintenance_coverage.dispatchEvent(new Event('change'))
            scholarship_funding.removeAttribute('disabled')
            scholarship_funding.setAttribute('required', '')
        } else {
            scholarship_reason.removeAttribute('required')
            scholarship_reason.setAttribute('disabled', '')
            scholarship_amount.removeAttribute('required')
            scholarship_amount.setAttribute('disabled', '')
            scholarship_amount.value = ''
            tariff_coverage.removeAttribute('required')
            tariff_coverage.setAttribute('disabled', '')
            tariff_coverage.value = '0'
            tariff_coverage_area.textContent = `Cobertura arancel: NO APLICA`
            maintenance_coverage.removeAttribute('required')
            maintenance_coverage.setAttribute('disabled', '')
            maintenance_coverage.value = '0'
            maintenance_coverage_area.textContent = `Cobertura manutención: NO APLICA`
            scholarship_funding.removeAttribute('required')
            scholarship_funding.setAttribute('disabled', '')
        }
    }

    tariff_coverage.onchange = function () {
        tariff_coverage_area.textContent = `Cobertura arancel: ${this.value}`
    }

    maintenance_coverage.onchange = function () {
        maintenance_coverage_area.textContent = `Cobertura manutención: ${this.value}`
    }

    certificated_payment.onchange = function () {
        if (!validPDF(this)) {
            this.value = ''
            files_message_area.innerHTML = getMessage(false, 'El archivo a subir debe ser en formato pdf y su peso debe ser menor a 1mb')
        }
    }

    f_registration_form.onchange = function () {
        if (!validPDF(this)) {
            this.value = ''
            files_message_area.innerHTML = getMessage(false, 'El archivo a subir debe ser en formato pdf y su peso debe ser menor a 1mb')
        }
    }

    f_language_form.onchange = function () {
        if (!validPDF(this)) {
            this.value = ''
            files_message_area.innerHTML = getMessage(false, 'El archivo a subir debe ser en formato pdf y su peso debe ser menor a 1mb')
        }
    }

    f_dual_form.onchange = function () {
        if (!validPDF(this)) {
            this.value = ''
            files_message_area.innerHTML = getMessage(false, 'El archivo a subir debe ser en formato pdf y su peso debe ser menor a 1mb')
        }
    }

    f_society_form.onchange = function () {
        if (!validPDF(this)) {
            this.value = ''
            files_message_area.innerHTML = getMessage(false, 'El archivo a subir debe ser en formato pdf y su peso debe ser menor a 1mb')
        }
    }

    f_extra_form.onchange = function () {
        if (!validPDF(this)) {
            this.value = ''
            files_message_area.innerHTML = getMessage(false, 'El archivo a subir debe ser en formato pdf y su peso debe ser menor a 1mb')
        }
    }

    f_conclution_form.onchange = function () {
        if (!validPDF(this)) {
            this.value = ''
            files_message_area.innerHTML = getMessage(false, 'El archivo a subir debe ser en formato pdf y su peso debe ser menor a 1mb')
        }
    }

    f_egretation_form.onchange = function () {
        if (!validPDF(this)) {
            this.value = ''
            files_message_area.innerHTML = getMessage(false, 'El archivo a subir debe ser en formato pdf y su peso debe ser menor a 1mb')
        }
    }

    f_mensual_form.onchange = function () {
        if (!validPDF(this)) {
            this.value = ''
            files_message_area.innerHTML = getMessage(false, 'El archivo a subir debe ser en formato pdf y su peso debe ser menor a 1mb')
        }
    }

    f_final_form.onchange = function () {
        if (!validPDF(this)) {
            this.value = ''
            files_message_area.innerHTML = getMessage(false, 'El archivo a subir debe ser en formato pdf y su peso debe ser menor a 1mb')
        }
    }

    f_finalescrito_form.onchange = function () {
        if (!validPDF(this)) {
            this.value = ''
            files_message_area.innerHTML = getMessage(false, 'El archivo a subir debe ser en formato pdf y su peso debe ser menor a 1mb')
        }
    }

    f_cientifico_form.onchange = function () {
        if (!validPDF(this)) {
            this.value = ''
            files_message_area.innerHTML = getMessage(false, 'El archivo a subir debe ser en formato pdf y su peso debe ser menor a 1mb')
        }
    }

    socket.on('delete_title_success', async id => {
        try {
            let isDeleted = await deleteCardEnrollment(id)
            isDeleted ? message_area.innerHTML = getMessage(true, `La anterior matrícula acaba de ser eliminada, para más información contacte con la administración del instituto.`) : {}
        } catch (err) {
            message_area.innerHTML = getMessage(false, err)
        }
    })
    
    socket.on('event_error', message => {
        message_area.innerHTML = getMessage(false, message)
        document.body.removeChild(enrollWindow)
    })

    title_form.onsubmit = async function (e) {
        e.preventDefault()
        try {
            if (title_form.checkValidity()) {
                disableButton()
                disableEmptyInputs()
                emergency_contact.value = emergency_contact.value.toUpperCase()
                title_name.value = title_name.value.toUpperCase()
                let files = await getDataForm(title_form)
                let result = await sendNewStudentEnrollment(files)
                enableEmptyInputs()
                successEnrollment(result)
            } else first_element.focus()
            title_form.classList.add('was-validated')
        } catch (err) {
            enableButton()
            message_area_signatures.innerHTML = getMessage(false, `${err}`)
        }
    }

    deleteVars()

})(document, window, io, bootstrap)