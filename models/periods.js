'use strict'
const mongoose = require('./connection'),
    Schema = mongoose.Schema,
    Model = mongoose.model, 
    titlePeriodsSchema = new Schema({
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
            type: Array,
            set: v => v=='0'?[0, 'PRIMER PERIODO DESTINADO A LA TITULACIÓN']:v=='1'?[1, 'PRIMERA PRORROGA']:v=='2'?[2, 'SEGUNDA PRORROGA']:false
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
    TitlePeriod = new Model('titleperiods', titlePeriodsSchema)

module.exports = {
    titlePeriodsSchema,
    TitlePeriod
}