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
        subjects = document.getElementById('subjects'),
        requireds = document.getElementById('requireds'),
        normal_subjects = document.querySelectorAll('[data-ns="true"]'),
        ancl_subjects = document.querySelectorAll('[data-as="true"]'),
        message_area = document.getElementById('message_area'),
        message_area_signatures = document.getElementById('signatures_message_area'),
        modal_close = document.getElementById('modal_close'),
        files_message_area = document.getElementById('files_message_area'),
        show_hrs_area = document.getElementById('hrs'),
        submit_button = document.getElementById('submit_button'),
        signatures_form = document.getElementById('signatures_form'),
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
        registration_form = document.getElementById('formFile1'),
        request_subjects = document.getElementById('formFile2'),
        nodebt_certificated = document.getElementById('formFile3'),
        certificated_payment = document.getElementById('formFile4'),
        solicitud_hrs = document.getElementById('formFile5'),
        spinner = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span><span>Guardando matricula</span>`,
        enrollment_features = JSON.parse(document.getElementById('enrollment_features').value),
        student = JSON.parse(document.getElementById('student').value),
        subjectsLimit = Number(document.getElementById('subjectsLimit').value),
        max_hours = Number(document.getElementById('max_hours').value)

    var current_subjects = 0,
        current_hours = 0,
        disabledChecks = []

    function deleteVars() {
        let nodesToDelete = [document.getElementById('student'), document.getElementById('enrollment_features'), document.getElementById('subjectsLimit'), document.getElementById('max_hours')]
        nodesToDelete.forEach(node => document.body.removeChild(node))
    }

    function addListeners(elements, event, fn) {
        elements.forEach(e => {
            e.addEventListener(event, fn)
        })
    }

    function addListenerANCL(elements, event) {
        elements.forEach(e => {
            if (e.dataset.change == 'true') e.addEventListener(event, changeAncl(e.dataset.ancl))
            else e.addEventListener(event, isPosible)
        })
    }

    function disableEmptyInputs(e) {
        try{
            let files = e.target.querySelectorAll('input[type="file"]')
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
    
    function enableEmptyInputs(e) {
        try{
            let files = e.target.querySelectorAll('input[type="file"]')
            files.forEach( e => {
                e.removeAttribute('disabled')
            })
        }
        catch(err){
            message_area.innerHTML = getMessage(false, err.message)
        }
    }

    function enableChecks() {
        let checks = document.querySelectorAll('.form-check-input')
        Array.from(checks).forEach(n => {
            if (n.hasAttribute('disabled')) {
                disabledChecks.push(n)
                n.removeAttribute('disabled')
            }
        })
    }

    function disableChecks() {
        disabledChecks.forEach(n => {
            n.setAttribute('disabled', '')
        })
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
        try{
            if (/^.*\.(pdf|PDF)$/.test(object.files[0].name)) {
                if (object.files[0].size < Math.pow(10, 6)) return true
                else return false
            } else return false
        }
        catch(err){
            return false
        }
    }

    function giveMessageAboutHours() {
        console.log(current_hours)
        if (current_hours > max_hours) {
            if(solicitud_hrs.value != '') {
                if(!validPDF(solicitud_hrs)) submit_button.style.display = 'none' 
            }
            show_hrs_area.innerHTML = getMessage(false, `Las materias que usted ha escogido superan el limite horas semanales, por favor seleccione menos. Si desea matricularse de todas formas debe cargar la respectiva solicitud junto con la demas documentación que se encuentra en los apartados superiores. Horas totales: ${current_hours}`)
            solicitud_hrs.removeAttribute('disabled')
            solicitud_hrs.setAttribute('required', '')
            solicitud_hrs.focus()
        } else {
            submit_button.style.display = 'block'
            solicitud_hrs.removeAttribute('required')
            solicitud_hrs.setAttribute('disabled', '')
            show_hrs_area.innerHTML = getMessage(true, `Total de horas semanales: ${current_hours}`)
        }
    }

    function checkSubjects() {
        if (current_subjects > subjectsLimit) {
            message_area_signatures.innerHTML = getMessage(false, `El número de materias limite a las que usted puede aplicar es 3, materias escogidas: ${current_subjects}`)
            submit_button.style.display = 'none'
        } else {
            message_area_signatures.innerHTML = ''
        }
    }

    function changeAncl(ancl) {
        return function () {
            let anclInput = document.getElementById(ancl)
            if (this.checked) {
                current_hours = current_hours + Number(this.value)
                current_subjects = current_subjects + 1
                anclInput.setAttribute('disabled', '')
                if (!anclInput.checked && !Boolean(anclInput.dataset.s_r)) {
                    anclInput.checked = true
                    anclInput.dispatchEvent(new Event('change'))
                } else {
                    giveMessageAboutHours()
                    checkSubjects()
                }
            } else {
                current_hours = current_hours - Number(this.value) < 0 ? 0 : current_hours - Number(this.value)
                current_subjects = current_subjects - 1
                !Boolean(anclInput.dataset.s_r) ? anclInput.removeAttribute('disabled') : {}
                giveMessageAboutHours()
                checkSubjects()
            }
        }
    }

    function isPosible() {
        if (this.checked) {
            current_hours = current_hours + Number(this.value)
            current_subjects = current_subjects + 1
            giveMessageAboutHours()
            checkSubjects()
        } else {
            current_hours = current_hours - Number(this.value) < 0 ? 0 : current_hours - Number(this.value)
            current_subjects = current_subjects - 1
            giveMessageAboutHours()
            checkSubjects()
        }
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

    function defineStaticSubjects(requireds, subjects) {
        try {
            let requiredEnrollments = JSON.parse(requireds.value),
                allSubjects = JSON.parse(subjects.value)
            document.body.removeChild(requireds)
            document.body.removeChild(subjects)
            if (requiredEnrollments.length > 3) {
                allSubjects.forEach(sub => {
                    if (requiredEnrollments.every(sub2 => sub2.no != sub.no)) {
                        let subInput = document.getElementById(sub.no)
                        let container = document.getElementById(sub.no + 'CONTAINER')
                        subInput.checked = false
                        subInput.setAttribute('disabled', '')
                        container.setAttribute('disabled', '')
                    }
                })
            } else {
                requiredEnrollments.forEach(subject => {
                    let {
                        no
                    } = subject
                    let requiredSubject = document.getElementById(no)
                    let container = document.getElementById(no + 'CONTAINER')
                    requiredSubject.checked = true
                    requiredSubject.dispatchEvent(new Event('change'))
                    requiredSubject.setAttribute('disabled', '')
                    requiredSubject.dataset.s_r = 'true'
                    container.setAttribute('disabled', '')
                })
            }
        } catch (err) {
            message_area.innerHTML = getMessage(false, err.message)
        }
    }

    function getDataForm(e) {
        return new Promise((res, rej) => {
            try {
                enableChecks()
                let files = new FormData(e)
                files.set('enrollment_features', JSON.stringify(enrollment_features))
                files.set('student', JSON.stringify(student))
                files.set('admin', admin_name)
                disableChecks()
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
                } = await fetch('/admin/special_enroll', options).then(res => res.json())
                if (!status) throw message
                res(message)
            } catch (err) {
                rej(err)
            }
        })
    }

    function successEnrollment(message) {
        message_area.innerHTML = getMessage(true, message)
        modal_close.click()
        card_enrollments.removeChild(document.getElementById(enrollment_features._id + 'CONTAINER'))
        document.body.removeChild(enrollWindow)
    }

    function logOut() {
        alert('El número de identificación que ha ingresado ya está en uso, por cuestiones de seguridad se cerrará esta sesión.')
        window.location.replace('/logOut')
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

    registration_form.onchange = function () {
        if (!validPDF(this)) {
            this.value = ''
            files_message_area.innerHTML = getMessage(false, 'El archivo a subir debe ser en formato pdf y su peso debe ser menor a 1mb')
        }
    }

    request_subjects.onchange = function () {
        if (!validPDF(this)) {
            this.value = ''
            files_message_area.innerHTML = getMessage(false, 'El archivo a subir debe ser en formato pdf y su peso debe ser menor a 1mb')
        }
    }

    nodebt_certificated.onchange = function () {
        if (!validPDF(this)) {
            this.value = ''
            files_message_area.innerHTML = getMessage(false, 'El archivo a subir debe ser en formato pdf y su peso debe ser menor a 1mb')
        }
    }

    if(certificated_payment) certificated_payment.onchange = function () {
        if (!validPDF(this)) {
            this.value = ''
            files_message_area.innerHTML = getMessage(false, 'El archivo a subir debe ser en formato pdf y su peso debe ser menor a 1mb')
        }
    }

    solicitud_hrs.onchange = function () {
        if (!validPDF(this)) {
            this.value = ''
            files_message_area.innerHTML = getMessage(false, 'El archivo a subir debe ser en formato pdf y su peso debe ser menor a 1mb')
            submit_button.style.display = 'none'
        } else {
            submit_button.style.display = 'block'
            files_message_area.innerHTML = ''
        }
    }

    socket.on('noValidPass', logOut)

    socket.on('delete_success', async id => {
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

    signatures_form.onsubmit = async function (e) {
        e.preventDefault()
        e.stopPropagation()
        try {
            if (signatures_form.checkValidity()) {
                if (current_subjects >= 1) {
                    disableEmptyInputs(e)
                    disableButton()
                    emergency_contact.value = emergency_contact.value.toUpperCase()
                    title_name.value = title_name.value.toUpperCase()
                    let files = await getDataForm(signatures_form)
                    let result = await sendNewStudentEnrollment(files)
                    enableEmptyInputs(e)
                    successEnrollment(result)
                } else throw 'Debe seleccionar al menos una materia en la que desee matricularse.'
            } else first_element.focus()
            signatures_form.classList.add('was-validated')
        } catch (err) {
            enableButton()
            enableEmptyInputs(e)
            message_area_signatures.innerHTML = getMessage(false, `${err}`)
        }
    }

    addListeners(normal_subjects, 'change', isPosible)
    addListenerANCL(ancl_subjects, 'change')
    defineStaticSubjects(requireds, subjects)
    deleteVars()

})(document, window, io, bootstrap)