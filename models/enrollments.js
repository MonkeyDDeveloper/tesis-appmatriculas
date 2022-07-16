'use strict'
const mongoose = require('./connection'),
    Schema = mongoose.Schema,
    Model = mongoose.model,
    enrollmentSchema = new Schema({
        published_by: {
            type: [],
            default: ['admin', 'admin']
        },
        start_date: {
            type: String
        },
        title: {
            type: String,
            uppercase: true,
            trim: true
        },
        type: {
            type: String,
            uppercase: true,
            trim: true
        },
        duration: {
            type: String,
            trim: true
        },
        career: {
            type: String,
            trim: true
        },
        period: {
            type: String,
            uppercase: true,
            trim: true
        },
        year: {
            type: String,
            trim: true
        },
        message: {
            type: String,
            uppercase: true,
            trim: true,
            set: v => {
                if (v.length > 140) return v.slice(0, 100)
                else return v
            }
        }
    }, {
        autoIndex: true,
        versionKey: false,
        timestamps: true
    }),
    Enrollment = new Model('enrollments', enrollmentSchema)

module.exports = {
    enrollmentSchema,
    Enrollment
}