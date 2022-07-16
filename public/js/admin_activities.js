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
        activities_container = document.getElementById('activities_container'),
        more = document.getElementById('more') || false
        less = document.getElementById('less') || false

    var filters = []

    function getMessage(status, message) {
        return `<div class="alert alert-${status ? 'success' : 'warning'} alert-dismissible fade show" role="alert">${message}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`
    }

    function generateFilter(filters) {
        let queries = ''
        filters.forEach(v => {
            let key = Object.keys(v)[0]
            queries += `[data-${key}="${v[key]}"]`
        })
        return queries
    }

    function filterEnroll(filters) {
        let childs = Array.from(activities_container.querySelectorAll(generateFilter(filters)))
        if (childs.length > 0) {
            message_area.innerHTML = ''
            childs.forEach(child => {
                activities_container.removeChild(child)
                activities_container.prepend(child)
            })
        } else {
            message_area.innerHTML = getMessage(false, 'No se ha encontrado ninguna matricula que coincida con los filtros.')
        }
    }

    function logOut() {
        alert('El número de identificación que ha ingresado ya está en uso, por cuestiones de seguridad se cerrará esta sesión.')
        window.location.replace('/logOut')
    }

    function getLessActivities (e) {
        window.location.replace(`${window.location.pathname}?less=${e.target.dataset.current}`)
    }

    function getMoreActivities (e) {
        window.location.replace(`${window.location.pathname}?next=${e.target.dataset.current}`)
        // try {
        //     let response = await fetch(`${window.location.pathname}?next=${e.target.dataset.current}`)
        //     let json = await response.json()
        //     if(json.found == false) {
        //         e.target.style.display = 'none'
        //         throw new Error('No se han encontrado más actividades')
        //     }
        //     else {
        //         console.log(json.activities)
        //         if (json.more) {
        //             e.target.dataset.current = json.current
        //         }
        //         else {
        //             e.target.style.display = 'none'
        //         }
        //     }
        // }
        // catch (err) {
        //     message_area.innerHTML = getMessage(false, err.message)
        // }
    }

    socket.on('noValidPass', logOut)

    if(more) {
        more.onclick = getMoreActivities
    }
    if(less) {
        less.onclick = getLessActivities
    }

    form_filter.onsubmit = function (e) {
        try {
            e.preventDefault()
            e.stopPropagation()
            filters = []
            if (e.target.type_filter.value) filters.push({
                type: e.target.type_filter.value
            })
            if (e.target.date_filter.value) filters.push({
                date: e.target.date_filter.value
            })
            if (e.target.autor_filter.value) filters.push({
                autor: e.target.autor_filter.value 
            })
            if (filters.length > 0) filterEnroll(filters)
        } catch (err) {
            message_area.innerHTML = getMessage(false, err.message)
        }
    }

})(document, window, io, bootstrap)