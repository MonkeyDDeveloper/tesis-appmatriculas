'use strict'
const mongoose = require('./connection'),
    {
        mecSubjects,
        diSubjects,
        mecaSubjects,
        moniSubjects,
        autoSubjects,
        rieSubjects,
        solSubjects
    } = require('../allsubjects/allsubjects'),
    Schema = mongoose.Schema,
    Model = mongoose.model,
    subjectSchema = new Schema({
        active: {
            type: Boolean,
            default: false
        },
        no: {
            type: String
        },
        name: {
            type: String,
            uppercase: true
        },
        level: {
            type: String
        },
        weekly_hours: {
            type: String
        },
        status: {
            type: Boolean,
        },
        enrollment: {
            type: String
        },
        ref: {
            type: [],
            default: []
        },
        next: {
            type: [Number]
        },
        ancl: {
            type: String
        },
        last_modify: {
            type: [],
            default: ['admin', 'admin']
        }
    }, {
        autoIndex: true,
        timestamps: true,
        versionKey: false
    }),
    mecaModel = new Model('mecasubjects', subjectSchema),
    autoModel = new Model('autosubjects', subjectSchema),
    diModel = new Model('disubjects', subjectSchema),
    mecModel = new Model('mecsubjects', subjectSchema),
    moniModel = new Model('monisubjects', subjectSchema),
    rieModel = new Model('riesubjects', subjectSchema),
    solModel = new Model('solsubjects', subjectSchema)

// function makeSubject(no, name, level, weekly_hours, next, ref, ancl) {
//     return new Promise((res, rej) => {
//         res({
//             no,
//             name,
//             level,
//             weekly_hours,
//             ref,
//             next,
//             ancl,
//             status: false,
//             enrollment: '1',
//             last_modify: ['undefined', 'undefined']
//         })
//     })
// }

// async function saveDiSubjects(subjects) {
//     try {
//         for(let sub of subjects){
//             let newSub = await makeSubject(sub.no, sub.name, sub.level, sub.weekly_hours, sub.next, sub.ref)
//             let subject = new diModel(newSub)
//             await subject.save()
//         }
//     } catch (err) {
//         console.log(err)
//     }
// }

// async function saveMecSubjects(subjects) {
//     try {
//         for(let sub of subjects){
//             let newSub = await makeSubject(sub.no, sub.name, sub.level, sub.weekly_hours, sub.next, sub.ref)
//             let subject = new mecModel(newSub)
//             await subject.save()
//         }
//     } catch (err) {
//         console.log(err)
//     }
// }

// async function saveMecaSubjects(subjects) {
//     try {
//         for(let sub of subjects){
//             let newSub = await makeSubject(sub.no, sub.name, sub.level, sub.weekly_hours, sub.next, sub.ref)
//             let subject = new mecaModel(newSub)
//             await subject.save()
//         }
//     } catch (err) {
//         console.log(err)
//     }
// }

// async function saveMoniSubjects(subjects) {
//     try {
//         for(let sub of subjects){
//             let newSub = await makeSubject(sub.no, sub.name, sub.level, sub.weekly_hours, sub.next, sub.ref)
//             let subject = new moniModel(newSub)
//             await subject.save()
//         }
//     } catch (err) {
//         console.log(err)
//     }
// }

// async function saveAutoSubjects(subjects) {
//     try {
//         for(let sub of subjects){
//             let newSub = await makeSubject(sub.no, sub.name, sub.level, sub.weekly_hours, sub.next, sub.ref, sub.ancl)
//             let subject = new autoModel(newSub)
//             await subject.save()
//         }
//     } catch (err) {
//         console.log(err)
//     }
// }

// async function saveRieSubjects(subjects) {
//     try {
//         for(let sub of subjects){
//             let newSub = await makeSubject(sub.no, sub.name, sub.level, sub.weekly_hours, sub.next, sub.ref, sub.ancl)
//             let subject = new rieModel(newSub)
//             await subject.save()
//         }
//     } catch (err) {
//         console.log(err)
//     }
// }

// async function saveSolSubjects(subjects) {
//     try {
//         for(let sub of subjects){
//             let newSub = await makeSubject(sub.no, sub.name, sub.level, sub.weekly_hours, sub.next, sub.ref, sub.ancl)
//             let subject = new solModel(newSub)
//             await subject.save()
//         }
//     } catch (err) {
//         console.log(err)
//     }
// }

// saveMecSubjects(mecSubjects)
// saveDiSubjects(diSubjects)
// saveMecaSubjects(mecaSubjects)
// saveMoniSubjects(moniSubjects)
// saveAutoSubjects(autoSubjects)
// saveRieSubjects(rieSubjects)
// saveSolSubjects(solSubjects)

module.exports = {
    mecaModel,
    autoModel,
    diModel,
    mecModel,
    moniModel,
    rieModel,
    solModel
}