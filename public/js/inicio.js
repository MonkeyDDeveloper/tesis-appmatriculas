(function () {
    const form = document.getElementById('form_session'),
        message_area = document.getElementById('alert_area'),
        button_submit = document.getElementById('button_submit'),
        see_password = document.getElementById('see_password'),
        passwordInput = document.getElementById('floatingInput_2'),
        spinner = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span><span>Accediendo</span>`

    function disableButton() {
        button_submit.innerHTML = spinner
        button_submit.setAttribute('disabled', 'true')
    }

    function enableButton() {
        button_submit.innerHTML = `Ingresar`
        button_submit.removeAttribute('disabled')
    }

    function getMessage(status, message) {
        return `<div class="alert alert-${status ? 'success' : 'warning'} alert-dismissible fade show" role="alert">${message}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`
    }

    function typeOfUser(email) {
        if (/@\w+@/.exec(email)) return 'ADMIN'
        else if (/[{]\w+[}]/.exec(email)) return 'QUALIFIER'
        else return 'STUDENT'
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

    form.onsubmit = async function (e) {
        try {
            e.preventDefault()
            if (form.checkValidity()) {
                let email = e.target.email.value.trim(),
                    password = e.target.password.value.trim();
                (typeOfUser(email) == 'STUDENT') ? async function () {
                        disableButton()
                        let found = await fetch(`/loginstudent`, {
                            method: 'POST',
                            headers: {
                                'Content-type': 'application/json; charset=utf-8'
                            },
                            body: JSON.stringify({
                                email,
                                password
                            })
                        }).then(async resp => await resp.json())
                        if (found.found == true) {
                            if (found.password) {
                                enableButton()
                                window.location.href = '/student/index'
                            } else { 
                                enableButton()
                                message_area.innerHTML = getMessage(false, 'Contraseña incorrecta.')
                                return
                            }
                        } else if (found.found == false) {
                            enableButton()
                            message_area.innerHTML = getMessage(false, 'El usuario no se encuentra registrado en la base de datos.')
                            return
                        } else { 
                            enableButton()
                            message_area.innerHTML = getMessage(false, `Hubo un error iniciando sesión: ${found.message}, por favor intentelo más tarde.`)
                        }
                    }():
                    (typeOfUser(email) == 'QUALIFIER') ? async function () {
                            disableButton()
                            let found = await fetch(`/loginqualifier`, {
                                method: 'POST',
                                headers: {
                                    'Content-type': 'application/json; charset=utf-8'
                                },
                                body: JSON.stringify({
                                    user: email,
                                    password
                                })
                            }).then(async resp => await resp.json())
                            if (found.found == true) {
                                if (found.password) {
                                    enableButton()
                                    window.location.href = '/qualifiers/user'
                                } else {
                                    enableButton()
                                    message_area.innerHTML = getMessage(false, 'Contraseña incorrecta.')
                                    return
                                }
                            } else if (found.found == false) {
                                enableButton()
                                message_area.innerHTML = getMessage(false, 'El usuario no se encuentra registrado en la base de datos.')
                                return
                            } else {
                                enableButton()
                                message_area.innerHTML = getMessage(false, `Hubo un error iniciando sesión: ${found.message}, por favor intentelo más tarde.`)
                            }
                        }():
                        (typeOfUser(email) == 'ADMIN') ? async function () {
                            disableButton()
                            let found = await fetch(`/loginadmin`, {
                                method: 'POST',
                                headers: {
                                    'Content-type': 'application/json; charset=utf-8'
                                },
                                body: JSON.stringify({
                                    user: email,
                                    password
                                })
                            }).then(async resp => await resp.json())
                            if (found.found == true) {
                                if (found.password) {
                                    enableButton()
                                    window.location.href = '/admin/user'
                                } else {
                                    enableButton()
                                    message_area.innerHTML = getMessage(false, 'Contraseña incorrecta.')
                                    return
                                }
                            } else if (found.found == false) {
                                enableButton()
                                message_area.innerHTML = getMessage(false, 'El usuario no se encuentra registrado en la base de datos.')
                                return
                            } else {
                                enableButton()
                                message_area.innerHTML = getMessage(false, `Hubo un error iniciando sesión: ${found.message}, por favor intentelo más tarde.`)
                            }
                        }(): {}
            }
            form.classList.add('was-validated')
        } catch (err) {
            message_area.innerHTML = getMessage(false, `Hubo un error en el inicio de sesion: ${err}`)
        }
    }
    
})(document, window)