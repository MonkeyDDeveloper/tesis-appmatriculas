const mongoose = require('mongoose')
const deve = 'mongodb+srv://ISPIB_USER:ISPIB_PASSWORD@cluster0.xlnsm.mongodb.net/APPMATRICULAS?retryWrites=true&w=majority'
const prod = 'mongodb+srv://ISPIBMBR:ISPIBMBRAPPLICATION@cluster0.q0ioi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
const local = 'mongodb://app_matriculas_admin:ispedib_20000218@127.0.0.1:27017/?authSource=app_matriculas&readPreference=primary&directConnection=true&ssl=false'
mongoose.connect(prod, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false, 
    useCreateIndex: true,
    // dbName: 'app_matriculas',
    // user: 'app_matriculas_admin',
    // pass: 'ispedib_20000218',
    poolSize: 300
}, err => err ? console.log(`ERROR CONECTANDO A LA BASE DE DATOS: ${err}`) : {})

module.exports = mongoose