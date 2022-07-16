(function (document, window) {
    const tipoDeIdentificacion = document.getElementById('tipo_de_identificacion'),
        numeroDeIdentificacion = document.getElementById('numero_de_identificacion'),
        repNumeroDeIdentificacion = document.getElementById('rep_numero_de_identificacion'),
        passwordInput = document.getElementById('password'),
        re_password = document.getElementById('re-password'),
        correo_electronico = document.getElementById('correo_electronico'),
        re_correo_electronico = document.getElementById('re_correo_electronico'),
        button_submit = document.getElementById('btn_submit'),
        form = document.getElementById('form-register'),
        first_element = document.getElementById('first_element'),
        message_area = document.getElementById('message_area'),
        see_password = document.getElementById('see_password'),
        see_repassword = document.getElementById('see_repassword')

    var expNumDoc = ['^[a-zA-Z0-9]{9}', '^[0-9]{10}'],
        spinner = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span><span>Accediendo</span>`

    function disableButton() {
        button_submit.innerHTML = spinner
        button_submit.setAttribute('disabled', 'true')
    }

    function getMessage(status, message) {
        return `<div class="alert alert-${status ? 'success' : 'warning'} alert-dismissible fade show" role="alert">${message}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`
    }

    function enableButton() {
        button_submit.innerHTML = `Ingresar`
        button_submit.removeAttribute('disabled')
    }

    function getRegExp(string) {
        let regExpression = []
        Array.from(string).map(letter => {
            regExpression.push(`[${letter}]`)
        })
        return regExpression.join("")
    }

    function registerAlumn(data) {
        return new Promise(async (res, rej) => {
            try {
                let options = {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json; charset=utf-8"
                    },
                    body: JSON.stringify(data)
                }
                let resp = await fetch(`/students/register`, options)
                let resData = await resp.json()
                res(resData)
            } catch (err) {
                rej(err)
            }
        })
    }

    function processResponse(resData) {
        try {
            enableButton()
            let {
                status,
                msg
            } = resData
            if (status) window.location.replace("/")
            else message_area.innerHTML = getMessage(false, msg)
        } catch (err) {
            message_area.innerHTML = getMessage(false, `Error procesando la respuesta del servidor: ${err.message}`)
        }
    }

    correo_electronico.onchange = function () {
        re_correo_electronico.pattern = getRegExp(this.value)
    }

    passwordInput.onchange = function () {
        re_password.pattern = getRegExp(this.value)
    }

    tipoDeIdentificacion.onchange = function () {
        let valTipo = this.value
        numeroDeIdentificacion.pattern = (valTipo == 'CI') ? expNumDoc[1] : expNumDoc[0]
    }

    numeroDeIdentificacion.onfocus = function () {
        let tipoVal = tipoDeIdentificacion.value
        numeroDeIdentificacion.pattern = (tipoVal == 'CI') ? expNumDoc[1] : expNumDoc[0]
    }

    numeroDeIdentificacion.onchange = function () {
        repNumeroDeIdentificacion.pattern = this.value
    }

    see_password.onclick = (e) => {
        e.stopPropagation()
        if(passwordInput.getAttribute('type') == 'password') {
            e.target.classList.remove('fa-eye')
            e.target.classList.add('fa-eye-slash')
            passwordInput.setAttribute('type', 'text')
        }
        else {
            e.target.classList.remove('fa-eye-slash')
            e.target.classList.add('fa-eye')
            passwordInput.setAttribute('type', 'password')
        }
    }
    see_repassword.onclick = (e) => {
        e.stopPropagation()
        if(re_password.getAttribute('type') == 'password') {
            e.target.classList.remove('fa-eye')
            e.target.classList.add('fa-eye-slash')
            re_password.setAttribute('type', 'text')
        }
        else {
            e.target.classList.remove('fa-eye-slash')
            e.target.classList.add('fa-eye')
            re_password.setAttribute('type', 'password')
        }
    }

    form.onsubmit = async function (e) {
        e.preventDefault()
        e.stopPropagation()
        try {
            if (form.checkValidity()) {
                disableButton()
                let data = Object.fromEntries(new FormData(e.target).entries())
                let resData = await registerAlumn(data)
                processResponse(resData)
            }
            else first_element.focus()
            form.classList.add('was-validated')
        } catch (err) {
            enableButton()
            message_area.innerHTML = getMessage(false, err.message)
        }
    }

})(document, window)