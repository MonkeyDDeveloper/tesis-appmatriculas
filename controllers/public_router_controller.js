'use strict'
const public_router_controller = {},
    {
        Student
    } = require('../models/students'),
    {
        mecaModel,
        autoModel,
        diModel,
        mecModel,
        moniModel,
        rieModel,
        solModel
    } = require('../models/subjects'),{
        Activitie
    } = require('../models/activities'),
    Qualifier = require('../models/qualifiers'),
    Admin = require('../models/admin')

function qualifier_of(user) {
    if (/_AU}$/.test(user)) return 'AUTOMATIZACION E INSTRUMENTACION'
    if (/_MON}$/.test(user)) return 'MONITOREO AMBIENTAL'
    if (/_DI}$/.test(user)) return 'DESARROLLO INFANTIL INTEGRAL'
    if (/_MECA}$/.test(user)) return 'MECATRONICA'
    if (/_MEC}$/.test(user)) return 'MECANICA INDUSTRIAL'
    if (/_RIE}$/.test(user)) return 'SEGURIDAD Y PREVENCION DE RIESGOS LABORALES'
    if (/_SOL}$/.test(user)) return 'SOLDADURA'
}

function giveStudentSubjects (career){
    return new Promise(async (res, rej) => {
        try{
            if(career == 'AUTOMATIZACION E INSTRUMENTACION'){
                let subjects = await autoModel.find({})
                res(subjects)
            }
            if(career == 'MONITOREO AMBIENTAL'){
                let subjects = await moniModel.find({})
                res(subjects)
            }
            if(career == 'DESARROLLO INFANTIL INTEGRAL'){
                let subjects = await diModel.find({})
                res(subjects)
            }
            if(career == 'MECATRONICA'){
                let subjects = await mecaModel.find({})
                res(subjects)
            }
            if(career == 'MECANICA INDUSTRIAL'){
                let subjects = await mecModel.find({})
                res(subjects)   
            }
            if(career == 'SEGURIDAD Y PREVENCION DE RIESGOS LABORALES'){
                let subjects = await rieModel.find({})
                res(subjects)   
            }
            if(career == 'SOLDADURA'){
                let subjects = await solModel.find({})
                res(subjects)   
            }
        }
        catch(err){
            rej(`Hubo un error otorgando las materias del estudiante:${err.message}`)
        }
    })
}

function existAlumn(no_identifier, email){
    return new Promise(async (res,rej) => {
        try{
            let findings = await Student.find({$or:[{no_identifier},{email}]})
            if(findings.length>0){
                res(true)
            }
            else res(false)
        }
        catch(err){
            rej(err)
        }
    })
}

public_router_controller.renderVistaDeInicio = (req, res) => {
    try{
        let success = res.locals.success
        let error = res.locals.session_error
        res.render('public/vista_de_inicio', {
            success,
            error
        })
    }
    catch(err){
        res.send(`Hubo un error accediendo a la página: ${err.message}`)
    }
}

public_router_controller.renderVistaDeAcerca = (req, res) => {
    try{
        res.render('public/vista_de_acerca')
    }
    catch(err){
        res.send(`Hubo un error accediendo a la página: ${err.message}`)
    }
}

public_router_controller.renderVistaDeCarreras = (req, res) => {
    try{
        res.render('public/vista_de_carreras')
    }
    catch(err){
        res.send(`Hubo un error accediendo a la página: ${err.message}`)
    }
}

public_router_controller.renderVistaDeRegistro = (req, res) => {
    try{
        res.render('public/vista_de_registro')
    }
    catch(err){
        res.send(`Hubo un error accediendo a la página: ${err.message}`)
    }
}

public_router_controller.registerStudent = async (req, res) => {
    try {
        let {career, email, no_identifier} = req.body
        let exists = await existAlumn(no_identifier,email)
        if(!exists) {
            req.body.subjects = await giveStudentSubjects(career)
            let newStudent = new Student(req.body),
                newActivitie = new Activitie({
                    action: 'ESTUDIANTE REGISTRO',
                    autor: ['ESTUDIANTE', newStudent.getName, no_identifier],
                    information: ['NUEVO ESTUDIANTE REGISTRADO']
                })
            await newActivitie.save()
            await newStudent.save()
            req.flash('success', 'Tu cuenta ha sido creada correctamente')
            res.json({
                status: true,
                msg: `Tu cuenta ha sido creada correctamente`
            })
        }
        else{
            res.json({
                status:false,
                msg:'El usuario ya está registrado o el email ya se encuentra en uso, por favor verifique sus datos.'
            })
        }
    } catch (err) {
        res.json({
            status: false,
            msg: `Hubo un error al intentar guardar en la base datos ${err}`
        })
    }
}

public_router_controller.logInStudent = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body
        let student = await Student.findOne({email})
        if (!student) {
            return res.json({
                found: false
            })
        } else {
            let isPasswordCorrect = student.comparePassword(password)
            if (!isPasswordCorrect) return res.json({
                found: true,
                password: false
            })
            else {
                req.session.auth = {
                    status: true,
                    type: 'STUDENT',
                    career:student.career, 
                    identifier: student.no_identifier,
                    name: student.getName,
                    fullName: student.getFullName 
                }
                req.flash('success', (student.sex) ? `Bienvenido, ${student.first_name}` : `Bienvenida, ${student.first_name}`)
                return res.json({
                    found: true,
                    password: true
                })
            }
        }
    } catch (err) {
        res.json({
            found: 'UNDEFINED',
            message: err.message
        })
    }
}

public_router_controller.logInQualifier = async (req, res) => {
    try {
        const {
            user,
            password
        } = req.body
        let qualifier = await Qualifier.findOne({
            user
        })
        if (!qualifier) return res.json({
            found: false
        })
        else {
            let isPasswordCorrect = qualifier.comparePass(password)
            if (!isPasswordCorrect) return res.json({
                found: true,
                password: false
            })
            else {
                let career = qualifier_of(user)
                req.session.auth = {
                    status: true,
                    type: 'QUALIFIER',
                    _id: qualifier._id,
                    career
                }
                return res.json({
                    found: true,
                    password: true
                })
            }
        }
    } catch (err) {
        res.json({
            found: 'UNDEFINED',
            message: err.message
        })
    }
}

public_router_controller.logInAdmin = async (req, res) => {
    try {
        const {
            user,
            password
        } = req.body
        let admin = await Admin.findOne({
            user
        })
        if (!admin) return res.json({
            found: false
        })
        else {
            let isPasswordCorrect = admin.comparePass(password)
            if (!isPasswordCorrect) return res.json({
                found: true,
                password: false
            })
            else {
                req.session.auth = {
                    status: true,
                    type: 'ADMIN',
                    _id: admin._id
                }
                return res.json({
                    found: true,
                    password: true
                })
            }
        }
    } catch (err) {
        res.json({
            found: 'UNDEFINED',
            message: err.message
        })
    }
}

public_router_controller.logOut = (req, res) => {
    req.session.auth = null
    res.redirect('/')
}

module.exports = public_router_controller