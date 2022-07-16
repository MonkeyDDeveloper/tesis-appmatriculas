'use strict'
const mongoose = require('./connection'),
    Schema = mongoose.Schema,
    Model = mongoose.model,
    titlePeriodStudentSchema = new Schema({
        status: {
            type: String,
            default: 'undefined'
        },
        qualified: {
            type: Array,
            default: [false]
        },
        last_modify: {
            type: String
        },
        enrollment_features: {
            type: {} /* enrollmentSchema */
        },
        student: {
            type: Array
        },
        information_per_enroll: {
            type: {}
        },
        message: {
            type: String
        },
        studentData:{
            type: []
        }
    }, {
        autoIndex: true,
        versionKey: false,
        timestamps: true
    }),
    TitlePeriodStudent = new Model('titleperiodstudents', titlePeriodStudentSchema)

module.exports = {
    titlePeriodStudentSchema,
    TitlePeriodStudent
}