const mongoose = require('mongoose')
const deve = process.env.DEVE
const prod = process.env.PROD
const local = process.env.LOCAL
mongoose.connect(prod, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false, 
    useCreateIndex: true,
    poolSize: 300
}, err => err ? console.log(`ERROR CONECTANDO A LA BASE DE DATOS: ${err}`) : {})

module.exports = mongoose
