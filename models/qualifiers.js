'use strict'
const mongoose = require('./connection'),
  {
    encrypt
  } = require('./students'),
  bcryptjs = require('bcryptjs'),
  Schema = mongoose.Schema,
  Model = mongoose.model,
  qualifiersSchema = new Schema({
    user: {
      type: String,
      require: true
    },
    password: {
      type: String,
      set: encrypt,
      require: true
    }
  }, {
    versionKey: false,
    autoIndex: true,
    timestamps: true
  }).loadClass(class {
    comparePass(string) {
      return bcryptjs.compareSync(string, this.password)
    }
  }),
  Qualifier = new Model('qualifiers', qualifiersSchema)
  

module.exports = Qualifier