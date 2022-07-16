'use strict'
const mongoose = require('./connection'),
    Schema = mongoose.Schema,
    Model = mongoose.model,
    activitiesSchema = new Schema({
        action: {
            type: String
        },
        autor: {
            type: []
        },
        information: {
            type: []
        }
    }, {
        autoIndex: true,
        versionKey: false,
        timestamps: true
    }),
    Activitie = new Model('activities', activitiesSchema)

module.exports = {
    activitiesSchema,
    Activitie
}