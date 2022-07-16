const connection = require('./connection').connection

connection.on('disconnected', () => {
    console.log('BASE DE DATOS DESCONECTADA')
})
connection.on('connected', () => {
    console.log('BASE DE DATOS CONECTADA')
})
connection.on('error', (err) => {
    console.log(`ERROR EN LA BASE DE DATOS: ${err}`)
})
connection.on('reconnected', () => {
    console.log('BASE DE DATOS RECONECTADA')
})
connection.on('reconnectedFailed', () => {
    console.log('FALLO EN RECONECTAR')
})

module.exports = connection