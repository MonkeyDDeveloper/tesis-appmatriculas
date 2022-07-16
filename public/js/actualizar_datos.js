(async function () {
    const student_identifier = document.getElementById('no_identifier').value,
        socket = io.connect({
            auth: {
                type: 'S',
                user: student_identifier
            }
        }),
        form = document.getElementById('form_actualizar'),
        mapBoxToken = {
            token: 'pk.eyJ1IjoibW9ua2V5ZGZyYXkiLCJhIjoiY2tzbTRidGN3MzNreDJ3cm9ucTRuaWF4ZiJ9.ztttsw5uVLFU4wO0WXtyCw'
        },
        student_lng = document.getElementById('lng'),
        student_lat = document.getElementById('lat'),
        map_container = document.getElementById('mapid'),
        first_element = document.getElementById('validationCustom01'),
        etnia = document.getElementById('floatingSelect3'),
        pueblo = document.getElementById('floatingSelect4'),
        discapacidad = document.getElementById('floatingSelect6'),
        tipo_de_discapacidad = document.getElementById('floatingSelect7'),
        porcentaje_de_discapacidad = document.getElementById('porcentaje_de_discapacidad'),
        porcentaje_numero = document.getElementById('porcentaje_numero'),
        carnet_conadis = document.getElementById('floatingInput'),
        nacionalidad = document.getElementById('floatingSelect8'),
        provincia = document.getElementById('floatingSelect9'),
        select_canton = document.getElementById('floatingSelect10'),
        message_area = document.getElementById('message_area'),
        btn_submit = document.getElementById('btn_submit'),
        provincia_residencia = document.getElementById('floatingSelect12'),
        select_canton_residencia = document.getElementById('floatingSelect13'),
        spinner = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span><span>Actualizando</span>`,
        CANTONES = {
            AZUAY: ['Chordeleg', 'Cuenca', 'El Pan', 'Giron', 'Guachapala', 'Gualaceo', 'Nabon', 'Ona', 'Paute', 'Ponce Enriquez', 'Pucara', 'San Fernando', 'Santa Isabel', 'Sevilla de Oro', 'Sigsig'],
            BOLIVAR: ['Caluma', 'Chillanes', 'Chimbo', 'Echeandia', 'Guaranda', 'Las Naves', 'San Miguel'],
            CANAR: ['Azogues', 'Biblian', 'Canar', 'Deleg', 'El Tambo', 'La Troncal', 'Suscal'],
            CARCHI: ['Bolivar', 'Espejo', 'Mira', 'Montufar', 'San Pedro de Huaca', 'Tulcan'],
            CHIMBORAZO: ['Alausi', 'Colta', 'Cumanda', 'Chambo', 'Chunchi', 'Guamote', 'Guano', 'Pallatanga', 'Penipe', 'Riobamba'],
            COTOPAXI: ['La Mana', 'Latacunga', 'Pangua', 'Pujili', 'Salcedo', 'Saquisili', 'Sigchos'],
            ELORO: ['Arenillas', 'Atahualpa', 'Balsas', 'Chilla', 'El Guabo', 'Huaquillas', 'Las Lajas', 'Machala', 'Marcabeli', 'Pasaje', 'Piñas', 'Portovelo', 'Santa Rosa', 'Zaruma'],
            ESMERALDAS: ['Atacames', 'Eloy Alfaro', 'Esmeraldas', 'Muisne', 'Quininde', 'Rioverde', 'San Lorenzo'],
            GALAPAGOS: ['Isabela', 'San Cristobal', 'Santa Cruz'],
            GUAYAS: ['Alfredo Baquerizo Moreno', 'Balao', 'Balzar', 'Colimes', 'Daule', 'Duran', 'El Empalme', 'El Triunfo', 'Gral. Antonio Elizalde', 'Gral. Villamil Playas', 'Guayaquil', 'Isidro Ayora', 'Lomas de Sargentillo', 'Marcelino Mariduena', 'Milagro', 'Naranjal', 'Naranjito', 'Nobol', 'Palestina', 'Pedro Carbo', 'Salitre', 'Samborondon', 'Santa Lucia', 'Simon Bolivar', 'Yaguachi'],
            IMBABURA: ['Antonio Ante', 'Cotacachi', 'Ibarra', 'Otavalo', 'Pimampiro', 'Urcuqui'],
            LOJA: ['Calvas', 'Catamayo', 'Celica', 'Chaguarpamba', 'Espindola', 'Gonzanama', 'Loja', 'Macara', 'Olmedo', 'Paltas', 'Pindal', 'Puyango', 'Quilanga', 'Saraguro', 'Sozoranga', 'Zapotillo'],
            LOSRIOS: ['Baba', 'Babahoyo', 'Buena Fe', 'Mocache', 'Montalvo', 'Palenque', 'Puebloviejo', 'Quevedo', 'Quinsaloma', 'Urdaneta', 'Valencia', 'Ventanas', 'Vinces'],
            MANABI: ['Bolivar', 'Chone', 'El Carmen', 'Flavio Alfaro', 'Jama', 'Jaramijo', 'Jipijapa', 'Junin', 'Manta', 'Montecristi', 'Olmedo', 'Pajan', 'Pedernales', 'Pichincha', 'Portoviejo', 'Puerto Lopez', 'Rocafuerte', 'San Vicente', 'Santa Ana', 'Sucre', 'Tosagua', 'Veinticuatro de Mayo'],
            MORONASANTIAGO: ['Morona', 'Gualaquiza', 'Limon Indanza', 'Palora', 'Santiago de Mendez', 'Sucua', 'Huamboya', 'San Juan Bosco', 'Taisha', 'Logrono', 'Pablo VI', 'Taisha'],
            NAPO: ['Archidona', 'Carlos Julio Arosemena Tola', 'El Chaco', 'Quijos', 'Tena'],
            ORELLANA: ['Aguarico', 'Orellana', 'La Joya de los Sachas', 'Loreto'],
            PASTAZA: ['Arajuno', 'Mera', 'Pastaza', 'Santa Clara'],
            PICHINCHA: ['Cayambe', 'Mejia', 'Pedro Moncayo', 'Pedro Vicente Maldonado', 'Puerto Quito', 'Distrito Metropolitano de Quito', 'Ruminahui', 'San Miguel de Los Bancos'],
            SANTAELENA: ['La Libertad', 'Salinas', 'Santa Elena'],
            SANTODOMINGODELOSTSACHILAS: ['La Concordia', 'Santo Domingo'],
            SUCUMBIOS: ['Cascales', 'Cuyabeno', 'Gonzalo Pizarro', 'Lago Agrio', 'Putumayo', 'Shushufindi', 'Sucumbios'],
            TUNGURAHUA: ['Ambato', 'Baños de Agua Santa', 'Cevallos', 'Mocha', 'Patate', 'Pelileo', 'Pillaro', 'Quero', 'Tisaleo'],
            ZAMORACHINCHIPE: ['Centinela del Condor', 'Chinchipe', 'El Pangui', 'Nangaritza', 'Palanda', 'Paquisha', 'Yacuambi', 'Yantzaza', 'Zamora']
        }

    var position = null,
        firstOption = '<option value="" selected>Ninguno</option>'

    function mapError() {
        map_container.innerHTML = ''
        map_container.style.backgroundColor = '#D3D3D3'
        message_area.innerHTML = getMessage(false, 'Hubo un error cargando los elementos necesarios para la actualización de domicilio, por favor intentelo más tarde. Aún puede actualizar el resto de datos sin ningún inconveniente.')
    }

    function initMapBox() {
        try {
            var map = new mapboxgl.Map({
                accessToken: mapBoxToken.token,
                container: 'mapid',
                style: 'mapbox://styles/mapbox/streets-v11',
                center: [student_lng.value, student_lat.value],
                zoom: 13
            });
            position = new mapboxgl.Marker().setLngLat([student_lng.value, student_lat.value]).addTo(map)
            map.on('click', (e) => {
                let {
                    lng,
                    lat
                } = e.lngLat
                student_lng.value = lng.toFixed(5)
                student_lat.value = lat.toFixed(5)
                map.flyTo({
                    center: [lng, lat]
                });
                let new_position = new mapboxgl.Marker()
                    .setLngLat([lng, lat])
                    .addTo(map);
                position.remove()
                position = new_position
            });
            map.on('error', () => {
                mapError()
            })
        } catch (err) {
            mapError()
        }
    }

    function firsOptionBirth(status) {
        firstOption = status ? `<option value="" selected>Ninguno</option>` : `<option value="NO APLICA" selected>Ninguno</option>`
    }

    function changeFirstOptions() {
        let first = document.createElement('div')
        first.innerHTML = firstOption
        let first_s = document.createElement('div')
        first_s.innerHTML = firstOption
        provincia.replaceChild(first.childNodes[0], provincia.childNodes[0])
        select_canton.replaceChild(first_s.childNodes[0], select_canton.childNodes[0])
    }

    function getMessage(status, message) {
        return `<div class="alert alert-${status ? 'success' : 'warning'} alert-dismissible fade show" role="alert">${message}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`
    }

    function getMessageIndex(status, message) {
        return `<div class="alert alert-${status ? 'success' : 'warning'} alert-dismissible fade show" role="alert">${message} Regrese al <a href="/student/index">inicio.</a><button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`
    }

    function disableButton() {
        btn_submit.innerHTML = spinner
        btn_submit.setAttribute('disabled', 'true')
    }

    function enableButton() {
        btn_submit.innerHTML = `Actualizar`
        btn_submit.removeAttribute('disabled')
    }

    function removeAtt(element, att) {
        element.removeAttribute(att)
    }

    function setAtt(element, att, val = '') {
        element.setAttribute(att, val)
    }

    function writeDisabilityNumber() {
        let value = Number(porcentaje_de_discapacidad.value)
        if (Number(value) > 0) {
            porcentaje_numero.innerHTML = `Porcentaje de discapacidad: <strong>${porcentaje_de_discapacidad.value}%</strong>`
        } else {
            porcentaje_numero.innerHTML = `NO APLICA`
        }
    }

    function disabilityChangeTrue() {
        removeAtt(tipo_de_discapacidad, 'disabled')
        removeAtt(carnet_conadis, 'disabled')
        removeAtt(porcentaje_de_discapacidad, 'disabled')
        setAtt(tipo_de_discapacidad, 'required')
        setAtt(carnet_conadis, 'required')
        setAtt(porcentaje_de_discapacidad, 'required')
        setAtt(porcentaje_de_discapacidad, 'min', '25')
        porcentaje_de_discapacidad.value = '65'
        writeDisabilityNumber()
    }

    function discapacityChangeFalse() {
        removeAtt(tipo_de_discapacidad, 'required')
        removeAtt(carnet_conadis, 'required')
        removeAtt(porcentaje_de_discapacidad, 'required')
        setAtt(tipo_de_discapacidad, 'disabled')
        setAtt(carnet_conadis, 'disabled')
        setAtt(porcentaje_de_discapacidad, 'disabled')
        setAtt(porcentaje_de_discapacidad, 'min', '0')
        porcentaje_de_discapacidad.value = '0'
        carnet_conadis.value = ''
        writeDisabilityNumber()
    }

    function escribirCantones(cantones) {
        select_canton.innerHTML = firstOption
        cantones.forEach(canton => {
            select_canton.innerHTML += `<option value="${canton.toUpperCase()}">${canton}</option>`
        })
    }

    function escribirCantonesResidencia(cantones) {
        select_canton_residencia.innerHTML = '<option value="">Ninguno</option>'
        cantones.forEach(canton => {
            select_canton_residencia.innerHTML += `<option value="${canton.toUpperCase()}">${canton}</option>`
        })
    }

    function stablishDataToSend(form) {
        let defaultData = {
                village: 'NO APLICA',
                disability_type: 'NO APLICA',
                disability_percentage: 'NO APLICA',
                conadis_msp: 'NO APLICA',
                province_birth: 'NO APLICA',
                canton_birth: 'NO APLICA'
            },
            dataToSend = Object.assign(defaultData, Object.fromEntries(new FormData(form).entries())),
            {
                lng,
                lat
            } = dataToSend,
            direction = [lng, lat]
        dataToSend.direction = direction
        delete dataToSend.lng
        delete dataToSend.lat
        return dataToSend
    }

    etnia.onchange = function () {
        if (this.value == 'INDIGENA') {
            removeAtt(pueblo, 'disabled')
            setAtt(pueblo, 'required')
        } else {
            pueblo.value = ''
            removeAtt(pueblo, 'required')
            setAtt(pueblo, 'disabled')
        }
    }

    discapacidad.onchange = function () {
        if (this.value == 'true') {
            disabilityChangeTrue()
        } else {
            discapacityChangeFalse()
        }
    }

    porcentaje_de_discapacidad.onchange = function () {
        writeDisabilityNumber()
    }

    nacionalidad.onchange = function () {
        if (this.value == 'ECUADOR') {
            setAtt(provincia, 'required')
            setAtt(select_canton, 'required')
            firsOptionBirth(true)
            changeFirstOptions()
        } else {
            removeAtt(provincia, 'required')
            removeAtt(select_canton, 'required')
            firsOptionBirth(false)
            changeFirstOptions()
        }
    }

    provincia.onchange = function () {
        if (Boolean(this.value) && this.value != 'NO APLICA') escribirCantones(CANTONES[this.value.replace(/\s+/g, '')])
    }

    provincia_residencia.onchange = function () {
        if (Boolean(this.value)) escribirCantonesResidencia(CANTONES[this.value.replace(/\s+/g, '')])
    }

    form.onsubmit = async function (e) {
        try {
            e.preventDefault()
            if (form.checkValidity()) {
                disableButton()
                let newStudentData = stablishDataToSend(e.target)
                socket.emit('studentActData', newStudentData)
            }
            else first_element.focus()
            form.classList.add('was-validated')
        } catch (err) {
            enableButton()
            console.log(err.message)
        }
    }

    socket.on('studentActData_success', message => {
        enableButton()
        message_area.innerHTML = getMessageIndex(true, message)
    })

    socket.on('studentActData_error', message => {
        enableButton()
        message_area.innerHTML = getMessage(false, message)
    })

    initMapBox()

})(document, window)