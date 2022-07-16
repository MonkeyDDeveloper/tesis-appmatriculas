'use strict'
const 
    { Enrollment } = require('../models/enrollments'),
    { Student } = require('../models/students'), 
    { EnrollmentStudent } = require('../models/enrollmentStudent'),
    {TitlePeriod} = require('../models/periods'),
    {TitlePeriodStudent} = require('../models/periodsStudent'),
    {Activitie} = require('../models/activities'),
    del = require('del'),
    path = require('path'),
    events_controller = {}


function deleteFilesFolder(enroll, ci) {
    return new Promise(async (res, rej) => {
        try {
            let {
                period,
                year
            } = enroll
            let pathToDelete = path.join(__dirname, '..', '..', 'RESPALDOS_APLICACION', 'ENROLLMENTFILES', period, year, ci)
            await del([pathToDelete], {force: true})
            res(true)
        } catch (err) {
            rej(err)
        }
    })
}

function deleteFilesFolderTitlePeriod(enroll, ci) {
    return new Promise(async (res, rej) => {
        try {
            let {
                period,
                year
            } = enroll
            let pathToDelete = path.join(__dirname, '..', '..', 'RESPALDOS_APLICACION', 'PERIODSFILES', period, year, ci)
            await del([pathToDelete], {force: true})
            res(true)
        } catch (err) {
            rej(err)
        }
    })
}

function lookForEnrollment(career) {
    return new Promise(async (res, rej) => {
        try {
            let enrollmentExist = await Enrollment.findOne({
                career
            })
            if (!enrollmentExist) res(false)
            else throw new Error('No se puede publicar dos matrículas de la misma carrera al mismo tiempo')
        } catch (err) {
            rej(err)
        }
    })
}

function lookForTitlePeriod(career) {
    return new Promise(async (res, rej) => {
        try {
            let periodExist = await TitlePeriod.findOne({
                career
            })
            if (!periodExist) res(false)
            else throw new Error('No se puede publicar dos periodos de titulación de la misma carrera al mismo tiempo')
        } catch (err) {
            rej(err)
        }
    })
}

async function getDrags(subjects, status, compare) {
    let toReturn = false
    let subbjects = status ? compare : subjects
    let aprobed_subjects = status ? subjects : subjects.filter(sub => {
        if (sub.status == true && Number(sub.level) > 1) return sub
    })
    if (aprobed_subjects.length > 0) {
        aprobed_subjects.forEach(sub => {
            let level = Number(sub.level) - 1
            for (level; level >= 1; level--) {
                let filteredByLevel = subbjects.filter(sub_2 => Number(sub_2.level) == level)
                if (filteredByLevel.some(subb => subb.status == false && sub.ref.length>0)) {
                    toReturn = true
                }
            }
        })
    }
    return toReturn
}

async function getLevel(subjects) {
    let reprobedSubjects = subjects.filter(sub => sub.status == false)
    if (reprobedSubjects.length > 0) {
        if (reprobedSubjects.length > 1) {
            let levels = reprobedSubjects.map(sub => {
                return sub.level
            })
            return Math.min(...levels)
        } else return reprobedSubjects[0].level
    } 
    else return '5'
}

function insertUpdatedStudent(student){
    return new Promise((res,rej) => {
        try{
            let withOutEnrollment = {}
            for(let [key, value] of Object.entries(student.toObject())){
                if(key != 'enrollment'){
                    withOutEnrollment[key] = value
                }
            }
            res(withOutEnrollment)
        }
        catch(err){
            rej(`err at ${err}`)
        }
    })
}

function replaceStudentEnrollment(enrollments, newEnrollment){
    return new Promise( (res, rej) => {
        try{
            enrollments.forEach( (e, index) => { 
                if(`${e._id}`==`${newEnrollment._id}`){
                    enrollments.splice(index, 1, newEnrollment)
                }
            })
            res(enrollments)
        }
        catch(err){
            rej(err)
        }
    })
}


events_controller.saveNewEnrollment = (enrollmentData) => {
    return new Promise(async (res, rej) => {
        try {
            await lookForEnrollment(enrollmentData.career)
            let newEnrollment = new Enrollment(enrollmentData),
                newActivitie = new Activitie({
                    action: 'ADMIN PROCESO', 
                    autor: ['ADMIN', newEnrollment.published_by[0]],
                    information: ['REGISTRO DE NUEVO PROCESO', newEnrollment.career,newEnrollment.type,newEnrollment.period,newEnrollment.year]
                })
            await newEnrollment.save()
            await newActivitie.save()
            res({
                status: true,
                enrollment: newEnrollment
            })
        } catch (err) {
            rej({
                status: false,
                err_message: err.message
            })
        }
    })
}

events_controller.saveNewTitlePeriod = (titlePeriodData) => {
    return new Promise(async (res, rej) => {
        try {
            await lookForTitlePeriod(titlePeriodData.career)
            let newPeriod = new TitlePeriod(titlePeriodData),
                newActivitie = new Activitie({
                    action: 'ADMIN TITULACION', 
                    autor: ['ADMIN', newPeriod.published_by[0]],
                    information: ['REGISTRO DE NUEVO PERIODO DE TITULACIÓN', newPeriod.career, newPeriod.type[1], newPeriod.period, newPeriod.year]
                })
            await newPeriod.save()
            await newActivitie.save()
            res({
                status: true,
                period: newPeriod
            })
        } catch (err) {
            rej({
                status: false,
                err_message: err.message
            })
        }
    })
}

events_controller.deleteEnrollment = data => {
    return new Promise(async (res, rej) => {
        try {
            let enroll = await Enrollment.findByIdAndDelete(data[0]),
                newActivitie = new Activitie({
                    action: 'ADMIN PROCESO', 
                    autor: ['ADMIN', data[1]],
                    information: ['ELIMINACIÓN PROCESO', enroll.career, enroll.type, enroll.period, enroll.year]
                })
            await newActivitie.save()
            res({
                status: true,
                id:data[0]
            })
        } catch (err) {
            rej({
                status: false,
                err_message: err.message
            })
        }
    })
}

events_controller.deleteTitlePeriod = data => {
    return new Promise(async (res, rej) => {
        try {
            let titlePeriod = await TitlePeriod.findByIdAndDelete(data[0]),
                newActivitie = new Activitie({
                    action: 'ADMIN TITULACION', 
                    autor: ['ADMIN', data[1]],
                    information: ['ELIMINACIÓN DE PERIODO DE TITULACIÓN', titlePeriod.career, titlePeriod.type[1], titlePeriod.period, titlePeriod.year]
                })
            await newActivitie.save()
            res({
                status: true,
                id:data[0]
            })
        } catch (err) {
            rej({
                status: false,
                err_message: err.message
            })
        }
    })
}

events_controller.updateStudent = data => {
    return new Promise(async (res, rej) => {
        try {
            let enroll = await EnrollmentStudent.findById(data.enrollment)
            if(enroll) {
                let student = await Student.findOne({
                    no_identifier: data.student[0]
                }),
                    r_s = enroll.request_subjects
                enroll.qualified = [true, data.admin]
                if (student) {
                    let features = enroll.enrollment_features,
                        newActivitie = new Activitie({
                        action: 'ADMIN CALIFICACION',
                        autor: ['ADMIN', data.admin[0]],
                        information: ['CALIFICACIÓN DE MATRÍCULA', student.no_identifier, features.career, features.type, features.period, features.year]
                    })
                    if (Object.values(data).some(val => val == 'false')) {
                        student.gratuity = false
                        student.subjects_repeated = true
                    }
                    Object.entries(data).forEach(sub => {
                        if (/[0-9]/.test(sub[0])) {
                            let s_sub = student.subjects.filter(subb => subb.no == sub[0])
                            s_sub[0].last_modify = data.admin
                            if (sub[1] == 'true') {
                                s_sub[0].status = true
                                r_s.forEach((s, index) => {
                                    if (s.no == s_sub[0].no) {
                                        r_s.splice(index, 1, s_sub[0])
                                    }
                                })
                            } else {
                                s_sub[0].status = false
                                s_sub[0].enrollment = `${Number(s_sub[0].enrollment) + 1}`
                            }
                            student.subjects.forEach((ss_sub, index) => {
                                if (ss_sub.no == s_sub[0].no) {
                                    student.subjects.splice(index, 1, s_sub[0])
                                }
                            })
                        }
                    })
                    enroll.request_subjects = r_s
                    student.enrollment.forEach((enroll_p, index) => {
                        if (enroll_p._id == data.enrollment && enroll_p.status=='true') {
                            student.enrollment.splice(index, 1, enroll)
                        }
                    })
                    student.drags = await getDrags(student.subjects, false)
                    student.level = await getLevel(student.subjects)
                    student.enroll_active = false
                    await student.save()
                    await enroll.save()
                    await newActivitie.save()
                    res(data.enrollment)
                } else throw new Error('Estudiante no encontrado en la base de datos')
            }
            else res(data.enrollment)
        } catch (err) {
            rej(err)
        }
    })
}

events_controller.updateStudentTitle = data => {
    return new Promise(async (res, rej) => {
        try {
            let enroll = await TitlePeriodStudent.findById(data.enrollment)
            if(enroll) {
                let student = await Student.findOne({
                    no_identifier: data.student[0]
                })
                enroll.qualified = [true, data.admin]
                if (student) {
                    let features = enroll.enrollment_features,
                        newActivitie = new Activitie({
                        action: 'ADMIN CALIFICACION TITULACION',
                        autor: ['ADMIN', data.admin[0]],
                        information: ['CALIFICACIÓN DE MATRÍCULA DE TITULACION', student.no_identifier, features.career, features.type[1], features.period, features.year]
                    })
                    student.periods.forEach((enroll_p, index) => {
                        if (enroll_p._id == data.enrollment && enroll_p.status=='true') {
                            student.periods.splice(index, 1, enroll)
                        }
                    })
                    student.enroll_active = false
                    await student.save()
                    await enroll.save()
                    await newActivitie.save()
                    res(data.enrollment)
                } else throw new Error('Estudiante no encontrado en la base de datos')
            }
            else res(data.enrollment)
        } catch (err) {
            rej(err)
        }
    })
}
 
events_controller.updateStudentData = (formData, admin) => {
    return new Promise(async (res, rej) => {
        try {
            let student = await Student.findById(formData._id),
                newActivitie = new Activitie({
                    action: 'ADMIN ACTUALIZACION',
                    autor: ['ADMIN', admin],
                    information: ['ACTUALIZACIÓN DE ESTUDIANTE', student.getName, student.no_identifier]
                })
            student.work_day = formData.work_day
            student.modality = formData.modality
            student.gratuity = formData.gratuity
            student.drags = formData.drags
            student.subjects_repeated = formData.subjects_repeated
            Object.entries(formData).forEach(sub => {
                if (/^e/.test(sub[0])) {
                    let s_sub = student.subjects.filter(subb => subb.no == /[0-9]+/.exec(sub[0])[0])
                    s_sub[0].last_modify = formData.admin
                    s_sub[0].enrollment = sub[1]
                    student.subjects.forEach((ss_sub, index) => {
                        if (ss_sub.no == s_sub[0].no) {
                            student.subjects.splice(index, 1, s_sub[0])
                        }
                    })
                } else if (/[0-9]/.test(sub[0])) {
                    let s_sub = student.subjects.filter(subb => subb.no == sub[0])
                    s_sub[0].last_modify = formData.admin
                    if (sub[1] == 'true') {
                        s_sub[0].status = true
                    } else {
                        s_sub[0].status = false
                    }
                    student.subjects.forEach((ss_sub, index) => {
                        if (ss_sub.no == s_sub[0].no) {
                            student.subjects.splice(index, 1, s_sub[0])
                        }
                    })
                } else if (/password/.test(sub[0])) {
                    student.password = sub[1]
                }
            })
            student.drags = await getDrags(student.subjects, false)
            student.level = await getLevel(student.subjects)
            await student.save()
            await newActivitie.save()
            res({
                id: student.no_identifier,
                message: 'Datos actualizados con éxito.'
            })
        } catch (err) {
            rej(new Error(`SERVER ERROR : ${err.message}`))
        }
    })
}

events_controller.deleteStudent = (_id, admin) => {
    return new Promise(async (res, rej) => {
        try{
            let student = await Student.findByIdAndDelete(_id),
                newActivitie = new Activitie({
                    action: 'ADMIN ELIMINACION ESTUDIANTE',
                    autor: ['ADMIN', admin],
                    information: ['ELIMINACIÓN DE ESTUDIANTE', student.getName, student.no_identifier]
                })
            await newActivitie.save()
            res({_id})
        }
        catch(err){
            rej(err)
        }
    })
}

events_controller.deleteStudentEnrollment = (_id, admin) => {
    return new Promise(async (res, rej) => {
        try{
            let enrollment = await EnrollmentStudent.findById(_id, 'student qualified enrollment_features')
            if(enrollment && enrollment.qualified[0]==false){
                let student = await Student.findOne({no_identifier:enrollment.student[0]}, 'no_identifier enrollment enroll_active number_enrollments'),
                    features = enrollment.enrollment_features,
                    newActivitie = new Activitie({
                        action: 'ADMIN ELIMINACION MATRICULA',
                        autor: ['ADMIN', admin],
                        information: ['ELIMINACION DE MATRICULA ESTUDIANTIL', enrollment.student[0], features.career,features.type,features.period,features.year]
                    })
                    if(student){
                        await deleteFilesFolder(features, student.no_identifier)
                        student.number_enrollments = student.number_enrollments - 1
                        student.enroll_active = false
                        student.enrollment.some( (e, i) => {
                            if(e._id.toString() == _id) {
                                student.enrollment.splice(i, 1)
                                return true
                            }
                            return false
                        })
                        await student.save()
                    }
                    await EnrollmentStudent.findByIdAndDelete(_id)
                    await newActivitie.save()
            }
            res(true)
        }
        catch(err){
            rej(err)
        }
    })
}

events_controller.deleteStudentEnrollmentTitle = (_id, admin) => {
    return new Promise(async (res, rej) => {
        try{
            let enrollment = await TitlePeriodStudent.findById(_id, 'student qualified enrollment_features')
            if(enrollment && enrollment.qualified[0]==false){
                let student = await Student.findOne({no_identifier:enrollment.student[0]}, 'no_identifier periods enroll_active number_enrollments'),
                    features = enrollment.enrollment_features,
                    newActivitie = new Activitie({
                        action: 'ADMIN ELIMINACION MATRICULA TITULACION',
                        autor: ['ADMIN', admin],
                        information: ['ELIMINACION DE MATRICULA ESTUDIANTIL EN TITULACION', enrollment.student[0], features.career,features.type[1],features.period,features.year]
                    })
                    if(student){
                        await deleteFilesFolderTitlePeriod(features, student.no_identifier)
                        student.number_enrollments = student.number_enrollments - 1
                        student.enroll_active = false
                        student.periods.some( (e, i) => {
                            if(e._id == _id) {
                                if(student.periods.length > 1) student.periods.splice(i, 1)
                                else student.periods.splice(i, 1, {qualified:[false], enrollment_features:{type:[0.1]}})
                                return true
                            }
                            return false
                        })
                        await student.save()
                    }
                    await TitlePeriodStudent.findByIdAndDelete(_id)
                    await newActivitie.save()
            }
            res(true)
        }
        catch(err){
            rej(err)
        }
    })
}

// ESTUDIANTES //

events_controller.removeStudentEnrollmentByStudent = enroll_data => {
    return new Promise(async (res, rej) => {
        try {
            let {
                enrollId,
                ci
            } = enroll_data
            let enroll = await EnrollmentStudent.findById(enrollId)
            if(enroll.status == 'undefined'){
                let features = enroll.enrollment_features
                await EnrollmentStudent.findByIdAndDelete(enrollId)
                await deleteFilesFolder(features, ci)
                let student = await Student.findOne({no_identifier:ci}),
                    newActivitie = new Activitie({
                        action: 'ESTUDIANTE MATRICULA',
                        autor: ['ESTUDIANTE', student.getName, student.no_identifier],
                        information: ['ELIMINACIÓN DE MATRICULA', features.career, features.type, features.period, features.year]
                    })
                student.enroll_active = false
                async function deleteEnrollmentInStudent (enrollments) {
                    for(let [i, enroll] of enrollments.entries()) {
                        if(enroll._id==enrollId){
                            student.enrollment.splice(i, 1)
                            break
                        }
                    }
                }
                await deleteEnrollmentInStudent(student.enrollment)
                await student.save()
                await newActivitie.save()
            }
            res({
                message: 'La postulacion de matricula se ha eliminado satisfactoriamente.',
                _id: enroll._id
            })
        } catch (err) {
            rej({
                err_message: err.message
            })
        }
    })
}

events_controller.removeStudentTitlePeriodByStudent = enroll_data => {
    return new Promise(async (res, rej) => {
        try {
            let {
                enrollId,
                ci
            } = enroll_data
            let enroll = await TitlePeriodStudent.findById(enrollId)
            if(enroll.status == 'undefined'){
                let features = enroll.enrollment_features
                await TitlePeriodStudent.findByIdAndDelete(enrollId)
                await deleteFilesFolderTitlePeriod(features, ci)
                let student = await Student.findOne({no_identifier:ci}),
                    newActivitie = new Activitie({
                        action: 'ESTUDIANTE TITULACION',
                        autor: ['ESTUDIANTE', student.getName, student.no_identifier],
                        information: ['ELIMINACIÓN DE MATRICULA EN TITULACIÓN', features.career, features.type[1], features.period, features.year]
                    })
                student.enroll_active = false
                student.periods.every( (v, index) => {
                    if(v._id==enrollId && v.status=='undefined'){
                        if(student.periods.length > 1) student.periods.splice(index, 1)
                        else student.periods.splice(index, 1, {qualified:[false], enrollment_features:{type:[0.1]}})
                        return false
                    }
                    else return true
                })
                await student.save()
                await newActivitie.save()
            }
            res({
                message: 'La postulacion de matricula se ha eliminado satisfactoriamente.',
                _id: enroll._id
            })
        } catch (err) {
            rej({
                err_message: err.message
            })
        }
    })
}

events_controller.studentUpdateStudent = newStudentData => {
    return new Promise(async (res, rej) => {
        try {
            let student = await Student.findOne({
                email: newStudentData.email.trim(),
                no_identifier: {
                    $ne: newStudentData.no_identifier
                }
            })
            if (student) throw new Error('El correo electrónico ya está en uso.')
            else {
                newStudentData.updated = true
                let studentUpdated = await Student.findOneAndUpdate({
                    no_identifier: newStudentData.no_identifier
                }, {
                    $set: newStudentData
                }, {new: true}),
                    newActivitie = new Activitie({
                    action: 'ESTUDIANTE ACTUALIZACION',
                    autor: ['ESTUDIANTE', studentUpdated.getName, studentUpdated.no_identifier],
                    information: ['ACTUALIZACIÓN DATOS PERSONALES', studentUpdated.getName, studentUpdated.no_identifier]
                })
                await newActivitie.save()
                res({
                    message: 'Sus datos se han actualizado correctamente.'
                })
            }
        } catch (err) {
            rej({
                err_message: err.message
            })
        }
    })
}

events_controller.lookInReviewing = (usersWorking, studentEnrollments) => {
    return new Promise((res, rej) => {
        try {
            let enrollmentsInReview = Object.values(usersWorking)
            if (enrollmentsInReview.length > 0) {
                if (enrollmentsInReview.length > 1) {
                    let coincidences = studentEnrollments.filter(enroll => {
                        if (enrollmentsInReview.some(enroll2 => enroll == enroll2[0])) return enroll
                    })
                    if (coincidences.length > 0) res({
                        status: true,
                        coincidences
                    })
                    else res({
                        status: false,
                        coincidences
                    })
                } else {
                    let unique_id_in_review = enrollmentsInReview[0][0]
                    if (studentEnrollments.some(enroll => enroll == unique_id_in_review)) res({
                        status: true,
                        coincidences: [unique_id_in_review]
                    })
                    else res({
                        status: false,
                        coincidences: []
                    })
                }
            } else res({
                status: false,
                coincidences: []
            })
        } catch (err) {
            rej(err)
        }
    })
}

// QUALIFIER //


events_controller.updateEnrollmenTitle = (data, status) => {
    return new Promise(async (res, rej) => {
        try {
            let {
                _id,
                qualifier_name
            } = data
            let enroll = await TitlePeriodStudent.findOne({_id, status:'undefined'})
            if(enroll) {
                let student = await Student.findOne({
                    no_identifier: enroll.student
                })
                enroll.status = status
                enroll.last_modify = qualifier_name
                enroll.message = data.message ? data.message : ''
                enroll.information_per_enroll = {...enroll.information_per_enroll, parallel:student.parallel, economic_aid:enroll.information_per_enroll.economic_aid == '0' ? 'NO APLICA' : enroll.information_per_enroll.economic_aid}
                // enroll.information_per_enroll.parallel = student.parallel  
                // enroll.information_per_enroll.economic_aid = enroll.information_per_enroll.economic_aid == '0' ? 'NO APLICA' : enroll.information_per_enroll.economic_aid
                student.number_enrollments += 1
                student.differentiated_pension = enroll.information_per_enroll.differentiated_pension
                student.work_day = enroll.information_per_enroll.work_day
                student.economic_aid = enroll.information_per_enroll.economic_aid
                student.student_occupation = enroll.information_per_enroll.student_occupation
                student.student_income = enroll.information_per_enroll.student_income
                student.development_bonus = enroll.information_per_enroll.development_bonus
                student.type_scholarship = enroll.information_per_enroll.type_scholarship
                student.scholarship_reason = enroll.information_per_enroll.scholarship_reason
                student.scholarship_amount = enroll.information_per_enroll.scholarship_amount
                student.tariff_coverage = enroll.information_per_enroll.tariff_coverage
                student.maintenance_coverage = enroll.information_per_enroll.maintenance_coverage
                student.scholarship_funding = enroll.information_per_enroll.scholarship_funding
                student.educative_credit = enroll.information_per_enroll.educative_credit
                student.members_family = enroll.information_per_enroll.members_family
                student.emergency_contact = enroll.information_per_enroll.emergency_contact
                student.no_emergency_contact = enroll.information_per_enroll.no_emergency_contact
                student.higher_degree = enroll.information_per_enroll.higher_degree
                student.title_name = enroll.information_per_enroll.title_name
                student.enroll_active = status
                if (student.new_student) {
                    student.new_student = false
                    student.career_start = enroll.enrollment_features.start_date
                }
                student.periods = await replaceStudentEnrollment(student.periods, enroll)
                let studentUpdated = await student.save(),
                    estado = status=='true'?'ACEPTADA':'RECHAZADA',
                    features = enroll.enrollment_features,
                    newActivitie = new Activitie({
                        action: 'CALIFICADOR REVISION TITULACION',
                        autor: ['CALIFICADOR', qualifier_name],
                        information: ['REVISIÓN DE MATRÍCULA DE TITULACION', estado, student.no_identifier, features.career, features.type[1], features.period, features.year]
                    }),
                    newStudentData = await insertUpdatedStudent(studentUpdated)
                enroll.studentData = newStudentData
                await enroll.save()
                await newActivitie.save()
                res('La matricula se ha calificado satisfactoriamente.')
            }
            else res('La matrícula ya ha sido revisada anteriormente.')
        } catch (err) {
            rej(err)
        }
    })
}

events_controller.updateEnrollment = (data, status) => {
    return new Promise(async (res, rej) => {
        try {
            let {
                _id,
                parallel,
                qualifier_name
            } = data
            let enroll = await EnrollmentStudent.findOne({_id, status:'undefined'})
            if(enroll){
                let student = await Student.findOne({
                    no_identifier: enroll.student
                })
                enroll.status = status
                enroll.last_modify = qualifier_name
                enroll.message = data.message ? data.message : ''
                enroll.information_per_enroll = {...enroll.information_per_enroll, parallel, economic_aid:enroll.information_per_enroll.economic_aid == '0' ? 'NO APLICA' : enroll.information_per_enroll.economic_aid}
                // enroll.information_per_enroll.parallel = parallel
                // enroll.information_per_enroll.economic_aid = enroll.information_per_enroll.economic_aid == '0' ? 'NO APLICA' : enroll.information_per_enroll.economic_aid
                student.number_enrollments += 1
                student.differentiated_pension = enroll.information_per_enroll.differentiated_pension
                student.work_day = enroll.information_per_enroll.work_day
                student.economic_aid = enroll.information_per_enroll.economic_aid
                student.parallel = enroll.information_per_enroll.parallel
                student.student_occupation = enroll.information_per_enroll.student_occupation
                student.student_income = enroll.information_per_enroll.student_income
                student.development_bonus = enroll.information_per_enroll.development_bonus
                student.type_scholarship = enroll.information_per_enroll.type_scholarship
                student.scholarship_reason = enroll.information_per_enroll.scholarship_reason
                student.scholarship_amount = enroll.information_per_enroll.scholarship_amount
                student.tariff_coverage = enroll.information_per_enroll.tariff_coverage
                student.maintenance_coverage = enroll.information_per_enroll.maintenance_coverage
                student.scholarship_funding = enroll.information_per_enroll.scholarship_funding
                student.educative_credit = enroll.information_per_enroll.educative_credit
                student.members_family = enroll.information_per_enroll.members_family
                student.emergency_contact = enroll.information_per_enroll.emergency_contact
                student.no_emergency_contact = enroll.information_per_enroll.no_emergency_contact
                student.higher_degree = enroll.information_per_enroll.higher_degree
                student.title_name = enroll.information_per_enroll.title_name
                student.enroll_active = status
                if (student.new_student) {
                    student.new_student = false
                    student.career_start = enroll.enrollment_features.start_date
                }
                student.drags = await getDrags(enroll.request_subjects, true, student.subjects)
                student.enrollment = await replaceStudentEnrollment(student.enrollment, enroll)
                let studentUpdated = await student.save(),
                    estado = status=='true'?'ACEPTADA':'RECHAZADA',
                    features = enroll.enrollment_features,
                    newActivitie = new Activitie({
                        action: 'CALIFICADOR REVISION',
                        autor: ['CALIFICADOR', qualifier_name],
                        information: ['REVISIÓN DE MATRÍCULA', estado, student.no_identifier, features.career, features.type, features.period, features.year]
                    }),
                    newStudentData = await insertUpdatedStudent(studentUpdated)
                enroll.studentData = newStudentData
                await enroll.save()
                await newActivitie.save()
                res('La matricula se ha calificado satisfactoriamente.')
            }
            else res('La matricula ya ha sido revisada anteriormente.')
        } catch (err) {
            rej(err)
        }
    })
}

module.exports = events_controller