'use strict'
const mongoose = require('./connection'),
    Schema = mongoose.Schema,
    Model = mongoose.model,
    enrollmentStudentSchema = new Schema({
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
        request_subjects: {
            type: []
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
    EnrollmentStudent = new Model('enrollmentStudents', enrollmentStudentSchema)

module.exports = {
    enrollmentStudentSchema,
    EnrollmentStudent
}