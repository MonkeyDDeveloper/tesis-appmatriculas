'use strict'
const {Student} = require('../models/students'),
      {EnrollmentStudent} = require('../models/enrollmentStudent'),
      {Enrollment} = require('../models/enrollments'),
      {Activitie} = require('../models/activities'),
      {TitlePeriod} = require('../models/periods'),
      {TitlePeriodStudent} = require('../models/periodsStudent'),
      fs = require('fs-extra'),
      del = require('del'),
      path = require('path'),
      exceljs = require('exceljs')
var adminController = {} 


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

// function getAllStudents(){
//     return new Promise(async (res, rej) => {
//         try {
//             let students = await Student.find({}, '_id enroll_active career no_identifier first_lastname first_name level subjects modality work_day drags gratuity subjects_repeated')
//             res(students)
//         }
//         catch(err){
//             rej(err.message)
//         }
//     })
// }

function deleteTempPath(path) {
    del.sync([path])
}

async function makeStudentExcel(_id){
    try{
        let student = await Student.findById(_id),
            dir = path.join(__dirname, '..', 'temp', `${student.no_identifier}_${student.getName}.xlsx`),
            workBook = new exceljs.Workbook(),
            worksheet_studentData = workBook.addWorksheet(`ESTUDIANTE, ${student.getName}`),
            worksheet_subjectStatus = workBook.addWorksheet(`ESTADO DE LAS ASIGNATURAS`)
            worksheet_studentData.columns = [
                { header: "CARRERA", key: "career", width: 30 },
                { header: "EMAIL", key: "email", width: 30 },
                { header: "ACUERDO DE CONFIDENCIALIDAD", key: "confidentiality", width: 30 },
                { header: "TIPO DE IDENTIFICACIÓN", key: "identifier", width: 30 },
                { header: "NÚMERO DE IDENTIFICACIÓN", key: "no_identifier", width: 30 },
                { header: "CARGA DOCUMENTACIÓN", key: "upload_doc", width: 30 },
                { header: "PRIMER NOMBRE", key: "first_name", width: 30 },
                { header: "SEGUNDO NOMBRE", key: "second_name", width: 30 },
                { header: "PRIMER APELLIDO", key: "first_lastname", width: 30 },
                { header: "SEGUNDO APELLIDO", key: "second_lastname", width: 30 },
                { header: "NOMBRES COMPLETOS", key: "complete_name", width: 30 },
                { header: "SÉXO", key: "sex", width: 30 },
                { header: "GÉNERO", key: "gender", width: 30 },
                { header: "ESTADO CIVIL", key: "marital_status", width: 30 },
                { header: "ETNIA", key: "ethnicity", width: 30 },
                { header: "PUEBLO", key: "village", width: 30 },
                { header: "TIPO DE SANGRE", key: "blood_type", width: 30 },
                { header: "DISCAPACIDAD", key: "disability", width: 30 },
                { header: "PORCENTAJE DE DISCAPACIDAD", key: "disability_percentage", width: 30 },
                { header: "NÚMERO DE CARNET CONADIS/MSP", key: "conadis_msp", width: 30 },
                { header: "TIPO DE DISCAPACIDAD", key: "disability_type", width: 30 },
                { header: "FECHA DE NACIMIENTO", key: "birth_date", width: 30 },
                { header: "PAIS/NACIONALIDAD", key: "nationality", width: 30 },
                { header: "PROVINCIA DE NACIMIENTO", key: "province_birth", width: 30 },
                { header: "CANTÓN DE NACIMIENTO", key: "canton_birth", width: 30 },
                { header: "PAÍS DE RESIDENCIA", key: "country_residence", width: 30 },
                { header: "PROVINCIA DE RESIDENCIA", key: "province_residence", width: 30 },
                { header: "CANTÓN DE RESIDENCIA", key: "canton_residence", width: 30 },
                { header: "TIPO DE COLEGIO", key: "type_school", width: 30 },
                { header: "MODALIDAD", key: "modality", width: 30 },
                { header: "SECCIÓN", key: "work_day", width: 30 },
                { header: "FECHA DE INICIO DE CARRERA", key: "career_start", width: 30 },
                { header: "NIVEL ACADÉMICO", key: "level", width: 30 },
                { header: "HA REPROBADO AL MENOS UNA MATERIA", key: "subjects_repeated", width: 30 },
                { header: "MANTIENE GRATUIDAD", key: "gratuity", width: 30 },
                { header: "PARALELO", key: "parallel", width: 30 },
                { header: "RECIBE PENSIÓN DIFERENCIADA", key: "differentiated_pension", width: 30 },
                { header: "OCUPACIÓN DEL ESTUDIANTE", key: "student_occupation", width: 30 },
                { header: "INGRESOS DEL ESTUDIANTE", key: "student_income", width: 30 },
                { header: "RECIBE BONO DE DESARROLLO", key: "development_bonus", width: 30 },
                { header: "TIPO DE BECA", key: "type_scholarship", width: 30 },
                { header: "RAZÓN DE BECA", key: "scholarship_reason", width: 30 },
                { header: "MONTO DE BECA (DÓLARES)", key: "scholarship_amount", width: 30 },
                { header: "PORCENTAJE DE COBERTURA ARANCEL (%)", key: "tariff_coverage", width: 30 },
                { header: "PORCENTAJE DE COBERTURA MANUTENCIÓN (%)", key: "maintenance_coverage", width: 30 },
                { header: "FINANCIAMIENTO DE LA BECA", key: "scholarship_funding", width: 30 },
                { header: "MONTO DE AYUDA ECONÓMICA", key: "economic_aid", width: 30 },
                { header: "POSEE CRÉDITO EDUCATIVO", key: "educative_credit", width: 30 },
                { header: "NÚMERO CELULAR", key: "no_celular", width: 30 },
                { header: "NIVEL DE FORMACIÓN DEL PADRE", key: "father_level", width: 30 },
                { header: "NIVEL DE FORMACIÓN DE LA MADRE", key: "mother_level", width: 30 },
                { header: "INGRESOS TOTALES DEL HOGAR", key: "household_income", width: 30 },
                { header: "CANTIDAD DE MIEMBROS EN EL HOGAR", key: "members_family", width: 30 },
                { header: "CONTACTO DE EMERGENCIA", key: "emergency_contact", width: 30 },
                { header: "NÚMERO DE CONTACTO DE EMERGENCIA", key: "no_emergency_contact", width: 30 },
                { header: "DIRECCIÓN", key: "direction", width: 30 },
                { header: "HABLA ALGÚN IDIOMA ANCESTRAL", key: "ancestral_language", width: 30 },
                { header: "CATEGORÍA MIGRATORIA", key: "migratory_category", width: 30 },
                { header: "POSEE ALGÚN TÍTULO DE EDUCACIÓN SUPERIOR", key: "higher_degree", width: 30 },
                { header: "TITULO DEL ESTUDIANTE", key: "title_name", width: 30 },
                { header: "ES ESTUDIANTE POR PRIMERA VEZ", key: "new_student", width: 30 }
            ]
            worksheet_subjectStatus.columns = [
                { header: "NO#", key: "no", width: 5 },
                { header: "NOMBRE", key: "name", width: 60 },
                { header: "NIVEL", key: "level", width: 10 },
                { header: "HORAS SEMANALES", key: "weekly_hours", width: 25 },
                { header: "ESTADO", key: "status", width: 25 },
                { header: "MATRICULA # 1", key: "e_1", width: 25 },
                { header: "MATRICULA # 2", key: "e_2", width: 25 },
                { header: "MATRICULA # 3", key: "e_3", width: 25 },
                { header: "ULT MODIFICADO", key: "last_modify", width: 40 }
            ]
            worksheet_studentData.getRow(1).eachCell( (cell) => {
                cell.font = { bold : true }
                cell.fill = {
                    type: 'pattern',
                    pattern:'lightGray',
                    fgColor:{argb:'FFD3D3D3'},
                    bgColor : {argb:'FFD3D3D3'} 
                }
            })
            worksheet_subjectStatus.getRow(1).eachCell( (cell) => {
                cell.font = { bold : true }
                cell.fill = {
                    type: 'pattern',
                    pattern:'lightGray',
                    fgColor:{argb:'FFD3D3D3'},
                    bgColor : {argb:'FFD3D3D3'} 
                }
            })
            worksheet_studentData.addRow(student)
            student.subjects.sort( (a, b) => Number(a.no) - Number(b.no) ).forEach( sub => {
                worksheet_subjectStatus.addRow(sub)
            })
            let row = worksheet_studentData.getRow(2),
                col = worksheet_subjectStatus.getColumn('status')
            col.eachCell( (cell, rowNumber) => {
                if(rowNumber>1){
                    let row = worksheet_subjectStatus.getRow(rowNumber),
                        no_enrollment = Number(student.subjects.filter(n => n.no == row.getCell('no').value)[0].enrollment)
                    if(cell.value==true) {
                        for(let x = 1 ; x<=3; x++){
                            if(x == no_enrollment){
                                row.getCell(5+x).value = 'APROBADO'
                            }
                            else if( x < no_enrollment){
                                row.getCell(5+x).value = 'REPROBADO'
                            }
                            else if( x > no_enrollment){
                                row.getCell(5+x).value = 'INDEFINIDO'
                            }
                        }
                        cell.value = 'APROBADO'
                    }
                    else {
                        for(let x = 1 ; x<=3; x++){
                            if( no_enrollment<=1 ){
                                row.getCell(5+x).value = 'INDEFINIDO'
                            }
                            else{
                                if( x < no_enrollment){
                                    row.getCell(5+x).value = 'REPROBADO'
                                }
                                else if( x >= no_enrollment){
                                    row.getCell(5+x).value = 'INDEFINIDO'
                                }
                            }
                        }
                        if(no_enrollment<=1) cell.value = 'INDEFINIDO'
                        else cell.value = 'REPROBADO'
                    }
                }
            })
            row.eachCell({ includeEmpty: true },(cell, col) => {
                if(cell.value=='UNDEFINED'||cell.value=='undefined'){
                    cell.value = 'INDEFINIDO'
                }
                if(worksheet_studentData.getColumn(col).key=='confidentiality'){
                    if(cell.value==true) cell.value = 'DE ACUERDO'
                }
                if(worksheet_studentData.getColumn(col).key=='upload_doc'){
                    if(cell.value==true) cell.value = 'SI CARGA'
                    else cell.value = 'NO CARGA'
                }
                if(worksheet_studentData.getColumn(col).key=='gender'){
                    if(cell.value==null) cell.value = 'INDEFINIDO'
                    else if(cell.value==true) cell.value = 'MASCULINO'
                    else cell.value = 'FEMENINO'
                }
                if(worksheet_studentData.getColumn(col).key=='complete_name'){
                    cell.value = student.getFullName.filter(n => n != 'NA').join(' ')
                }
                if(worksheet_studentData.getColumn(col).key=='sex'){
                    if(cell.value==true) cell.value = 'HOMBRE'
                    else cell.value = 'MUJER'
                }
                if(worksheet_studentData.getColumn(col).key=='gender'){
                    if(cell.value==null) cell.value = 'INDEFINIDO'
                }
                if(worksheet_studentData.getColumn(col).key=='subjects_repeated'){
                    if(cell.value==true) cell.value = 'SI'
                    else cell.value = 'NO'
                }
                if(worksheet_studentData.getColumn(col).key=='ethnicity'){
                    if(cell.value=='INDEFINIDO') {
                        row.getCell(col + 1).value = 'INDEFINIDO'
                    }
                }
                if(worksheet_studentData.getColumn(col).key=='disability'){
                    if(cell.value==null) {
                        cell.value = 'INDEFINIDO'
                        for(let x = 3 ; x>=1; x--){
                            row.getCell(col+x).value = 'INDEFINIDO'
                        }
                    }
                    else if(cell.value==true) cell.value = 'SI'
                    else cell.value = 'NO'
                }
                if(worksheet_studentData.getColumn(col).key=='nationality'){
                    if(cell.value=='INDEFINIDO') {
                        for(let x = 2 ; x>=1; x--){
                            row.getCell(col+x).value = 'INDEFINIDO'
                        }
                    }
                }
                if(worksheet_studentData.getColumn(col).key=='differentiated_pension'){
                    if(cell.value!='INDEFINIDO'){
                        if(cell.value=='true') cell.value = 'SI'
                        else cell.value = 'NO'
                    }
                }
                if(worksheet_studentData.getColumn(col).key=='development_bonus'){
                    if(cell.value!='INDEFINIDO'){
                        if(cell.value=='true') cell.value = 'SI'
                        else cell.value = 'NO'
                    }
                }
                if(worksheet_studentData.getColumn(col).key=='educative_credit'){
                    if(cell.value!='INDEFINIDO'){
                        if(cell.value=='true') cell.value = 'SI'
                        else cell.value = 'NO'
                    }
                }
                if(worksheet_studentData.getColumn(col).key=='higher_degree'){
                    if(cell.value!='INDEFINIDO'){
                        if(cell.value=='true') cell.value = 'SI'
                        else cell.value = 'NO'
                    }
                }
                if(worksheet_studentData.getColumn(col).key=='new_student'){
                    cell.value = `${student.new_student?'SI':'NO'} - ${student.drags?'CON ARRASTRE':'SIN ARRASTRE'}`
                }
                if(worksheet_studentData.getColumn(col).key=='gratuity'){
                    if(cell.value==true) cell.value = 'SI'
                    else cell.value = 'NO'
                }
                if(worksheet_studentData.getColumn(col).key=='parallel'){
                    if(cell.value==null) {
                        cell.value = 'INDEFINIDO'
                    }
                }
                if(worksheet_studentData.getColumn(col).key=='economic_aid'){
                    if(cell.value==null) {
                        cell.value = 'INDEFINIDO'
                    }
                }
            })
            await workBook.xlsx.writeFile(dir)
            return {status:true, message:'Archivo creado correctamente', path:dir}
    }
    catch(err){
        return {status:false, message:err.message, path:null}
    }
}

function makeEnrollmentData(enrollment){
    return new Promise((res, rej) => {
        try{
            let {studentData, enrollment_features, information_per_enroll} = enrollment
            Object.assign(studentData[0], information_per_enroll, enrollment_features)
            res(studentData[0])
        }
        catch(err){
            rej(err)
        }
    })
}

async function makeEnrollmentExcel(id){
    try{
        let enrollment = await EnrollmentStudent.findById(id),
            {request_subjects, studentData} = enrollment,
            dir = path.join(__dirname, '..', 'temp', `${studentData[0].no_identifier}.xlsx`),
            workBook = new exceljs.Workbook(),
            worksheet_enrollmentData = workBook.addWorksheet(`MATRICULA, ${studentData[0].no_identifier}`),
            worksheet_requestedSubjects = workBook.addWorksheet(`ASIGNATURAS SOLICITADAS`),
        enrollmentData = await makeEnrollmentData(enrollment)
        worksheet_enrollmentData.columns = [
            { header: "CARRERA", key: "career", width: 30 },
            { header: "EMAIL", key: "email", width: 30 },
            { header: "ACUERDO DE CONFIDENCIALIDAD", key: "confidentiality", width: 30 },
            { header: "TIPO DE IDENTIFICACIÓN", key: "identifier", width: 30 },
            { header: "NÚMERO DE IDENTIFICACIÓN", key: "no_identifier", width: 30 },
            { header: "CARGA DOCUMENTACIÓN", key: "upload_doc", width: 30 },
            { header: "PRIMER NOMBRE", key: "first_name", width: 30 },
            { header: "SEGUNDO NOMBRE", key: "second_name", width: 30 },
            { header: "PRIMER APELLIDO", key: "first_lastname", width: 30 },
            { header: "SEGUNDO APELLIDO", key: "second_lastname", width: 30 },
            { header: "NOMBRES COMPLETOS", key: "complete_name", width: 30 },
            { header: "SÉXO", key: "sex", width: 30 },
            { header: "GÉNERO", key: "gender", width: 30 },
            { header: "ESTADO CIVIL", key: "marital_status", width: 30 },
            { header: "ETNIA", key: "ethnicity", width: 30 },
            { header: "PUEBLO", key: "village", width: 30 },
            { header: "TIPO DE SANGRE", key: "blood_type", width: 30 },
            { header: "DISCAPACIDAD", key: "disability", width: 30 },
            { header: "PORCENTAJE DE DISCAPACIDAD", key: "disability_percentage", width: 30 },
            { header: "NÚMERO DE CARNET CONADIS/MSP", key: "conadis_msp", width: 30 },
            { header: "TIPO DE DISCAPACIDAD", key: "disability_type", width: 30 },
            { header: "FECHA DE NACIMIENTO", key: "birth_date", width: 30 },
            { header: "PAIS/NACIONALIDAD", key: "nationality", width: 30 },
            { header: "PROVINCIA DE NACIMIENTO", key: "province_birth", width: 30 },
            { header: "CANTÓN DE NACIMIENTO", key: "canton_birth", width: 30 },
            { header: "PAÍS DE RESIDENCIA", key: "country_residence", width: 30 },
            { header: "PROVINCIA DE RESIDENCIA", key: "province_residence", width: 30 },
            { header: "CANTÓN DE RESIDENCIA", key: "canton_residence", width: 30 },
            { header: "TIPO DE COLEGIO", key: "type_school", width: 30 },
            { header: "MODALIDAD", key: "modality", width: 30 },
            { header: "SECCIÓN", key: "work_day", width: 30 },
            { header: "FECHA DE INICIO DE CARRERA", key: "career_start", width: 30 },
            { header: "FECHA DE MATRICULA", key: "createdAt", width: 30 },
            { header: "TIPO DE MATRICULA", key: "type", width: 30 },
            { header: "NIVEL ACADÉMICO", key: "level", width: 30 },
            { header: "DURACIÓN DEL PERIODO ACADÉMICO (SEMANAS)", key: "duration", width: 30 },
            { header: "HA REPROBADO AL MENOS UNA MATERIA", key: "subjects_repeated", width: 30 },
            { header: "MANTIENE GRATUIDAD", key: "gratuity", width: 30 },
            { header: "PARALELO", key: "parallel", width: 30 },
            { header: "RECIBE PENSIÓN DIFERENCIADA", key: "differentiated_pension", width: 30 },
            { header: "OCUPACIÓN DE ESTUDIANTE", key: "student_occupation", width: 30 },
            { header: "INGRESOS DEL ESTUDIANTE", key: "student_income", width: 30 },
            { header: "RECIBE BONO DE DESARROLLO", key: "development_bonus", width: 30 },
            { header: "TIPO DE BECA", key: "type_scholarship", width: 30 },
            { header: "RAZÓN DE BECA", key: "scholarship_reason", width: 30 },
            { header: "MONTO DE BECA (DÓLARES)", key: "scholarship_amount", width: 30 },
            { header: "PORCENTAJE DE COBERTURA ARANCEL (%)", key: "tariff_coverage", width: 30 },
            { header: "PORCENTAJE DE COBERTURA MANUTENCIÓN (%)", key: "maintenance_coverage", width: 30 },
            { header: "FINANCIAMIENTO DE LA BECA", key: "scholarship_funding", width: 30 },
            { header: "MONTO DE AYUDA ECONÓMICA", key: "economic_aid", width: 30 },
            { header: "POSEE CRÉDITO EDUCATIVO", key: "educative_credit", width: 30 },
            { header: "NÚMERO CELULAR", key: "no_celular", width: 30 },
            { header: "NIVEL DE FORMACIÓN DEL PADRE", key: "father_level", width: 30 },
            { header: "NIVEL DE FORMACIÓN DE LA MADRE", key: "mother_level", width: 30 },
            { header: "INGRESOS TOTALES DEL HOGAR", key: "household_income", width: 30 },
            { header: "CANTIDAD DE MIEMBROS EN EL HOGAR", key: "members_family", width: 30 },
            { header: "CONTACTO DE EMERGENCIA", key: "emergency_contact", width: 30 },
            { header: "NÚMERO DE CONTACTO DE EMERGENCIA", key: "no_emergency_contact", width: 30 },
            { header: "DIRECCIÓN", key: "direction", width: 30 },
            { header: "HABLA ALGÚN IDIOMA ANCESTRAL", key: "ancestral_language", width: 30 },
            { header: "CATEGORÍA MIGRATORIA", key: "migratory_category", width: 30 },
            { header: "POSEE ALGÚN TÍTULO DE EDUCACIÓN SUPERIOR", key: "higher_degree", width: 30 },
            { header: "TITULO DEL ESTUDIANTE", key: "title_name", width: 30 },
            { header: "ES ESTUDIANTE POR PRIMERA VEZ", key: "new_student", width: 30 }
        ]
        worksheet_requestedSubjects.columns = [
            { header: "CI", key: "no_identifier", width: 30 },
            { header: "ESTUDIANTE", key: "student_name", width: 30 },
            { header: "PERIODO", key: "period", width: 30 },
            { header: "# DE MATRICULA", key: "enrollment", width: 25 },
            { header: "NIVEL", key: "level", width: 10 },
            { header: "SECCION", key: "section", width: 10 },
            { header: "NO#", key: "no", width: 5 },
            { header: "NOMBRE", key: "name", width: 60 },
            { header: "ESTADO", key: "status", width: 60 },
            { header: "HORAS SEMANALES", key: "weekly_hours", width: 25 },
        ]
        worksheet_enrollmentData.getRow(1).eachCell( (cell) => {
            cell.font = { bold : true }
            cell.fill = {
                type: 'pattern',
                pattern:'lightGray',
                fgColor:{argb:'FFD3D3D3'},
                bgColor : {argb:'FFD3D3D3'} 
            }
        })
        worksheet_requestedSubjects.getRow(1).eachCell( (cell) => {
            cell.font = { bold : true }
            cell.fill = {
                type: 'pattern',
                pattern:'lightGray',
                fgColor:{argb:'FFD3D3D3'},
                bgColor : {argb:'FFD3D3D3'} 
            }
        })
        worksheet_enrollmentData.addRow(enrollmentData)
        request_subjects.sort( (a, b) => Number(a.no) - Number(b.no) ).forEach( sub => {
            let subb = Object.assign(sub, {no_identifier:studentData[0].no_identifier, student_name:`${studentData[0].first_name}${studentData[0].second_name!='NA'?' '+studentData[0].second_name:''} ${studentData[0].first_lastname}${enrollmentData.second_lastname!='NA'?' '+enrollmentData.second_lastname:''}`, period:`${enrollmentData.period}${enrollmentData.year}`, section:`${enrollmentData.work_day}`, })
            worksheet_requestedSubjects.addRow(subb)
        })
        let statusCol = worksheet_requestedSubjects.getColumn('status')
            statusCol.eachCell((cell) => {
                if(cell.value!='ESTADO'){
                    if(enrollment.qualified[0]==false){
                        cell.value = 'INDEFINIDO'
                    }
                    else {
                        if (cell.value==false) cell.value = 'REPROBADO'
                        else if (cell.value==true) cell.value = 'APROBADO'
                    }
                }
            })
        let row = worksheet_enrollmentData.getRow(2)
        row.eachCell({ includeEmpty: true },(cell, col) => {
            if(cell.value=='UNDEFINED'||cell.value=='undefined'){
                cell.value = 'INDEFINIDO'
            }
            if(worksheet_enrollmentData.getColumn(col).key=='confidentiality'){
                if(cell.value==true) cell.value = 'DE ACUERDO'
            }
            if(worksheet_enrollmentData.getColumn(col).key=='upload_doc'){
                if(cell.value==true) cell.value = 'SI CARGA'
                else cell.value = 'NO CARGA'
            }
            if(worksheet_enrollmentData.getColumn(col).key=='gender'){
                if(cell.value==null) cell.value = 'INDEFINIDO'
                else if(cell.value==true) cell.value = 'MASCULINO'
                else cell.value = 'FEMENINO'
            }
            if(worksheet_enrollmentData.getColumn(col).key=='complete_name'){
                cell.value = `${studentData[0].first_name}${studentData[0].second_name!='NA'?' '+studentData[0].second_name:''} ${studentData[0].first_lastname}${enrollmentData.second_lastname!='NA'?' '+enrollmentData.second_lastname:''}`
            }
            if(worksheet_enrollmentData.getColumn(col).key=='sex'){
                if(cell.value==true) cell.value = 'HOMBRE'
                else cell.value = 'MUJER'
            }
            if(worksheet_enrollmentData.getColumn(col).key=='gender'){
                if(cell.value==null) cell.value = 'INDEFINIDO'
            }
            if(worksheet_enrollmentData.getColumn(col).key=='subjects_repeated'){
                if(cell.value==true) cell.value = 'SI'
                else cell.value = 'NO'
            }
            if(worksheet_enrollmentData.getColumn(col).key=='ethnicity'){
                if(cell.value=='INDEFINIDO') {
                    row.getCell(col + 1).value = 'INDEFINIDO'
                }
            }
            if(worksheet_enrollmentData.getColumn(col).key=='disability'){
                if(cell.value==null) {
                    cell.value = 'INDEFINIDO'
                    for(let x = 3 ; x>=1; x--){
                        row.getCell(col+x).value = 'INDEFINIDO'
                    }
                }
                else if(cell.value==true) cell.value = 'SI'
                else cell.value = 'NO'
            }
            if(worksheet_enrollmentData.getColumn(col).key=='nationality'){
                if(cell.value=='INDEFINIDO') {
                    for(let x = 2 ; x>=1; x--){
                        row.getCell(col+x).value = 'INDEFINIDO'
                    }
                }
            }
            if(worksheet_enrollmentData.getColumn(col).key=='differentiated_pension'){
                if(cell.value!='INDEFINIDO'){
                    if(cell.value=='true') cell.value = 'SI'
                    else cell.value = 'NO'
                }
            }
            if(worksheet_enrollmentData.getColumn(col).key=='development_bonus'){
                if(cell.value!='INDEFINIDO'){
                    if(cell.value=='true') cell.value = 'SI'
                    else cell.value = 'NO'
                }
            }
            if(worksheet_enrollmentData.getColumn(col).key=='educative_credit'){
                if(cell.value!='INDEFINIDO'){
                    if(cell.value=='true') cell.value = 'SI'
                    else cell.value = 'NO'
                }
            }
            if(worksheet_enrollmentData.getColumn(col).key=='higher_degree'){
                if(cell.value!='INDEFINIDO'){
                    if(cell.value=='true') cell.value = 'SI'
                    else cell.value = 'NO'
                }
            }
            if(worksheet_enrollmentData.getColumn(col).key=='new_student'){
                cell.value = `${enrollmentData.new_student?'SI':'NO'} - ${enrollmentData.drags?'CON ARRASTRE':'SIN ARRASTRE'}`
            }
            if(worksheet_enrollmentData.getColumn(col).key=='createdAt'){
                let year = enrollment.createdAt.getUTCFullYear(),
                    month = enrollment.createdAt.getUTCMonth() + 1,
                    day = enrollment.createdAt.getUTCDate()
                cell.value = `${year}-${month}-${day}`
            }
            if(worksheet_enrollmentData.getColumn(col).key=='gratuity'){
                if(cell.value==true) cell.value = 'SI'
                else cell.value = 'NO'
            }
            if(worksheet_enrollmentData.getColumn(col).key=='parallel'){
                if(cell.value==null) {
                    cell.value = 'INDEFINIDO'
                }
            }
            if(worksheet_enrollmentData.getColumn(col).key=='economic_aid'){
                if(cell.value==null) {
                    cell.value = 'INDEFINIDO'
                }
            }
        })
        await workBook.xlsx.writeFile(dir)
        return {status:true, message:'Archivo creado correctamente', path:dir}
    }
    catch(err){
        return {status:false, message:err.message, path:null}
    }
}

async function makeEnrollmentExcelTitulacion(id){
    try{
        let enrollment = await TitlePeriodStudent.findById(id),
            {studentData} = enrollment,
            dir = path.join(__dirname, '..', 'temp', `${studentData[0].no_identifier}.xlsx`),
            workBook = new exceljs.Workbook(),
            worksheet_enrollmentData = workBook.addWorksheet(`MATRICULA, ${studentData[0].no_identifier}`),
            enrollmentData = await makeEnrollmentData(enrollment)
        worksheet_enrollmentData.columns = [
            { header: "CARRERA", key: "career", width: 30 },
            { header: "EMAIL", key: "email", width: 30 },
            { header: "ACUERDO DE CONFIDENCIALIDAD", key: "confidentiality", width: 30 },
            { header: "TIPO DE IDENTIFICACIÓN", key: "identifier", width: 30 },
            { header: "NÚMERO DE IDENTIFICACIÓN", key: "no_identifier", width: 30 },
            { header: "CARGA DOCUMENTACIÓN", key: "upload_doc", width: 30 },
            { header: "PRIMER NOMBRE", key: "first_name", width: 30 },
            { header: "SEGUNDO NOMBRE", key: "second_name", width: 30 },
            { header: "PRIMER APELLIDO", key: "first_lastname", width: 30 },
            { header: "SEGUNDO APELLIDO", key: "second_lastname", width: 30 },
            { header: "NOMBRES COMPLETOS", key: "complete_name", width: 30 },
            { header: "SÉXO", key: "sex", width: 30 },
            { header: "GÉNERO", key: "gender", width: 30 },
            { header: "ESTADO CIVIL", key: "marital_status", width: 30 },
            { header: "ETNIA", key: "ethnicity", width: 30 },
            { header: "PUEBLO", key: "village", width: 30 },
            { header: "TIPO DE SANGRE", key: "blood_type", width: 30 },
            { header: "DISCAPACIDAD", key: "disability", width: 30 },
            { header: "PORCENTAJE DE DISCAPACIDAD", key: "disability_percentage", width: 30 },
            { header: "NÚMERO DE CARNET CONADIS/MSP", key: "conadis_msp", width: 30 },
            { header: "TIPO DE DISCAPACIDAD", key: "disability_type", width: 30 },
            { header: "FECHA DE NACIMIENTO", key: "birth_date", width: 30 },
            { header: "PAIS/NACIONALIDAD", key: "nationality", width: 30 },
            { header: "PROVINCIA DE NACIMIENTO", key: "province_birth", width: 30 },
            { header: "CANTÓN DE NACIMIENTO", key: "canton_birth", width: 30 },
            { header: "PAÍS DE RESIDENCIA", key: "country_residence", width: 30 },
            { header: "PROVINCIA DE RESIDENCIA", key: "province_residence", width: 30 },
            { header: "CANTÓN DE RESIDENCIA", key: "canton_residence", width: 30 },
            { header: "TIPO DE COLEGIO", key: "type_school", width: 30 },
            { header: "MODALIDAD", key: "modality", width: 30 },
            { header: "SECCIÓN", key: "work_day", width: 30 },
            { header: "FECHA DE INICIO DE CARRERA", key: "career_start", width: 30 },
            { header: "FECHA DE MATRICULA", key: "createdAt", width: 30 },
            { header: "TIPO DE MATRICULA", key: "type", width: 30 },
            { header: "NIVEL ACADÉMICO", key: "level", width: 30 },
            { header: "DURACIÓN DEL PERIODO ACADÉMICO (SEMANAS)", key: "duration", width: 30 },
            { header: "HA REPROBADO AL MENOS UNA MATERIA", key: "subjects_repeated", width: 30 },
            { header: "MANTIENE GRATUIDAD", key: "gratuity", width: 30 },
            { header: "PARALELO", key: "parallel", width: 30 },
            { header: "RECIBE PENSIÓN DIFERENCIADA", key: "differentiated_pension", width: 30 },
            { header: "OCUPACIÓN DE ESTUDIANTE", key: "student_occupation", width: 30 },
            { header: "INGRESOS DEL ESTUDIANTE", key: "student_income", width: 30 },
            { header: "RECIBE BONO DE DESARROLLO", key: "development_bonus", width: 30 },
            { header: "TIPO DE BECA", key: "type_scholarship", width: 30 },
            { header: "RAZÓN DE BECA", key: "scholarship_reason", width: 30 },
            { header: "MONTO DE BECA (DÓLARES)", key: "scholarship_amount", width: 30 },
            { header: "PORCENTAJE DE COBERTURA ARANCEL (%)", key: "tariff_coverage", width: 30 },
            { header: "PORCENTAJE DE COBERTURA MANUTENCIÓN (%)", key: "maintenance_coverage", width: 30 },
            { header: "FINANCIAMIENTO DE LA BECA", key: "scholarship_funding", width: 30 },
            { header: "MONTO DE AYUDA ECONÓMICA", key: "economic_aid", width: 30 },
            { header: "POSEE CRÉDITO EDUCATIVO", key: "educative_credit", width: 30 },
            { header: "NÚMERO CELULAR", key: "no_celular", width: 30 },
            { header: "NIVEL DE FORMACIÓN DEL PADRE", key: "father_level", width: 30 },
            { header: "NIVEL DE FORMACIÓN DE LA MADRE", key: "mother_level", width: 30 },
            { header: "INGRESOS TOTALES DEL HOGAR", key: "household_income", width: 30 },
            { header: "CANTIDAD DE MIEMBROS EN EL HOGAR", key: "members_family", width: 30 },
            { header: "CONTACTO DE EMERGENCIA", key: "emergency_contact", width: 30 },
            { header: "NÚMERO DE CONTACTO DE EMERGENCIA", key: "no_emergency_contact", width: 30 },
            { header: "DIRECCIÓN", key: "direction", width: 30 },
            { header: "HABLA ALGÚN IDIOMA ANCESTRAL", key: "ancestral_language", width: 30 },
            { header: "CATEGORÍA MIGRATORIA", key: "migratory_category", width: 30 },
            { header: "POSEE ALGÚN TÍTULO DE EDUCACIÓN SUPERIOR", key: "higher_degree", width: 30 },
            { header: "TITULO DEL ESTUDIANTE", key: "title_name", width: 30 },
            { header: "ES ESTUDIANTE POR PRIMERA VEZ", key: "new_student", width: 30 }
        ]
        worksheet_enrollmentData.getRow(1).eachCell( (cell) => {
            cell.font = { bold : true }
            cell.fill = {
                type: 'pattern',
                pattern:'lightGray',
                fgColor:{argb:'FFD3D3D3'},
                bgColor : {argb:'FFD3D3D3'} 
            }
        })
        worksheet_enrollmentData.addRow(enrollmentData)
        let row = worksheet_enrollmentData.getRow(2)
        row.eachCell({ includeEmpty: true },(cell, col) => {
            if(cell.value=='UNDEFINED'||cell.value=='undefined'){
                cell.value = 'INDEFINIDO'
            }
            if(worksheet_enrollmentData.getColumn(col).key=='confidentiality'){
                if(cell.value==true) cell.value = 'DE ACUERDO'
            }
            if(worksheet_enrollmentData.getColumn(col).key=='upload_doc'){
                if(cell.value==true) cell.value = 'SI CARGA'
                else cell.value = 'NO CARGA'
            }
            if(worksheet_enrollmentData.getColumn(col).key=='gender'){
                if(cell.value==null) cell.value = 'INDEFINIDO'
                else if(cell.value==true) cell.value = 'MASCULINO'
                else cell.value = 'FEMENINO'
            }
            if(worksheet_enrollmentData.getColumn(col).key=='complete_name'){
                cell.value = `${studentData[0].first_name}${studentData[0].second_name!='NA'?' '+studentData[0].second_name:''} ${studentData[0].first_lastname}${enrollmentData.second_lastname!='NA'?' '+enrollmentData.second_lastname:''}`
            }
            if(worksheet_enrollmentData.getColumn(col).key=='sex'){
                if(cell.value==true) cell.value = 'HOMBRE'
                else cell.value = 'MUJER'
            }
            if(worksheet_enrollmentData.getColumn(col).key=='gender'){
                if(cell.value==null) cell.value = 'INDEFINIDO'
            }
            if(worksheet_enrollmentData.getColumn(col).key=='subjects_repeated'){
                if(cell.value==true) cell.value = 'SI'
                else cell.value = 'NO'
            }
            if(worksheet_enrollmentData.getColumn(col).key=='ethnicity'){
                if(cell.value=='INDEFINIDO') {
                    row.getCell(col + 1).value = 'INDEFINIDO'
                }
            }
            if(worksheet_enrollmentData.getColumn(col).key=='disability'){
                if(cell.value==null) {
                    cell.value = 'INDEFINIDO'
                    for(let x = 3 ; x>=1; x--){
                        row.getCell(col+x).value = 'INDEFINIDO'
                    }
                }
                else if(cell.value==true) cell.value = 'SI'
                else cell.value = 'NO'
            }
            if(worksheet_enrollmentData.getColumn(col).key=='nationality'){
                if(cell.value=='INDEFINIDO') {
                    for(let x = 2 ; x>=1; x--){
                        row.getCell(col+x).value = 'INDEFINIDO'
                    }
                }
            }
            if(worksheet_enrollmentData.getColumn(col).key=='differentiated_pension'){
                if(cell.value!='INDEFINIDO'){
                    if(cell.value=='true') cell.value = 'SI'
                    else cell.value = 'NO'
                }
            }
            if(worksheet_enrollmentData.getColumn(col).key=='type'){
                cell.value = enrollmentData.type[1]
            }
            if(worksheet_enrollmentData.getColumn(col).key=='development_bonus'){
                if(cell.value!='INDEFINIDO'){
                    if(cell.value=='true') cell.value = 'SI'
                    else cell.value = 'NO'
                }
            }
            if(worksheet_enrollmentData.getColumn(col).key=='educative_credit'){
                if(cell.value!='INDEFINIDO'){
                    if(cell.value=='true') cell.value = 'SI'
                    else cell.value = 'NO'
                }
            }
            if(worksheet_enrollmentData.getColumn(col).key=='higher_degree'){
                if(cell.value!='INDEFINIDO'){
                    if(cell.value=='true') cell.value = 'SI'
                    else cell.value = 'NO'
                }
            }
            if(worksheet_enrollmentData.getColumn(col).key=='new_student'){
                cell.value = `${enrollmentData.new_student?'SI':'NO'} - ${enrollmentData.drags?'CON ARRASTRE':'SIN ARRASTRE'}`
            }
            if(worksheet_enrollmentData.getColumn(col).key=='createdAt'){
                let year = enrollment.createdAt.getUTCFullYear(),
                    month = enrollment.createdAt.getUTCMonth() + 1,
                    day = enrollment.createdAt.getUTCDate()
                cell.value = `${year}-${month}-${day}`
            }
            if(worksheet_enrollmentData.getColumn(col).key=='gratuity'){
                if(cell.value==true) cell.value = 'SI'
                else cell.value = 'NO'
            }
            if(worksheet_enrollmentData.getColumn(col).key=='parallel'){
                if(cell.value==null) {
                    cell.value = 'INDEFINIDO'
                }
            }
            if(worksheet_enrollmentData.getColumn(col).key=='economic_aid'){
                if(cell.value==null) {
                    cell.value = 'INDEFINIDO'
                }
            }
        })
        await workBook.xlsx.writeFile(dir)
        return {status:true, message:'Archivo creado correctamente', path:dir}
    }
    catch(err){
        return {status:false, message:err.message, path:null}
    }
}

function generateFilters(filters){
    return new Promise( (res, rej) => {
        try{
            let matches = {status:'true'}
            filters.forEach( filter => {
                let key = Object.keys(filter)[0]
                if(key == 'student'){
                    matches['student'] = { $in : [filter[key]] }
                }
                else {
                    matches[`enrollment_features.${key}`] = filter[key]
                }
            })
            res(matches)
        }
        catch(err){
            rej(err)
        }
    })
}

function generateFiltersTitulacion(filters){
    return new Promise( (res, rej) => {
        try{
            let matches = {status: 'true'}
            filters.forEach( filter => {
                let key = Object.keys(filter)[0]
                if(key == 'student'){
                    matches['student'] = { $in :[ filter[key]] }
                }
                else if(key == 'type'){
                    matches[`enrollment_features.${key}`] = { $in : [Number(filter[key])] }
                }
                else {
                    matches[`enrollment_features.${key}`] = filter[key]
                }
            })
            res(matches)
        }
        catch(err){
            rej(err)
        }
    })
}

async function makeAllEnrollmentExcel(filter){
    try{
        let matches = await generateFilters(filter.filters),
            enrollments = await EnrollmentStudent.find(matches)
            if(enrollments.length > 0){
                async function makeExcel(enrollments) {
                    let dir = path.join(__dirname, '..', 'temp', `MATRICULAS_FILTRADAS.xlsx`),
                        workBook = new exceljs.Workbook(),
                        worksheet_enrollmentData = workBook.addWorksheet(`MATRICULAS`),
                        worksheet_requestedSubjects = workBook.addWorksheet(`ASIGNATURAS SOLICITADAS`)
                    for (let [i, enrollment] of enrollments.entries()) {
                        try {
                            let {request_subjects, studentData} = enrollment,
                                enrollmentData = await makeEnrollmentData(enrollment)
                                worksheet_enrollmentData.columns = [
                                    { header: "CARRERA", key: "career", width: 30 },
                                    { header: "EMAIL", key: "email", width: 30 },
                                    { header: "ACUERDO DE CONFIDENCIALIDAD", key: "confidentiality", width: 30 },
                                    { header: "TIPO DE IDENTIFICACIÓN", key: "identifier", width: 30 },
                                    { header: "NÚMERO DE IDENTIFICACIÓN", key: "no_identifier", width: 30 },
                                    { header: "CARGA DOCUMENTACIÓN", key: "upload_doc", width: 30 },
                                    { header: "PRIMER NOMBRE", key: "first_name", width: 30 },
                                    { header: "SEGUNDO NOMBRE", key: "second_name", width: 30 },
                                    { header: "PRIMER APELLIDO", key: "first_lastname", width: 30 },
                                    { header: "SEGUNDO APELLIDO", key: "second_lastname", width: 30 },
                                    { header: "NOMBRES COMPLETOS", key: "complete_name", width: 30 },
                                    { header: "SÉXO", key: "sex", width: 30 },
                                    { header: "GÉNERO", key: "gender", width: 30 },
                                    { header: "ESTADO CIVIL", key: "marital_status", width: 30 },
                                    { header: "ETNIA", key: "ethnicity", width: 30 },
                                    { header: "PUEBLO", key: "village", width: 30 },
                                    { header: "TIPO DE SANGRE", key: "blood_type", width: 30 },
                                    { header: "DISCAPACIDAD", key: "disability", width: 30 },
                                    { header: "PORCENTAJE DE DISCAPACIDAD", key: "disability_percentage", width: 30 },
                                    { header: "NÚMERO DE CARNET CONADIS/MSP", key: "conadis_msp", width: 30 },
                                    { header: "TIPO DE DISCAPACIDAD", key: "disability_type", width: 30 },
                                    { header: "FECHA DE NACIMIENTO", key: "birth_date", width: 30 },
                                    { header: "PAIS/NACIONALIDAD", key: "nationality", width: 30 },
                                    { header: "PROVINCIA DE NACIMIENTO", key: "province_birth", width: 30 },
                                    { header: "CANTÓN DE NACIMIENTO", key: "canton_birth", width: 30 },
                                    { header: "PAÍS DE RESIDENCIA", key: "country_residence", width: 30 },
                                    { header: "PROVINCIA DE RESIDENCIA", key: "province_residence", width: 30 },
                                    { header: "CANTÓN DE RESIDENCIA", key: "canton_residence", width: 30 },
                                    { header: "TIPO DE COLEGIO", key: "type_school", width: 30 },
                                    { header: "MODALIDAD", key: "modality", width: 30 },
                                    { header: "SECCIÓN", key: "work_day", width: 30 },
                                    { header: "FECHA DE INICIO DE CARRERA", key: "career_start", width: 30 },
                                    { header: "FECHA DE MATRICULA", key: "createdAt", width: 30 },
                                    { header: "TIPO DE MATRICULA", key: "type", width: 30 },
                                    { header: "NIVEL ACADÉMICO", key: "level", width: 30 },
                                    { header: "DURACIÓN DEL PERIODO ACADÉMICO (SEMANAS)", key: "duration", width: 30 },
                                    { header: "HA REPROBADO AL MENOS UNA MATERIA", key: "subjects_repeated", width: 30 },
                                    { header: "MANTIENE GRATUIDAD", key: "gratuity", width: 30 },
                                    { header: "PARALELO", key: "parallel", width: 30 },
                                    { header: "RECIBE PENSIÓN DIFERENCIADA", key: "differentiated_pension", width: 30 },
                                    { header: "OCUPACIÓN DE ESTUDIANTE", key: "student_occupation", width: 30 },
                                    { header: "INGRESOS DEL ESTUDIANTE", key: "student_income", width: 30 },
                                    { header: "RECIBE BONO DE DESARROLLO", key: "development_bonus", width: 30 },
                                    { header: "TIPO DE BECA", key: "type_scholarship", width: 30 },
                                    { header: "RAZÓN DE BECA", key: "scholarship_reason", width: 30 },
                                    { header: "MONTO DE BECA (DÓLARES)", key: "scholarship_amount", width: 30 },
                                    { header: "PORCENTAJE DE COBERTURA ARANCEL (%)", key: "tariff_coverage", width: 30 },
                                    { header: "PORCENTAJE DE COBERTURA MANUTENCIÓN (%)", key: "maintenance_coverage", width: 30 },
                                    { header: "FINANCIAMIENTO DE LA BECA", key: "scholarship_funding", width: 30 },
                                    { header: "MONTO DE AYUDA ECONÓMICA", key: "economic_aid", width: 30 },
                                    { header: "POSEE CRÉDITO EDUCATIVO", key: "educative_credit", width: 30 },
                                    { header: "NÚMERO CELULAR", key: "no_celular", width: 30 },
                                    { header: "NIVEL DE FORMACIÓN DEL PADRE", key: "father_level", width: 30 },
                                    { header: "NIVEL DE FORMACIÓN DE LA MADRE", key: "mother_level", width: 30 },
                                    { header: "INGRESOS TOTALES DEL HOGAR", key: "household_income", width: 30 },
                                    { header: "CANTIDAD DE MIEMBROS EN EL HOGAR", key: "members_family", width: 30 },
                                    { header: "CONTACTO DE EMERGENCIA", key: "emergency_contact", width: 30 },
                                    { header: "NÚMERO DE CONTACTO DE EMERGENCIA", key: "no_emergency_contact", width: 30 },
                                    { header: "DIRECCIÓN", key: "direction", width: 30 },
                                    { header: "HABLA ALGÚN IDIOMA ANCESTRAL", key: "ancestral_language", width: 30 },
                                    { header: "CATEGORÍA MIGRATORIA", key: "migratory_category", width: 30 },
                                    { header: "POSEE ALGÚN TÍTULO DE EDUCACIÓN SUPERIOR", key: "higher_degree", width: 30 },
                                    { header: "TITULO DEL ESTUDIANTE", key: "title_name", width: 30 },
                                    { header: "ES ESTUDIANTE POR PRIMERA VEZ", key: "new_student", width: 30 }
                                ]
                                worksheet_requestedSubjects.columns = [
                                    { header: "CI", key: "student", width: 17 },
                                    { header: "NOMBRE", key: "student_name", width: 30 },
                                    { header: "PERIODO", key: "period", width: 17 },
                                    { header: "# DE MATRICULA", key: "enrollment", width: 25 },
                                    { header: "NIVEL", key: "level", width: 10 },
                                    { header: "SECCIÓN", key: "work_day", width: 10 },
                                    { header: "NO#", key: "no", width: 5 },
                                    { header: "NOMBRE", key: "name", width: 60 },
                                    { header: "ESTADO", key: "status", width: 60 },
                                    { header: "HORAS SEMANALES", key: "weekly_hours", width: 25 },
                                ]
                                worksheet_enrollmentData.getRow(1).eachCell( (cell) => {
                                    cell.font = { bold : true }
                                    cell.fill = {
                                        type: 'pattern',
                                        pattern:'lightGray',
                                        fgColor:{argb:'FFD3D3D3'},
                                        bgColor : {argb:'FFD3D3D3'} 
                                    }
                                })
                                worksheet_requestedSubjects.getRow(1).eachCell( (cell) => {
                                    cell.font = { bold : true }
                                    cell.fill = {
                                        type: 'pattern',
                                        pattern:'lightGray',
                                        fgColor:{argb:'FFD3D3D3'},
                                        bgColor : {argb:'FFD3D3D3'} 
                                    }
                                })
                                worksheet_enrollmentData.addRow(enrollmentData)
                                request_subjects.sort( (a, b) => Number(a.no) - Number(b.no) ).forEach( (sub, i) => {
                                    let subb = Object.assign(sub, {work_day: enrollmentData.work_day, period:`${enrollmentData.period}${enrollmentData.year}`, student_name:`${studentData[0].first_name}${studentData[0].second_name!='NA'?' '+studentData[0].second_name:''} ${studentData[0].first_lastname}${enrollmentData.second_lastname!='NA'?' '+enrollmentData.second_lastname:''}`, student:studentData[0].no_identifier})
                                    worksheet_requestedSubjects.addRow(subb)
                                })
                                let statusCol = worksheet_requestedSubjects.getColumn('status')
                                statusCol.eachCell((cell) => {
                                    if(cell.value!='ESTADO'){
                                        if(enrollment.qualified[0]==false){
                                            cell.value = 'INDEFINIDO'
                                        }
                                        else {
                                            if (cell.value==false) cell.value = 'REPROBADO'
                                            else if (cell.value==true) cell.value = 'APROBADO'
                                        }
                                    }
                                })
                                let row = worksheet_enrollmentData.getRow(2 + i)
                                row.eachCell({ includeEmpty: true },(cell, col) => {
                                    if(cell.value=='UNDEFINED'||cell.value=='undefined'){
                                        cell.value = 'INDEFINIDO'
                                    }
                                    if(worksheet_enrollmentData.getColumn(col).key=='confidentiality'){
                                        if(cell.value==true) cell.value = 'DE ACUERDO'
                                    }
                                    if(worksheet_enrollmentData.getColumn(col).key=='upload_doc'){
                                        if(cell.value==true) cell.value = 'SI CARGA'
                                        else cell.value = 'NO CARGA'
                                    }
                                    if(worksheet_enrollmentData.getColumn(col).key=='gender'){
                                        if(cell.value==null) cell.value = 'INDEFINIDO'
                                        else if(cell.value==true) cell.value = 'MASCULINO'
                                        else cell.value = 'FEMENINO'
                                    }
                                    if(worksheet_enrollmentData.getColumn(col).key=='complete_name'){
                                        cell.value = `${studentData[0].first_name}${studentData[0].second_name!='NA'?' '+studentData[0].second_name:''} ${studentData[0].first_lastname}${enrollmentData.second_lastname!='NA'?' '+enrollmentData.second_lastname:''}`
                                    }
                                    if(worksheet_enrollmentData.getColumn(col).key=='sex'){
                                        if(cell.value==true) cell.value = 'HOMBRE'
                                        else cell.value = 'MUJER'
                                    }
                                    if(worksheet_enrollmentData.getColumn(col).key=='gender'){
                                        if(cell.value==null) cell.value = 'INDEFINIDO'
                                    }
                                    if(worksheet_enrollmentData.getColumn(col).key=='subjects_repeated'){
                                        if(cell.value==true) cell.value = 'SI'
                                        else cell.value = 'NO'
                                    }
                                    if(worksheet_enrollmentData.getColumn(col).key=='ethnicity'){
                                        if(cell.value=='INDEFINIDO') {
                                            row.getCell(col + 1).value = 'INDEFINIDO'
                                        }
                                    }
                                    if(worksheet_enrollmentData.getColumn(col).key=='disability'){
                                        if(cell.value==null) {
                                            cell.value = 'INDEFINIDO'
                                            for(let x = 3 ; x>=1; x--){
                                                row.getCell(col+x).value = 'INDEFINIDO'
                                            }
                                        }
                                        else if(cell.value==true) cell.value = 'SI'
                                        else cell.value = 'NO'
                                    }
                                    if(worksheet_enrollmentData.getColumn(col).key=='nationality'){
                                        if(cell.value=='INDEFINIDO') {
                                            for(let x = 2 ; x>=1; x--){
                                                row.getCell(col+x).value = 'INDEFINIDO'
                                            }
                                        }
                                    }
                                    if(worksheet_enrollmentData.getColumn(col).key=='differentiated_pension'){
                                        if(cell.value!='INDEFINIDO'){
                                            if(cell.value=='true') cell.value = 'SI'
                                            else cell.value = 'NO'
                                        }
                                    }
                                    if(worksheet_enrollmentData.getColumn(col).key=='development_bonus'){
                                        if(cell.value!='INDEFINIDO'){
                                            if(cell.value=='true') cell.value = 'SI'
                                            else cell.value = 'NO'
                                        }
                                    }
                                    if(worksheet_enrollmentData.getColumn(col).key=='educative_credit'){
                                        if(cell.value!='INDEFINIDO'){
                                            if(cell.value=='true') cell.value = 'SI'
                                            else cell.value = 'NO'
                                        }
                                    }
                                    if(worksheet_enrollmentData.getColumn(col).key=='higher_degree'){
                                        if(cell.value!='INDEFINIDO'){
                                            if(cell.value=='true') cell.value = 'SI'
                                            else cell.value = 'NO'
                                        }
                                    }
                                    if(worksheet_enrollmentData.getColumn(col).key=='new_student'){
                                        cell.value = `${enrollmentData.new_student?'SI':'NO'} - ${enrollmentData.drags?'CON ARRASTRE':'SIN ARRASTRE'}`
                                    }
                                    if(worksheet_enrollmentData.getColumn(col).key=='createdAt'){
                                        let year = enrollment.createdAt.getUTCFullYear(),
                                            month = enrollment.createdAt.getUTCMonth() + 1,
                                            day = enrollment.createdAt.getUTCDate()
                                        cell.value = `${year}-${month}-${day}`
                                    }
                                    if(worksheet_enrollmentData.getColumn(col).key=='gratuity'){
                                        if(cell.value==true) cell.value = 'SI'
                                        else cell.value = 'NO'
                                    }
                                    if(worksheet_enrollmentData.getColumn(col).key=='parallel'){
                                        if(cell.value==null) {
                                            cell.value = 'INDEFINIDO'
                                        }
                                    }
                                    if(worksheet_enrollmentData.getColumn(col).key=='economic_aid'){
                                        if(cell.value==null) {
                                            cell.value = 'INDEFINIDO'
                                        }
                                    }
                                })
                                await workBook.xlsx.writeFile(dir)
                        } catch (err) {
                            return {
                                status: false,
                                message: err.message,
                                pathh: null
                            }
                        }
                    }
                    return {
                        status: true,
                        message: 'Archivo creado correctamente',
                        pathh: dir
                    }
                }
                let {status, message, pathh} = await makeExcel(enrollments)
                if(status==true){
                    return {status, message, path:pathh}
                }
                else throw new Error(message)
            }
            else throw new Error('No se ha encontrado ninguna matrícula que coincida con los filtros.')
    }
    catch(err){
        return {status:false, message:err.message, path:null}
    }
}

async function makeAllEnrollmentExcelTitulacion(filter){
    try{
        let matches = await generateFiltersTitulacion(filter.filters)
            let enrollments = await TitlePeriodStudent.find(matches)
            if(enrollments.length > 0){
                async function makeExcel(enrollments) {
                    let dir = path.join(__dirname, '..', 'temp', `MATRICULAS_FILTRADAS.xlsx`),
                        workBook = new exceljs.Workbook(),
                        worksheet_enrollmentData = workBook.addWorksheet(`MATRICULAS`)
                    for (let [i, enrollment] of enrollments.entries()) {
                        try {
                            let {studentData} = enrollment,
                                enrollmentData = await makeEnrollmentData(enrollment)
                                worksheet_enrollmentData.columns = [
                                    { header: "CARRERA", key: "career", width: 30 },
                                    { header: "EMAIL", key: "email", width: 30 },
                                    { header: "ACUERDO DE CONFIDENCIALIDAD", key: "confidentiality", width: 30 },
                                    { header: "TIPO DE IDENTIFICACIÓN", key: "identifier", width: 30 },
                                    { header: "NÚMERO DE IDENTIFICACIÓN", key: "no_identifier", width: 30 },
                                    { header: "CARGA DOCUMENTACIÓN", key: "upload_doc", width: 30 },
                                    { header: "PRIMER NOMBRE", key: "first_name", width: 30 },
                                    { header: "SEGUNDO NOMBRE", key: "second_name", width: 30 },
                                    { header: "PRIMER APELLIDO", key: "first_lastname", width: 30 },
                                    { header: "SEGUNDO APELLIDO", key: "second_lastname", width: 30 },
                                    { header: "NOMBRES COMPLETOS", key: "complete_name", width: 30 },
                                    { header: "SÉXO", key: "sex", width: 30 },
                                    { header: "GÉNERO", key: "gender", width: 30 },
                                    { header: "ESTADO CIVIL", key: "marital_status", width: 30 },
                                    { header: "ETNIA", key: "ethnicity", width: 30 },
                                    { header: "PUEBLO", key: "village", width: 30 },
                                    { header: "TIPO DE SANGRE", key: "blood_type", width: 30 },
                                    { header: "DISCAPACIDAD", key: "disability", width: 30 },
                                    { header: "PORCENTAJE DE DISCAPACIDAD", key: "disability_percentage", width: 30 },
                                    { header: "NÚMERO DE CARNET CONADIS/MSP", key: "conadis_msp", width: 30 },
                                    { header: "TIPO DE DISCAPACIDAD", key: "disability_type", width: 30 },
                                    { header: "FECHA DE NACIMIENTO", key: "birth_date", width: 30 },
                                    { header: "PAIS/NACIONALIDAD", key: "nationality", width: 30 },
                                    { header: "PROVINCIA DE NACIMIENTO", key: "province_birth", width: 30 },
                                    { header: "CANTÓN DE NACIMIENTO", key: "canton_birth", width: 30 },
                                    { header: "PAÍS DE RESIDENCIA", key: "country_residence", width: 30 },
                                    { header: "PROVINCIA DE RESIDENCIA", key: "province_residence", width: 30 },
                                    { header: "CANTÓN DE RESIDENCIA", key: "canton_residence", width: 30 },
                                    { header: "TIPO DE COLEGIO", key: "type_school", width: 30 },
                                    { header: "MODALIDAD", key: "modality", width: 30 },
                                    { header: "SECCIÓN", key: "work_day", width: 30 },
                                    { header: "FECHA DE INICIO DE CARRERA", key: "career_start", width: 30 },
                                    { header: "FECHA DE MATRICULA", key: "createdAt", width: 30 },
                                    { header: "TIPO DE MATRICULA", key: "type", width: 30 },
                                    { header: "NIVEL ACADÉMICO", key: "level", width: 30 },
                                    { header: "DURACIÓN DEL PERIODO ACADÉMICO (SEMANAS)", key: "duration", width: 30 },
                                    { header: "HA REPROBADO AL MENOS UNA MATERIA", key: "subjects_repeated", width: 30 },
                                    { header: "MANTIENE GRATUIDAD", key: "gratuity", width: 30 },
                                    { header: "PARALELO", key: "parallel", width: 30 },
                                    { header: "RECIBE PENSIÓN DIFERENCIADA", key: "differentiated_pension", width: 30 },
                                    { header: "OCUPACIÓN DE ESTUDIANTE", key: "student_occupation", width: 30 },
                                    { header: "INGRESOS DEL ESTUDIANTE", key: "student_income", width: 30 },
                                    { header: "RECIBE BONO DE DESARROLLO", key: "development_bonus", width: 30 },
                                    { header: "TIPO DE BECA", key: "type_scholarship", width: 30 },
                                    { header: "RAZÓN DE BECA", key: "scholarship_reason", width: 30 },
                                    { header: "MONTO DE BECA (DÓLARES)", key: "scholarship_amount", width: 30 },
                                    { header: "PORCENTAJE DE COBERTURA ARANCEL (%)", key: "tariff_coverage", width: 30 },
                                    { header: "PORCENTAJE DE COBERTURA MANUTENCIÓN (%)", key: "maintenance_coverage", width: 30 },
                                    { header: "FINANCIAMIENTO DE LA BECA", key: "scholarship_funding", width: 30 },
                                    { header: "MONTO DE AYUDA ECONÓMICA", key: "economic_aid", width: 30 },
                                    { header: "POSEE CRÉDITO EDUCATIVO", key: "educative_credit", width: 30 },
                                    { header: "NÚMERO CELULAR", key: "no_celular", width: 30 },
                                    { header: "NIVEL DE FORMACIÓN DEL PADRE", key: "father_level", width: 30 },
                                    { header: "NIVEL DE FORMACIÓN DE LA MADRE", key: "mother_level", width: 30 },
                                    { header: "INGRESOS TOTALES DEL HOGAR", key: "household_income", width: 30 },
                                    { header: "CANTIDAD DE MIEMBROS EN EL HOGAR", key: "members_family", width: 30 },
                                    { header: "CONTACTO DE EMERGENCIA", key: "emergency_contact", width: 30 },
                                    { header: "NÚMERO DE CONTACTO DE EMERGENCIA", key: "no_emergency_contact", width: 30 },
                                    { header: "DIRECCIÓN", key: "direction", width: 30 },
                                    { header: "HABLA ALGÚN IDIOMA ANCESTRAL", key: "ancestral_language", width: 30 },
                                    { header: "CATEGORÍA MIGRATORIA", key: "migratory_category", width: 30 },
                                    { header: "POSEE ALGÚN TÍTULO DE EDUCACIÓN SUPERIOR", key: "higher_degree", width: 30 },
                                    { header: "TITULO DEL ESTUDIANTE", key: "title_name", width: 30 },
                                    { header: "ES ESTUDIANTE POR PRIMERA VEZ", key: "new_student", width: 30 }
                                ]
                                worksheet_enrollmentData.getRow(1).eachCell( (cell) => {
                                    cell.font = { bold : true }
                                    cell.fill = {
                                        type: 'pattern',
                                        pattern:'lightGray',
                                        fgColor:{argb:'FFD3D3D3'},
                                        bgColor : {argb:'FFD3D3D3'} 
                                    }
                                })
                                worksheet_enrollmentData.addRow(enrollmentData)
                                let row = worksheet_enrollmentData.getRow(2 + i)
                                row.eachCell({ includeEmpty: true },(cell, col) => {
                                    if(cell.value=='UNDEFINED'||cell.value=='undefined'){
                                        cell.value = 'INDEFINIDO'
                                    }
                                    if(worksheet_enrollmentData.getColumn(col).key=='confidentiality'){
                                        if(cell.value==true) cell.value = 'DE ACUERDO'
                                    }
                                    if(worksheet_enrollmentData.getColumn(col).key=='upload_doc'){
                                        if(cell.value==true) cell.value = 'SI CARGA'
                                        else cell.value = 'NO CARGA'
                                    }
                                    if(worksheet_enrollmentData.getColumn(col).key=='gender'){
                                        if(cell.value==null) cell.value = 'INDEFINIDO'
                                        else if(cell.value==true) cell.value = 'MASCULINO'
                                        else cell.value = 'FEMENINO'
                                    }
                                    if(worksheet_enrollmentData.getColumn(col).key=='complete_name'){
                                        cell.value = `${studentData[0].first_name}${studentData[0].second_name!='NA'?' '+studentData[0].second_name:''} ${studentData[0].first_lastname}${enrollmentData.second_lastname!='NA'?' '+enrollmentData.second_lastname:''}`
                                    }
                                    if(worksheet_enrollmentData.getColumn(col).key=='sex'){
                                        if(cell.value==true) cell.value = 'HOMBRE'
                                        else cell.value = 'MUJER'
                                    }
                                    if(worksheet_enrollmentData.getColumn(col).key=='gender'){
                                        if(cell.value==null) cell.value = 'INDEFINIDO'
                                    }
                                    if(worksheet_enrollmentData.getColumn(col).key=='subjects_repeated'){
                                        if(cell.value==true) cell.value = 'SI'
                                        else cell.value = 'NO'
                                    }
                                    if(worksheet_enrollmentData.getColumn(col).key=='ethnicity'){
                                        if(cell.value=='INDEFINIDO') {
                                            row.getCell(col + 1).value = 'INDEFINIDO'
                                        }
                                    }
                                    if(worksheet_enrollmentData.getColumn(col).key=='disability'){
                                        if(cell.value==null) {
                                            cell.value = 'INDEFINIDO'
                                            for(let x = 3 ; x>=1; x--){
                                                row.getCell(col+x).value = 'INDEFINIDO'
                                            }
                                        }
                                        else if(cell.value==true) cell.value = 'SI'
                                        else cell.value = 'NO'
                                    }
                                    if(worksheet_enrollmentData.getColumn(col).key=='nationality'){
                                        if(cell.value=='INDEFINIDO') {
                                            for(let x = 2 ; x>=1; x--){
                                                row.getCell(col+x).value = 'INDEFINIDO'
                                            }
                                        }
                                    }
                                    if(worksheet_enrollmentData.getColumn(col).key=='differentiated_pension'){
                                        if(cell.value!='INDEFINIDO'){
                                            if(cell.value=='true') cell.value = 'SI'
                                            else cell.value = 'NO'
                                        }
                                    }
                                    if(worksheet_enrollmentData.getColumn(col).key=='type'){
                                        cell.value = enrollmentData.type[1]
                                    }
                                    if(worksheet_enrollmentData.getColumn(col).key=='development_bonus'){
                                        if(cell.value!='INDEFINIDO'){
                                            if(cell.value=='true') cell.value = 'SI'
                                            else cell.value = 'NO'
                                        }
                                    }
                                    if(worksheet_enrollmentData.getColumn(col).key=='educative_credit'){
                                        if(cell.value!='INDEFINIDO'){
                                            if(cell.value=='true') cell.value = 'SI'
                                            else cell.value = 'NO'
                                        }
                                    }
                                    if(worksheet_enrollmentData.getColumn(col).key=='higher_degree'){
                                        if(cell.value!='INDEFINIDO'){
                                            if(cell.value=='true') cell.value = 'SI'
                                            else cell.value = 'NO'
                                        }
                                    }
                                    if(worksheet_enrollmentData.getColumn(col).key=='new_student'){
                                        cell.value = `${enrollmentData.new_student?'SI':'NO'} - ${enrollmentData.drags?'CON ARRASTRE':'SIN ARRASTRE'}`
                                    }
                                    if(worksheet_enrollmentData.getColumn(col).key=='createdAt'){
                                        let year = enrollment.createdAt.getUTCFullYear(),
                                            month = enrollment.createdAt.getUTCMonth() + 1,
                                            day = enrollment.createdAt.getUTCDate()
                                        cell.value = `${year}-${month}-${day}`
                                    }
                                    if(worksheet_enrollmentData.getColumn(col).key=='gratuity'){
                                        if(cell.value==true) cell.value = 'SI'
                                        else cell.value = 'NO'
                                    }
                                    if(worksheet_enrollmentData.getColumn(col).key=='parallel'){
                                        if(cell.value==null) {
                                            cell.value = 'INDEFINIDO'
                                        }
                                    }
                                    if(worksheet_enrollmentData.getColumn(col).key=='economic_aid'){
                                        if(cell.value==null) {
                                            cell.value = 'INDEFINIDO'
                                        }
                                    }
                                })
                                await workBook.xlsx.writeFile(dir)
                        } catch (err) {
                            return {
                                status: false,
                                message: err.message,
                                pathh: null
                            }
                        }
                    }
                    return {
                        status: true,
                        message: 'Archivo creado correctamente',
                        pathh: dir
                    }
                }
                let {status, message, pathh} = await makeExcel(enrollments)
                if(status==true){
                    return {status, message, path:pathh}
                }
                else throw new Error(message)
            }
            else throw new Error('No se ha encontrado ninguna matrícula que coincida con los filtros.')
    }
    catch(err){
        return {status:false, message:err.message, path:null}
    }
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

function getEnrollmentInformation(student, enrollment_published, messages) {
    return new Promise(async (res, rej) => {
        try {
            let returnObject = {};
            enrollment_published = enrollment_published.toObject()
            enrollment_published.type = 'ESPECIAL'
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

function comprobeExiled(subjects) {
    return subjects.some(sub => Number(sub.enrollment) > 3)
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
                    'El estudiante ya tiene una matrícula pendiente a ser aprobada',
                    'No hay procesos de matriculación activos actualmente.',
                    'El estudiante ya tiene una matricula finalizada relacionada a este periodo, para verlo por favor diríjase al apartado "Ver todas las matrículas"',
                    'El estudiante ya tiene una matricula aprobada relacionada a este periodo, para verlo por favor diríjase al apartado "Ver todas las matrículas"',
                    'No habrá más procesos de matriculación disponibles para el estudiante debido ha que agotado todas las matriculas disponibles en al menos una materia.',
                    'El estudiante tiene que subir su documentación antes de realizar cualquier proceso de matriculación.',
                    'No se ha encontrado al estudiante en la base de datos.'
                ],
                dir = path.join(__dirname, '..', '..', 'RESPALDOS_APLICACION', 'STUDENTFILES', `${identifier}`),
                student = await Student.findOne({
                    no_identifier: identifier
                })
            if(student){
                if (await existFile(dir)) {
                    if ((await fs.readdir(dir)).length >= 5) {
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

function countDocuments (model, _skip) {
    return new Promise ((res, rej) => {
        model.find().skip(_skip).countDocuments({}, (err, count) => {
            if (err) rej(err)
            else res(count)
        })
    })
}

adminController.renderAdminIndex = async (req, res) => {
    try{
        let {admin_name, admin_identifier} = req.session.auth,
            enrollmentsToQualify = await EnrollmentStudent.find({
                status: 'true',
                qualified: {
                    $in: false
                }
            })
        res.render('admin/vista_de_admin_index', {
            name: 'ADMIN',
            title: 'Administración Matriculas',
            admin_name,
            admin_identifier,
            enrollmentsToQualify
        })
    }
    catch(err){
        res.send(`Hubo un error accediendo a la página: ${err.message}`)
    }
}
adminController.renderAdminTitle = async (req, res) => {
    try{
        let {admin_name, admin_identifier} = req.session.auth,
            enrollmentsToQualify = await TitlePeriodStudent.find({
                status: 'true',
                qualified: {
                    $in: false
                }
            })
        res.render('admin/vista_de_admin_titulacion', {
            name: 'ADMIN',
            title: 'Administración Matriculas',
            admin_name,
            admin_identifier,
            enrollmentsToQualify
        })
    }
    catch(err){
        res.send(`Hubo un error accediendo a la página: ${err.message}`)
    }
}
adminController.renderNewTitleProcess = async (req, res) => {
    try{
        let {admin_name, admin_identifier} = req.session.auth,
            title_periods = await TitlePeriod.find({}),
            message = req.query.action?req.query.action=='1'?'Periodo publicado correctamente.':'Periodo eliminado correctamente.':null;
        res.render('admin/vista_de_admin_nuevo_periodo_titulacion', {
            name: 'ADMIN',
            title: 'Administración Matriculas',
            admin_name,
            admin_identifier,
            title_periods,
            message
        })  
    }
    catch(err){
        res.send(`Hubo un error accediendo a la página: ${err.message}`)
    }
}
adminController.renderNewProcess = async (req, res) => {
    try{
        let {admin_name, admin_identifier} = req.session.auth,
            enrollments = await Enrollment.find({}),
            message = req.query.action?req.query.action=='1'?'Proceso publicado correctamente.':'Proceso eliminado correctamente.':null;
        res.render('admin/vista_de_admin_nuevo_proceso', {
            name: 'ADMIN',
            title: 'Administración Matriculas',
            admin_name,
            admin_identifier,
            enrollments,
            message
        })  
    }
    catch(err){
        res.send(`Hubo un error accediendo a la página: ${err.message}`)
    }
}
adminController.specialEnrollments = async (req, res) => {
    try{
        let {admin_name, admin_identifier} = req.session.auth,
            queries = req.query
        if(Object.keys(req.query).length > 0){
            let result = await lookForStudentEnrollment({identifier:queries.ci_filter})
            res.render('admin/vista_de_admin_special_enroll', {
                name: 'ADMIN',
                title: 'Administración Matriculas',
                admin_name,
                admin_identifier,
                query: true, 
                result
            }) 
        }
        else res.render('admin/vista_de_admin_special_enroll', {
            name: 'ADMIN',
            title: 'Administración Matriculas',
            admin_name,
            admin_identifier,
            query: false
        })  
    }
    catch(err){
        res.send(`Hubo un error accediendo a la página: ${err.message}`)
    }
} 
adminController.userActive = (req, res) => {
    try{
        res.render('admin/vista_de_admin_user', {
            name: 'ADMIN',
            title: 'Administración Matriculas'
        })  
    }
    catch(err){
        res.send(`Hubo un error accediendo a la página: ${err.message}`)
    }
}
adminController.setUser = async (req, res) => {
    try{
        let {admin_name, admin_identifier, admin_career} = req.body
        let newActivitie = new Activitie({
            action: 'ADMIN INICIA SESION',
            autor: ['ADMIN', admin_name, admin_identifier],
            information: ['ADMIN INICIA SESION', admin_name, admin_identifier, admin_career]
        })
        Object.assign(req.session.auth, {admin_name, admin_identifier, admin_career})
        await newActivitie.save()
        res.json({status:true})
    }
    catch(err){
        res.json({status:false, err})
    }
}
adminController.renderActStudentAdmin = async (req, res) => {
    try{
        // let students = await getAllStudents()
        let {admin_name, admin_identifier} = req.session.auth
        if(req.query.s_no_identifier){
            let students = await Student.find({no_identifier:req.query.s_no_identifier})
            if(students.length > 0) {
                res.render('admin/vista_de_admin_act_student', {
                    name: 'ADMIN',
                    title: 'Administración Matriculas',
                    admin_name,
                    admin_identifier,
                    found: true,
                    students
                })
            }
            else {
                res.render('admin/vista_de_admin_act_student', {
                    name: 'ADMIN',
                    title: 'Administración Matriculas',
                    admin_name,
                    admin_identifier,
                    found: false,
                    students
                })
            }
        }
        else {
            res.render('admin/vista_de_admin_act_student', {
                success: 'Busque el estudiante que desea actualizar introduciendo su número de cédula.',
                name: 'ADMIN',
                title: 'Administración Matriculas',
                admin_name,
                admin_identifier,
                found: undefined,
                students: []
            })
        }
    }
    catch(err){
        res.send(`Hubo un error procesando la petición: ${err}, por favor intentelo más tarde.`)
    } 
}
adminController.renderAllEnrollments = async (req, res) => {
    try{
        let {admin_name, admin_identifier} = req.session.auth
        if(req.query.filters){
            let filters = await generateFilters(JSON.parse(req.query.filters))
            let allEnrollments = await EnrollmentStudent.find(filters)
            res.render('admin/vista_de_admin_all_enrollments', {
                name: 'ADMIN',
                title: 'Administración Matriculas',
                admin_name,
                admin_identifier,
                found: allEnrollments.length > 0 ? true : false,
                allEnrollments
            })
        }
        else {
            res.render('admin/vista_de_admin_all_enrollments', {
                name: 'ADMIN',
                title: 'Administración Matriculas',
                admin_name,
                admin_identifier,
                found: undefined,
                allEnrollments: []
            })
        }
    }
    catch(err){
        res.send(`Hubo un error accediendo a la página: ${err.message}`)
    }
}
adminController.renderAllEnrollmentsTitulacion = async (req, res) => {
    try{
        let {admin_name, admin_identifier} = req.session.auth
        if(req.query.filters) {
            let filters = await generateFiltersTitulacion(JSON.parse(req.query.filters))
            let allEnrollments = await TitlePeriodStudent.find(filters)
            res.render('admin/vista_de_admin_all_enrollments_titulacion', {
                name: 'ADMIN',
                title: 'Administración Matriculas',
                admin_name,
                admin_identifier,
                found: allEnrollments.length > 0 ? true : false,
                allEnrollments
            })
        }
        else {
            res.render('admin/vista_de_admin_all_enrollments_titulacion', {
                name: 'ADMIN',
                title: 'Administración Matriculas',
                admin_name,
                admin_identifier,
                found: undefined,
                allEnrollments: []
            })
        }
    }
    catch(err){
        res.send(`Hubo un error accediendo a la página: ${err.message}`)
    }
}
adminController.renderAdminActivies = async (req, res) => {
    try{
        let {admin_name, admin_identifier} = req.session.auth
        if(Object.keys(req.query).length == 0) {
            let activities = await Activitie.find().limit(100).sort('-createdAt')
            let moreActivities = await countDocuments(Activitie, 100)
            res.render('admin/vista_de_admin_activities', {
                name: 'ADMIN',
                title: 'Administración Matriculas',
                admin_name,
                admin_identifier,
                allActivities: activities,
                current: 0,
                more: moreActivities > 0 ? true : false,
                less: false
            })
        }
        else {
            let from = Number(req.query.next)
            let _from = Number(req.query.less)
            if(req.query.next) {
                let activities = await Activitie.find().skip(from + 100).limit(100).sort('-createdAt')
                if(activities.length > 0) {
                    let moreActivities = await countDocuments(Activitie, from + 100)
                    res.render('admin/vista_de_admin_activities', {
                        name: 'ADMIN',
                        title: 'Administración Matriculas',
                        admin_name,
                        admin_identifier,
                        allActivities: activities,
                        current: from + 100,
                        more: moreActivities > 0 ? true : false,
                        less: true
                    })
                }
            }
            else if (req.query.less) {
                let activities = await Activitie.find().skip((_from - 100) < 0 ? 0 : (_from - 100)).limit(100).sort('-createdAt')
                if(activities.length > 0) {
                    let current = (_from - 100) < 0 ? 0 : (_from - 100)
                    res.render('admin/vista_de_admin_activities', {
                        name: 'ADMIN',
                        title: 'Administración Matriculas',
                        admin_name,
                        admin_identifier,
                        allActivities: activities,
                        current,
                        more: true,
                        less: current > 0 ? true : false
                    })
                }
            }
        }
    }
    catch(err){
        res.send(`Hubo un error accediendo a la página: ${err.message}`)
    }
}
adminController.downloadStudentExcel = async (req, res) => {
    try{
        let {id} = req.params,
            {status, message, path} = await makeStudentExcel(id)
            if(!status) throw new Error(message)
            else {
                res.status(200)
                res.download(path, null, () => {
                    deleteTempPath(path)
                })
            } 
    }
    catch(err){
        res.status(500).json({message:err.message})
    }
}
adminController.downloadEnrollmentExcel = async (req, res) => {
    try{
        let {id} = req.params,
            {status, message, path} = await makeEnrollmentExcel(id)
            if(!status) throw new Error(message)
            else {
                res.status(200)
                res.download(path, null, () => {
                    deleteTempPath(path)
                })
            } 
    }
    catch(err){
        res.status(500).json({message:err.message})
    }
}
adminController.downloadEnrollmentExcelTitulacion = async (req, res) => {
    try{
        let {id} = req.params,
            {status, message, path} = await makeEnrollmentExcelTitulacion(id)
            if(!status) throw new Error(message)
            else {
                res.status(200)
                res.download(path, null, () => {
                    deleteTempPath(path)
                })
            } 
    }
    catch(err){
        res.status(500).json({message:err.message})
    }
}
adminController.downloadAllEnrollmentsExcel = async (req, res) => {
    try{
            let {status, message, path} = await makeAllEnrollmentExcel(req.body)
            if(status==false) throw new Error(message)
            else {
                res.status(200)
                res.download(path, null, () => {
                    deleteTempPath(path)
                })
            } 
    }
    catch(err){
        res.status(500).json({message:err.message})
    }
}
adminController.downloadAllEnrollmentsExcelTitulacion = async (req, res) => {
    try{
            let {status, message, path} = await makeAllEnrollmentExcelTitulacion(req.body)
            if(status==false) throw new Error(message)
            else {
                res.status(200)
                res.download(path, null, () => {
                    deleteTempPath(path)
                })
            } 
    }
    catch(err){
        res.status(500).json({message:err.message})
    }
}

module.exports = adminController