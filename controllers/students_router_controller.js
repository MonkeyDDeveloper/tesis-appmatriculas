'use strict'
const {
    Student
} = require('../models/students'),
    formidable = require('formidable'), {
        EnrollmentStudent
    } = require('../models/enrollmentStudent'), {
        Enrollment
    } = require('../models/enrollments'),
    {Activitie} = require('../models/activities'),
    {TitlePeriod} = require('../models/periods'),
    {TitlePeriodStudent} = require('../models/periodsStudent'),
    fs = require('fs-extra'),
    del = require('del'),
    archiver = require('archiver'),
    path = require('path')
var studentsController = {}

class StudentSubjects {

    constructor(arraySubjects) {
        this.allSubjects = this.ordered(arraySubjects)
        this.exiled = false
        this.maxSubjects = 4
        this.maxHours
        this.hasAncl = false
        this.hasRequiredEnrollments = false
        this.filteredSubjects = []
        this.anclSubjects = []
        this.requiredEnrollments = []
        this.analyzeStudentSubjects(this.allSubjects)
    }

    nothingWorking() {
        this.exiled = true
        this.maxSubjects = null
        this.maxHours = null
        this.hasAncl = null
        this.hasRequiredEnrollments = null
        this.filteredSubjects = null
        this.anclSubjects = null
        this.requiredEnrollments = null
    }

    ordered(array) {
        return array.sort((a, b) => a.no - b.no)
    }

    someFalse(model) {
        return function (value) {
            return model[value].status == false;
        };
    }

    someTrue(model) {
        return function (value) {
            return model[value].status == true;
        };
    }

    exist(refe) {
        return function (no) {
            return no == refe
        }
    }

    analyzeReprobedSubject(subject, model, array = []) {
        if (subject.ref.length > 0 && subject.ref.some(this.someFalse(model))) {
            let references = subject.ref;
            for (let i = 0; i < references.length; i++) {
                let {
                    status,
                    ref
                } = model[references[i]];
                if (!status) {
                    if (ref.length > 0 && ref.some(this.someFalse(model))) {
                        for (let refe of ref) {
                            if (!references.some(this.exist(refe))) {
                                references.push(refe);
                            }
                        }
                    } else array.push(model[references[i]]);
                }
            }
        } else {
            array.push(subject);
        }
        return array;
    }

    analyzeAprobedSubject(subject, model, array = []) {
        if (subject.next.length > 0 && subject.next.some(this.someTrue(model))) {
            let nextS = subject.next;
            for (let i = 0; i < nextS.length; i++) {
                let {
                    status,
                    next
                } = model[nextS[i]];
                if (status) {
                    if (next.length > 0) {
                        for (let refe of next) {
                            if (!nextS.some(this.exist(refe))) {
                                nextS.push(refe);
                            }
                        }
                    }
                } else {
                    array = array.concat(this.analyzeReprobedSubject(model[nextS[i]], model))
                }
            }
        }
        return array;
    }

    analyzeFilteredSubjects(subjects, model) {
        let toReturn = subjects
        if (subjects.some(v => v.hasOwnProperty('ancl'))) {
            subjects.forEach((sub, index) => {
                if (sub.hasOwnProperty('ancl')) {
                    if (!subjects.some(pSub => pSub.no == sub.ancl) && !model[sub.ancl].status) {
                        toReturn.splice(index, 1)
                    }
                }
            })
        }
        this.anclSubjects = toReturn.filter(sub => sub.ancl != undefined)
        this.hasAncl = toReturn.some(sub => sub.ancl != undefined)
        this.filteredSubjects = toReturn.filter(sub => sub.hasOwnProperty('ancl') == false)
        return toReturn
    }

    defineMaxAndRequiredSubjects(finalArrayOfSubjects) {
        if (finalArrayOfSubjects.some(sub => sub.enrollment == '3')) {
            this.hasRequiredEnrollments = true
            finalArrayOfSubjects.filter(sub => sub.enrollment === '3').forEach(sub => {
                this.maxSubjects--
                this.requiredEnrollments = this.requiredEnrollments.concat([sub])
            })
        }
    }

    analyzeSubjectsToWork(toWork, cb) {
        let subjectsToEnroll = []
        try {
            if (toWork.some(sub => Number(sub.enrollment) > 3)) throw true
            toWork.forEach(sub => {
                if (sub.status) {
                    let result = this.analyzeAprobedSubject(sub, toWork)
                    result.length > 0 ? function () {
                        result.forEach(res => {
                            if (!subjectsToEnroll.some(v => v.no == res.no)) {
                                subjectsToEnroll = subjectsToEnroll.concat(res)
                            }
                        })
                    }() : {}
                } else {
                    let result = this.analyzeReprobedSubject(sub, toWork)
                    result.length > 0 ? function () {
                        result.forEach(res => {
                            if (!subjectsToEnroll.some(v => v.no == res.no)) {
                                subjectsToEnroll = subjectsToEnroll.concat(res)
                            }
                        })
                    }() : {}
                }
            })
            cb(null, this.analyzeFilteredSubjects(subjectsToEnroll, toWork))
        } catch (err) {
            cb(err, null)
        }
    }

    analyzeStudentSubjects(subjects) {
        this.analyzeSubjectsToWork(subjects, (err, finalResult) => {
            if (!Boolean(err)) {
                this.defineMaxAndRequiredSubjects(finalResult)
            } else this.nothingWorking()
        })
    }
}

function deleteFilesFolder(path) {
    return new Promise(async (res, rej) => {
        try {
            // let pathToDelete = path.posix.join(__dirname, '..', 'ENROLLMENTFILES', period, year, ci)
            await del([path], {force: true})
            res(true)
        } catch (err) {
            rej(err)
        }
    })
}

function deleteFilesFolderTitle(path) {
    return new Promise(async (res, rej) => {
        try {
            // let {
            //     period,
            //     year
            // } = enroll
            // let pathToDelete = path.posix.join(__dirname, '..', 'PERIODSFILES', period, year, ci)
            await del([path], {force: true})
            res(true)
        } catch (err) {
            rej(err)
        }
    })
}

function existFile(dir) {
    return new Promise(async (res, rej) => {
        try {
            await fs.access(dir)
            res(true)
        } catch (err) {
            res(false)
        }
    })
}

function saveStudentFilesEnrollment(files, enrollment_features, ci) {
    return new Promise(async (res, rej) => {
        try {
            async function asyncSaveFiles(files) {
                let principalPathFolder = path.join(__dirname, '..', '..', 'RESPALDOS_APLICACION', 'ENROLLMENTFILES', `${enrollment_features.period}`, `${enrollment_features.year}`, `${ci}`)
                if(await existFile(principalPathFolder)) await deleteFilesFolder(principalPathFolder)
                for (let [i, file] of files.entries()) {
                    let _principalPath = path.join(principalPathFolder, `${i}${file.name}`)
                    try {
                        await fs.move(file.path, _principalPath, {
                            overwrite: true
                        })
                    } catch (err) {
                        return {
                            status: false,
                            message: err.message
                        }
                    }
                }
                return {
                    status: true,
                    message: ''
                }
            }
            let onlyFiles = Object.values(files)
            let {
                status,
                message
            } = await asyncSaveFiles(onlyFiles)
            if (!status) throw new Error(message)
            else res(true)
        } catch (err) {
            rej(err)
        }
    })
}

// function saveStudentFilesEnrollmentRespaldo(paths) {
//     return new Promise(async (res, rej) => {
//         try {
//             async function asyncSaveFiles(paths) {
//                 let respaldoPathFolder = paths.shift()
//                 if(await existFile(respaldoPathFolder)) await deleteFilesFolder(respaldoPathFolder)
//                 for (let _path of paths) {
//                     try {
//                         await fs.copy(_path[0], _path[1], {
//                             overwrite: true
//                         })
//                     } catch (err) {
//                         return {
//                             status: false,
//                             message: err.message
//                         }
//                     }
//                 }
//                 return {
//                     status: true,
//                     message: ''
//                 }
//             }
//             let {
//                 status,
//                 message
//             } = await asyncSaveFiles(paths)
//             if (!status) throw new Error(message)
//             else res(true)
//         } catch (err) {
//             rej(err)
//         }
//     })
// }

function saveStudentFilesEnrollmentTitle(files, enrollment_features, ci) {
    return new Promise(async (res, rej) => {
        try {
            async function asyncSaveFiles(files) {
                let principalFolder = path.join(__dirname, '..', '..', 'RESPALDOS_APLICACION', 'PERIODSFILES', `${enrollment_features.period}`, `${enrollment_features.year}`, `${ci}`)
                if(await existFile(principalFolder)) await deleteFilesFolderTitle(principalFolder)
                for (let [i, file] of files.entries()) {
                    let _principalPath = path.join(principalFolder, `${i}${file.name}`)
                    try {
                        await fs.move(file.path, _principalPath, {
                            overwrite: true
                        })
                    } catch (err) {
                        return {
                            status: false,
                            message: err.message
                        }
                    }
                }
                return {
                    status: true,
                    message: ''
                }
            }
            let onlyFiles = Object.values(files)
            let {
                status,
                message
            } = await asyncSaveFiles(onlyFiles)
            if (!status) throw new Error(message)
            else res(true)
        } catch (err) {
            rej(err)
        }
    })
}

// function saveStudentFilesEnrollmentTitleRespaldo(paths) {
//     return new Promise(async (res, rej) => {
//         try {
//             async function asyncSaveFiles(files) {
//                 let respaldoPathFolder = paths.shift()
//                 if(await existFile(respaldoPathFolder)) await deleteFilesFolderTitle(respaldoPathFolder)
//                 for (let _path of paths) {
//                     try {
//                         await fs.copy(_path[0], _path[1], {
//                             overwrite: true
//                         })
//                     } catch (err) {
//                         return {
//                             status: false,
//                             message: err.message
//                         }
//                     }
//                 }
//                 return {
//                     status: true,
//                     message: ''
//                 }
//             }
//             let {
//                 status,
//                 message
//             } = await asyncSaveFiles(paths)
//             if (!status) throw new Error(message)
//             else res(true)
//         } catch (err) {
//             rej(err)
//         }
//     })
// }

function saveStudentFiles(files, ci) {
    return new Promise(async (res, rej) => {
        try {
            async function asyncSaveFiles(files) {
                for (let [name, file] of files) {
                    try {
                        let principalPath = path.join(__dirname, '..', '..', 'RESPALDOS_APLICACION', 'STUDENTFILES', `${ci}`, `${name.toUpperCase()}.pdf`)
                        await fs.move(file.path, principalPath, {
                            overwrite: true
                        })
                    } catch (err) {
                        return {
                            status: false,
                            message: err.message
                        }
                    }
                }
                return {
                    status: true,
                    message: ''
                }
            }
            let onlyFiles = Object.entries(files)
            let {
                status,
                message
            } = await asyncSaveFiles(onlyFiles)
            if (!status) throw new Error(message)
            else res(true)
        } catch (err) {
            rej(err)
        }
    })
}

// function saveStudentFilesRespaldo(paths) {
//     return new Promise(async (res, rej) => {
//         try {
//             async function asyncSaveFiles(paths) {
//                 for (let _path of paths) {
//                     try {
//                         await fs.copy(_path[0], _path[1], {
//                             overwrite: true
//                         })
//                     } catch (err) {
//                         return {
//                             status: false,
//                             message: err.message
//                         }
//                     }
//                 }
//                 return {
//                     status: true,
//                     message: ''
//                 }
//             }
//             let {
//                 status,
//                 message
//             } = await asyncSaveFiles(paths)
//             if (!status) throw new Error(message)
//             else res(true)
//         } catch (err) {
//             rej(err)
//         }
//     })
// }

function createInformationPerEnroll(fields, student) {
    return new Promise(async (res, rej) => {
        try {
            let studentData = await Student.findOne({
                no_identifier: student
            }, '-enrollment')
            let information_per_enroll = {
                student_income: 'NO APLICA',
                scholarship_reason: 'NO APLICA',
                scholarship_amount: 'NO APLICA',
                tariff_coverage: 'NO APLICA',
                maintenance_coverage: 'NO APLICA',
                scholarship_funding: 'NO APLICA'
            }
            let request_subjects = []
            let informationCreated = Object.entries(fields).every(async ([key, value]) => {
                try {
                    if (key == 'student') {} else if (key == 'enrollment_features') {} else if (/[0-9]/.test(key)) {
                        request_subjects = request_subjects.concat(studentData.subjects.filter(sub => sub.no == key))
                    } else {
                        information_per_enroll[key] = value
                    }
                    return true
                } catch (err) {
                    return false
                }
            })
            if (!informationCreated) throw new Error(`Hubo un error creando la información por matrícula`)
            else {
                res({
                    information_per_enroll,
                    request_subjects,
                    studentData:[studentData]
                })
            }
        } catch (err) {
            rej(new Error(`Error creando la informacion de matricula: ${err.message}`))
        }
    })
}

function createInformationPerEnrollForTitle(fields, student) {
    return new Promise(async (res, rej) => {
        try {
            let studentData = await Student.findOne({
                no_identifier: student
            }, '-enrollment -subjects'),
                information_per_enroll = {
                student_income: 'NO APLICA',
                scholarship_reason: 'NO APLICA',
                scholarship_amount: 'NO APLICA',
                tariff_coverage: 'NO APLICA',
                maintenance_coverage: 'NO APLICA',
                scholarship_funding: 'NO APLICA'
            },
                informationCreated = Object.entries(fields).every(async ([key, value]) => {
                try {
                    if (key == 'student') {} else if (key == 'enrollment_features') {} else {
                        information_per_enroll[key] = value
                    }
                    return true
                } catch (err) {
                    return false
                }
            })
            if (!informationCreated) throw new Error(`Hubo un error creando la información por matrícula`)
            else {
                res({
                    information_per_enroll,
                    studentData:[studentData]
                })
            }
        } catch (err) {
            rej(new Error(`Error creando la informacion de matricula: ${err.message}`))
        }
    })
}

function saveEnrollment(fields, fullName) {
    return new Promise(async (res, rej) => {
        try {
            let {
                enrollment_features,
                student
            } = fields;
            (typeof student == 'object') ? {} : student = [student].concat(fullName)
            let {
                information_per_enroll,
                request_subjects,
                studentData
            } = await createInformationPerEnroll(fields, fields.student)
            let newEnrollment = new EnrollmentStudent({
                enrollment_features,
                student,
                information_per_enroll,
                request_subjects,
                studentData
            })
            let enrollmentSaved = await newEnrollment.save()
            res({
                enrollmentSaved
            })
        } catch (err) {
            rej(new Error(`Error guardando los datos de matricula: ${err.message}`))
        }
    })
}

function saveTitlePeriod(fields, fullName) {
    return new Promise(async (res, rej) => {
        try {
            let {
                enrollment_features,
                student
            } = fields;
            (typeof student == 'object') ? {} : student = [student].concat(fullName)
            let {
                information_per_enroll,
                studentData
            } = await createInformationPerEnrollForTitle(fields, fields.student)
            let newEnrollment = new TitlePeriodStudent({
                enrollment_features,
                student,
                information_per_enroll,
                studentData
            })
            let enrollmentSaved = await newEnrollment.save()
            res({
                enrollmentSaved
            })
        } catch (err) {
            rej(new Error(`Error guardando los datos de matricula: ${err.message}`))
        }
    })
}

function deleteTempPath(path) {
    del.sync([path])
}

function comprobeExiled(subjects) {
    return subjects.some(sub => Number(sub.enrollment) > 3)
}

function getEnrollmentInformation(student, enrollment_published, messages) {
    return new Promise(async (res, rej) => {
        try {
            let returnObject = {};
            if (comprobeExiled(student.subjects)) {
                returnObject.status = false
                returnObject.message = messages[4]
                res(returnObject)
            } else {
                returnObject.subjectsInformation = await getSubjectsInf(student)
                returnObject.status = true
                returnObject.enrollment = enrollment_published
                returnObject.student = student
                res(returnObject)
            }
        } catch (err) {
            rej(err)
        }
    })
}

function getTitlePeriodInformation(student, enrollment_published, messages) {
    return new Promise(async (res, rej) => {
        try {
            let returnObject = {};
                student = student.toObject()
            if (comprobeExiled(student.subjects)) {
                returnObject.status = false
                returnObject.message = messages[4]
                res(returnObject)
            } else {
                delete student.subjects
                returnObject.status = true
                returnObject.enrollment = enrollment_published
                returnObject.student = student
                res(returnObject)
            }
        } catch (err) {
            rej(err)
        }
    })
}

function getSubjectsInf(student) {
    return new Promise((res, rej) => {
        try {
            let subjectsInformation = new StudentSubjects(student.subjects)
            subjectsInformation.maxHours = student.career == 'AUTOMATIZACION E INSTRUMENTACION' ? 31 : 30
            res(subjectsInformation)
        } catch (err) {
            rej(err)
        }
    })
}

function lookForStudentEnrollment(data) {
    return new Promise(async (res, rej) => {
        let returnObject = {};
        try {
            let {
                identifier
            } = data,
            messages = [
                    'Usted ya tiene una matrícula pendiente a ser aprobada, para verlo por favor diríjase al apartado "Mis matrículas"',
                    'No hay procesos de matriculación activos actualmente.',
                    'Ya hay una matricula finalizada relacionada a este periodo, para verlo por favor diríjase al apartado "Mis matrículas"',
                    'Ya hay una matricula aprobada relacionada a este periodo, para verlo por favor diríjase al apartado "Mis matrículas"',
                    'No habrá más procesos de matriculación disponibles para usted debido ha que agotado todas las matriculas disponibles en al menos una materia.',
                    'Tiene que subir su documentación antes de realizar cualquier proceso de matriculación.',
                    'No se ha encontrado al estudiante en la base de datos.'
                ],
                dir = path.join(__dirname, '..', '..', 'RESPALDOS_APLICACION', 'STUDENTFILES', `${identifier}`),
                student = await Student.findOne({
                    no_identifier: identifier
                })
            if(student){
                if (await existFile(dir)) {
                    if ((await fs.readdir(dir)).length >= 6) {
                            if (student.enrollment.some(enroll => enroll.status == 'undefined')) {
                                returnObject.status = false
                                returnObject.message = messages[0]
                                res(returnObject)
                            } else {
                                let enrollment_published = await Enrollment.findOne({
                                    career:student.career
                                })
                                if (enrollment_published) {
                                    if (student.enrollment.some(enroll => enroll.enrollment_features.period == enrollment_published.period && enroll.enrollment_features.year == enrollment_published.year)) {
                                        let enrollments = student.enrollment.filter(enroll => enroll.enrollment_features.period == enrollment_published.period && enroll.enrollment_features.year == enrollment_published.year)
                                        if (enrollments.some(e => e.qualified[0] == true)) {
                                            returnObject.status = false
                                            returnObject.message = messages[2]
                                            res(returnObject)
                                        } else if (enrollments.some(e => e.status == 'true')) {
                                            returnObject.status = false
                                            returnObject.message = messages[3]
                                            res(returnObject)
                                        } else if (enrollments.every(e => e.status == 'false')) {
                                            returnObject = await getEnrollmentInformation(student, enrollment_published, messages)
                                            res(returnObject)
                                        }
                                    } else {
                                        returnObject = await getEnrollmentInformation(student, enrollment_published, messages)
                                        res(returnObject)
                                    }
                                } else {
                                    returnObject.status = false
                                    returnObject.message = messages[1]
                                    res(returnObject)
                                }
                            }
                    } else {
                        student.upload_doc = false
                        await student.save()
                        returnObject.status = false
                        returnObject.message = messages[5]
                        res(returnObject)
                    }
                } else {
                    student.upload_doc = false
                    await student.save()
                    returnObject.status = false
                    returnObject.message = messages[5]
                    res(returnObject)
                }
            } else {
                returnObject.status = false
                returnObject.message = messages[6]
                res(returnObject)
            }
        } catch (err) {
            returnObject.message = err.message
            rej(returnObject)
        }
    })
}

async function asyncSomeSubjects(subjects) {
    for (let subject of subjects) {
        if(subject.status==false) return false
    }
    return true
}

async function asyncSomePeriods(periods) {
    for (let period of periods) {
        if(period.qualified[0]==false) return true
    }
    return false
}

async function addFilesToEnrollment(enrollId, files) {
    try{
        let enrollment = await EnrollmentStudent.findById(enrollId)
        if(enrollment){
            let {year, period} = enrollment.enrollment_features
            let file = files.newFile
            let destine = path.join(__dirname, '..', '..', 'RESPALDOS_APLICACION', 'ENROLLMENTFILES', period, year, enrollment.student[0], `agregado_${file.name}`)
            if(await existFile(destine)) {
                await del([destine], {force: true})
                await fs.move(file.path, destine, {overwrite:true})
                return {status: true, err:null}
            }
            else {
                await fs.move(file.path, destine, {overwrite:true})
                return {status: true, err:null}
            }
        }
        else {
            throw new Error('No se ha encontrado registros de este matrícula en la base de datos')
        }
    }
    catch(err){
        return {status: false, err}
    }
}

// async function addFilesToEnrollmentRespaldo(_path) {
//     try{
//         if(await existFile(_path[1])) {
//             await del([_path[1]], {force:true})
//             await fs.copy(_path[0], _path[1], {overwrite:true})
//             return {status: true, err:null}
//         }
//         else {
//             await fs.copy(_path[0], _path[1], {overwrite:true})
//             return {status: true, err:null}
//         }
//     }
//     catch(err){
//         return {status: false, err}
//     }
// }

function checkValidity(type, periods){
    let periodsToAnalize = periods.filter( n => n.qualified[0] == true ),
        result = {status:true, message:''}
        if(periodsToAnalize.length==0){
            if(type!=0) {
                result.status = false
                result.message = 'Usted debe matrícularse en el "PRIMER PERIODO DESTINADO A LA TITULACIÓN".'
            }
        }
        else if(periodsToAnalize.length==1){
            if(type!=1) {
                result.status = false
                result.message = 'Usted debe matrícularse en la "PRIMER PRORROGA".'
            }
        }
        else if(periodsToAnalize.length==2){
            if(type!=2) {
                result.status = false
                result.message = 'Usted debe matrícularse en la "SEGUNDA PRORROGA".'
            }
        }
        return result
}

function lookForStudentPeriodTitle(data) {
    return new Promise(async (res, rej) => {
        let returnObject = {};
        try {
            let {
                identifier
            } = data,
            messages = [
                    'Usted ya tiene una matrícula pendiente a ser aprobada, para verlo por favor diríjase al apartado "Mis periodos de titulación"',
                    'No hay procesos de matriculación para titulación activos actualmente.',
                    'Ya hay una matricula de titulación finalizada relacionada a este periodo, para verlo por favor diríjase al apartado "Mis periodos de titulación"',
                    'Ya hay una matricula de titulación aprobada relacionada a este periodo, para verlo por favor diríjase al apartado "Mis periodos de titulación"',
                    'No habrá más procesos de matriculación en titulación disponibles para usted debido ha que agotado todas las matriculas disponibles en al menos una materia.',
                    'Tiene que subir su documentación antes de realizar cualquier proceso de matriculación.',
                    'No se ha encontrado al estudiante en la base de datos.',
                    'Usted no ha aprobado todas las materias de su malla curricular.',
                    'Usted ya ha cursado todos los periodos de titulación.'
                ],
                dir = path.join(__dirname, '..', '..', 'RESPALDOS_APLICACION', 'STUDENTFILES', `${identifier}`),
                student = await Student.findOne({
                    no_identifier: identifier
                }, '-enrollment')
            if(student){
                if(await asyncSomeSubjects(student.subjects)){
                    if(await asyncSomePeriods(student.periods)){
                        if (await existFile(dir)) {
                            if ((await fs.readdir(dir)).length >= 5) {
                                    if (student.periods.some(period => period.status == 'undefined')) {
                                        returnObject.status = false
                                        returnObject.message = messages[0]
                                        res(returnObject)
                                    } else {
                                        let enrollment_published = await TitlePeriod.findOne({
                                            career:student.career
                                        })
                                        if (enrollment_published) {
                                            if (student.periods.some(enroll => enroll.enrollment_features.type[0] == enrollment_published.type[0])) {
                                                let periods = student.periods.filter(enroll => enroll.enrollment_features.type[0] == enrollment_published.type[0])
                                                if (periods.some(e => e.qualified[0] == true)) {
                                                    returnObject.status = false
                                                    returnObject.message = messages[2]
                                                    res(returnObject)
                                                } else if (periods.some(e => e.status == 'true')) {
                                                    returnObject.status = false
                                                    returnObject.message = messages[3]
                                                    res(returnObject)
                                                } else if (periods.every(e => e.status == 'false')) {
                                                    returnObject = await getTitlePeriodInformation(student, enrollment_published, messages)
                                                    res(returnObject)
                                                }
                                            } else {
                                                let type = enrollment_published.type[0],
                                                    {status, message} = checkValidity(type, student.periods)
                                                    if(status == true){
                                                        returnObject = await getTitlePeriodInformation(student, enrollment_published, messages)
                                                        res(returnObject)
                                                    }
                                                    else{
                                                        returnObject.status = false
                                                        returnObject.message = message
                                                        res(returnObject)
                                                    }
                                            }
                                        } else {
                                            returnObject.status = false
                                            returnObject.message = messages[1]
                                            res(returnObject)
                                        }
                                    }
                            } else {
                                student.upload_doc = false
                                await student.save()
                                returnObject.status = false
                                returnObject.message = messages[5]
                                res(returnObject)
                            }
                        } else {
                            student.upload_doc = false
                            await student.save()
                            returnObject.status = false
                            returnObject.message = messages[5]
                            res(returnObject)
                        }
                    }
                    else {
                        returnObject.status = false,
                        returnObject.message = messages[8]
                        res(returnObject)
                    }
                }
                else{
                    returnObject.status = false
                    returnObject.message = messages[7]
                    res(returnObject)    
                }
            } else {
                returnObject.status = false
                returnObject.message = messages[6]
                res(returnObject)
            }
        } catch (err) {
            returnObject.message = err.message
            rej(returnObject)
        }
    })
}
 
studentsController.renderStudentsIndex = async (req, res) => {
    try {
        let success = res.locals.success,
            {
                name,
                career,
                identifier
            } = req.session.auth,
            result = await lookForStudentEnrollment({
                career,
                identifier
            })
        res.render('students/vista_de_estudiantes_index', {
            success,
            name,
            career,
            identifier,
            result
        })
    } catch (err) {
        res.send(`Hubo un error accediendo a la página: ${err.message}`)
    }
}

studentsController.renderStudentsTitulacion = async (req, res) => {
    try {
        let success = res.locals.success,
            {
                name,
                career,
                identifier
            } = req.session.auth,
            result = await lookForStudentPeriodTitle({
                identifier
            })
        res.render('students/vista_de_estudiantes_titulacion', {
            success,
            name,
            career,
            identifier,
            result
        })
    } catch (err) {
        res.send(`Hubo un error accediendo a la página: ${err.message}`)
    }
}

studentsController.renderActData = async (req, res) => {
    try {
        let student = await Student.findOne({
            no_identifier: req.session.auth.identifier
        })
        let name = `${student.first_name} ${student.first_lastname}`,
            identifier = student.no_identifier
        res.render('students/vista_de_estudiantes_actualizar_datos', {
            name,
            identifier,
            student
        })
    } catch (err) {
        res.send(`Hubo un error accediendo a la página: ${err.message}`)
    }
}

studentsController.renderEnrollment = async (req, res) => {
    try {
        let {
            name,
            identifier
        } = req.session.auth,
            message_error = res.locals.error,
            student = await Student.findOne({
                no_identifier: identifier
            }, 'enrollment')
        res.render('students/vista_de_estudiantes_mis_matriculas', {
            name,
            identifier,
            message_error,
            student
        })
    } catch (err) {
        res.send(`Hubo un error accediendo a la página: ${err.message}`)
    }
}

studentsController.renderTitlePeriod = async (req, res) => {
    try {
        let {
            name,
            identifier
        } = req.session.auth,
            message_error = res.locals.error,
            student = await Student.findOne({
                no_identifier: identifier
            }, 'periods')
        res.render('students/vista_de_estudiantes_mis_matriculas_titulacion', {
            name,
            identifier,
            message_error,
            student
        })
    } catch (err) {
        res.send(`Hubo un error accediendo a la página: ${err.message}`)
    }
}

studentsController.renderUploadDocumentation = async (req, res) => {
    try {
        let {
            name,
            identifier
        } = req.session.auth,
            dir = path.join(__dirname, '..', '..', 'RESPALDOS_APLICACION', 'STUDENTFILES', `${identifier}`)
        if (await existFile(dir)) {
            let uploadedDocs = await fs.readdir(dir)
            if (uploadedDocs.length >= 6) {
                res.render('students/vista_de_estudiantes_subir_documentacion', {
                    name,
                    identifier,
                    uploadedDocs
                })
            } else {
                let student = await Student.findOne({
                    no_identifier: identifier
                })
                student.upload_doc = false
                await student.save()
                let message_error = 'Faltan algunos archivos por subir.'
                res.render('students/vista_de_estudiantes_subir_documentacion', {
                    name,
                    identifier,
                    message_error,
                    uploadedDocs
                })
            }
        } else {
            let student = await Student.findOne({
                no_identifier: identifier
            })
            student.upload_doc = false
            await student.save()
            let message_error = 'Debe cargar la documentación para poder realizar cualquier proceso de matriculación.',
                uploadedDocs = []
            res.render('students/vista_de_estudiantes_subir_documentacion', {
                name,
                identifier,
                message_error,
                uploadedDocs
            })
        }
    } catch (err) {
        res.send(`Hubo un error accediendo a la página: ${err.message}`)
    }
}

studentsController.saveDocumentation = async (req, res) => {
    try {
        formidable({multiples: true})
            .parse(req, async (err, fields, files) => {
            try {
                if (err) throw err
                let {
                    no_identifier
                } = fields
                await saveStudentFiles(files, no_identifier)
                // await saveStudentFilesRespaldo(paths)
                let student = await Student.findOne({
                    no_identifier
                }),
                newActivitie = new Activitie({
                    action: 'ESTUDIANTE DOCUMENTACION',
                    autor: ['ESTUDIANTE', student.getName, student.no_identifier],
                    information: ['ACTUALIZACIÓN DOCUMENTACION', student.getName, student.no_identifier]
                })
                student.upload_doc = true
                await student.save()
                await newActivitie.save()
                res.json({
                    status: true,
                    message: 'Documentación cargada con éxito.'
                })
            } catch (err) {
                res.json({
                    status: false,
                    message: `Error actualizando actualizando la información, por favor revise la documentación o intentelo más tarde: ${err.message}`
                })
            }
            })
    } catch (err) {
        res.json({
            status: false,
            message: `Error procesando la petición, por favor revise la documentación o intentelo más tarde: ${err.message}`
        })
    }
} 

studentsController.saveNewStudentEnrollment = (req, res) => {
    try {
        let {
            identifier,
            fullName
        } = req.session.auth
        formidable({
            multiples: true
        }).parse(req, async (err, fields, files) => {
            try {
                if (err) throw new Error('Error en el servidor parseando la peticion')
                fields.enrollment_features = JSON.parse(fields.enrollment_features)
                await saveStudentFilesEnrollment(files, fields.enrollment_features, identifier)
                // await saveStudentFilesEnrollmentRespaldo(paths)
                let {
                    enrollmentSaved
                } = await saveEnrollment(fields, fullName)
                let student = await Student.findOne({
                    no_identifier: identifier
                }),
                    newActivitie = new Activitie({
                        action: 'ESTUDIANTE MATRICULA',
                        autor: ['ESTUDIANTE', student.getName, student.no_identifier],
                        information: ['REGISTRO DE NUEVA MATRÍCULA', fields.enrollment_features.career, fields.enrollment_features.type, fields.enrollment_features.period, fields.enrollment_features.year]
                    })
                student.enroll_active = true
                student.enrollment.push(enrollmentSaved)
                await student.save()
                await newActivitie.save()
                res.status(200)
                res.json({
                    status: true,
                    message: 'Su matricula se ha publicado satisfactoriamente y será revisada en breve, ahora puede verla en el aparatdo "Mis matrículas".'
                })
            } catch (err) {
                res.status(500)
                res.json({
                    status: false,
                    message: `Hubo un error procesando los datos de su matrícula: ${err.message}`
                })
            }
        })
    } catch (err) {
        res.status(500)
        res.json({
            status: false,
            message: err.message
        })
    }
}

studentsController.saveNewStudentTitlePeriod = (req, res) => {
    try {
        let {
            identifier,
            fullName
        } = req.session.auth
        formidable({
            multiples: true
        }).parse(req, async (err, fields, files) => {
            try {
                if (err) throw new Error('Error en el servidor parseando la peticion')
                fields.enrollment_features = JSON.parse(fields.enrollment_features)
                await saveStudentFilesEnrollmentTitle(files, fields.enrollment_features, identifier)
                let {
                    enrollmentSaved
                } = await saveTitlePeriod(fields, fullName)
                let student = await Student.findOne({
                    no_identifier: identifier
                }),
                    newActivitie = new Activitie({
                        action: 'ESTUDIANTE TITULACION',
                        autor: ['ESTUDIANTE', student.getName, student.no_identifier],
                        information: ['REGISTRO DE NUEVA MATRÍCULA EN TITULACIÓN', fields.enrollment_features.career, fields.enrollment_features.type[1], fields.enrollment_features.period, fields.enrollment_features.year]
                    })
                student.enroll_active = true
                student.periods.push(enrollmentSaved)
                await student.save()
                await newActivitie.save()
                res.status(200)
                res.json({
                    status: true,
                    message: 'Su matricula se ha publicado satisfactoriamente y será revisada en breve, ahora puede verla en el aparatdo "Mis periodos de titulación".'
                })
            } catch (err) {
                res.status(500)
                res.json({
                    status: false,
                    message: `Hubo un error procesando los datos de su matrícula: ${err.message}`
                })
            }
        })
    } catch (err) {
        res.status(500)
        res.json({
            status: false,
            message: err.message
        })
    }
}

studentsController.saveNewStudentEnrollmentAdmin = (req, res) => {
    try {
        formidable({
            multiples: true
        }).parse(req, async (err, fields, files) => {
            try {
                if (err) throw new Error('Error en el servidor parseando la peticion')
                fields.enrollment_features = JSON.parse(fields.enrollment_features)
                fields.student = JSON.parse(fields.student)
                await saveStudentFilesEnrollment(files, fields.enrollment_features, fields.student[0])
                let {
                    enrollmentSaved
                } = await saveEnrollment(fields, fields.student.splice[1])
                let student = await Student.findOne({
                        no_identifier: fields.student[0]
                    }),
                    features = enrollmentSaved.enrollment_features,
                    newActivitie = new Activitie({
                        action: 'ESTUDIANTE MATRICULA ESPECIAL',
                        autor: ['ADMIN', fields.admin],
                        information: ['REGISTRO DE NUEVA MATRÍCULA', student.no_identifier, features.career, features.type, features.period, features.year]
                    })
                student.enroll_active = true
                student.enrollment.push(enrollmentSaved)
                await student.save()
                await newActivitie.save()
                res.status(200)
                res.json({
                    status: true,
                    message: 'La matricula se ha publicado satisfactoriamente.'
                })
            } catch (err) {
                res.status(500)
                res.json({
                    status: false,
                    message: `Hubo un error procesando los datos de su matrícula: ${err.message}`
                })
            }
        })
    } catch (err) {
        res.status(500)
        res.json({
            status: false,
            message: err.message
        })
    }
}

studentsController.getStudentDocumentation = (req, res) => {
    try {
        let {
            period,
            year
        } = req.query, {
                ci
            } = req.params,
            zipPath = path.join(__dirname, '..', 'temp', `${ci}_${year}_${period}.zip`),
            out = fs.createWriteStream(zipPath),
            enrollmentFiles = path.join(__dirname, '..', '..', 'RESPALDOS_APLICACION','ENROLLMENTFILES', period, year, ci),
            studentFiles = path.join(__dirname, '..', '..', 'RESPALDOS_APLICACION','STUDENTFILES', ci),
            archive = archiver('zip')
        archive.on('error', err => {
            res.status(500).json({
                message: err.message
            })
        }) 
        out.on('close', () => {
            res.status(200)
            res.download(zipPath, null, () => {
                deleteTempPath(zipPath)
            })
        })
        archive.pipe(out)
        archive.directory(enrollmentFiles, false)
        archive.directory(studentFiles, false)
        archive.finalize()
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

studentsController.getStudentDocumentationTitlePeriod = (req, res) => {
    try {
        let {
            period,
            year
        } = req.query, {
                ci
            } = req.params,
            zipPath = path.join(__dirname, '..', 'temp', `${ci}_${year}_${period}.zip`),
            out = fs.createWriteStream(zipPath),
            enrollmentFiles = path.join(__dirname, '..', '..', 'RESPALDOS_APLICACION', 'PERIODSFILES', period, year, ci),
            studentFiles = path.join(__dirname, '..', '..', 'RESPALDOS_APLICACION', 'STUDENTFILES', ci),
            archive = archiver('zip')
        archive.on('error', err => {
            res.status(500).json({
                message: err.message
            })
        }) 
        out.on('close', () => {
            res.status(200)
            res.download(zipPath, null, () => {
                deleteTempPath(zipPath)
            })
        })
        archive.pipe(out)
        archive.directory(enrollmentFiles, false)
        archive.directory(studentFiles, false)
        archive.finalize()
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

studentsController.updateEnrollmentDocumentation = (req, res) => {
    try{
        formidable({multiples:true}).parse(req, async (err, fields, files) => {
            if(err) {
                res.status(500)
                res.json({status:false, err:err.message})
            }
            let savedNewFiles = await addFilesToEnrollment(fields.enrollId, files)
            if(savedNewFiles.status == false) {
                res.status(500)
                res.json({status:false, err:savedNewFiles.err.message})
            }
            else {
                res.status(200)
                res.json({status: true, err:null})
            }
        })
    }
    catch (err) {
        res.status(500)
        res.json({status: false, err:err.message})
    }
}

studentsController.downloadFile = async (req, res) => {
    try {
        let {
            fileName
        } = req.params
        let zipPath = path.join(__dirname, '..', 'temp', `${fileName}.zip`)
        let out = fs.createWriteStream(zipPath)
        let dir = path.join(__dirname, '..', '..', 'RESPALDOS_APLICACION', 'STUDENTFILES', req.session.auth.identifier, `${fileName}.pdf`) 
        if(await existFile(dir)){
            let studentFile = fs.createReadStream(dir)
            let archive = archiver('zip')
            archive.on('error', err => {
                res.status(500).json({
                    message: err.message
                })
            })
            out.on('close', () => {
                res.status(200)
                res.download(zipPath, null, () => {
                    deleteTempPath(zipPath)
                })
            })
            archive.pipe(out)
            archive.append(studentFile, {
                name: `${fileName}.pdf`
            })
            archive.finalize()
        }
        else throw new Error('No se ha encontrado el archivo solicitado')
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

module.exports = studentsController