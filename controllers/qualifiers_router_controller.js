'use strict'
const { EnrollmentStudent } = require("../models/enrollmentStudent"),
      { TitlePeriodStudent } = require("../models/periodsStudent"),
      { Activitie } = require("../models/activities")
var qualifiersController = {}
 
qualifiersController.renderQualifiersIndex = async (req, res) => {
    try{
        let {
        qualifier_name,
        qualifier_identifier,
        career
        } = req.session.auth,
        tentativeEnrollments = await EnrollmentStudent.find({
            'enrollment_features.career' : career,
            status: 'undefined'
        })
        res.render('qualifiers/vista_de_calificadores_index.pug', {
            title: 'Revisión de Matriculas',
            qualifier_name,
            qualifier_identifier,
            career, 
            tentativeEnrollments
        })
    }
    catch(err){
        res.send(`Hubo un error accediendo a la página: ${err.message}`)
    }
}
qualifiersController.renderQualifiersTitle = async (req, res) => {
    try{
        let {
        qualifier_name,
        qualifier_identifier,
        career
        } = req.session.auth,
        tentativeEnrollments = await TitlePeriodStudent.find({
            'enrollment_features.career' : career,
            status: 'undefined'
        })
        res.render('qualifiers/vista_de_calificadores_title.pug', {
            title: 'Revisión de Matriculas',
            qualifier_name,
            qualifier_identifier,
            career, 
            tentativeEnrollments
        })
    }
    catch(err){
        res.send(`Hubo un error accediendo a la página: ${err.message}`)
    }
}
qualifiersController.userActive = (req, res) => { 
    try{
        res.render('qualifiers/vista_de_qualifier_user', {
            title: 'Revisión de Matriculas'
        })
    }
    catch(err){
        res.send(`Hubo un error accediendo a la página: ${err.message}`)
    }
}
qualifiersController.setUser = async (req, res) => {
    try{
        let {qualifier_name, qualifier_identifier} = req.body
        let newActivitie = new Activitie({
            action: 'CALIFICADOR INICIA SESION',
            autor: ['CALIFICADOR', qualifier_name, qualifier_identifier],
            information: ['CALIFICADOR INICIA SESION', qualifier_name, qualifier_identifier, req.session.auth.career]
        })
        Object.assign(req.session.auth, {qualifier_name, qualifier_identifier})
        await newActivitie.save()
        res.status(200)
        res.json({status:true})
    }
    catch(err){
        res.status(500)
        res.json({status:false, message:err.message})
    }
}

module.exports = qualifiersController