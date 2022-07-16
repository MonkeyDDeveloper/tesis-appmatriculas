const mongoose = require('./connection'),
    {
        encrypt
    } = require('./students'),
    bcryptjs = require('bcryptjs'),
    Schema = mongoose.Schema,
    Model = mongoose.model,
    adminSchema = new Schema({
        user: {
            type: String,
        },
        password: {
            type: String,
            set: encrypt
        }
    }, {
        autoIndex: true,
        timestamps: true,
        versionKey: false
    }).loadClass(class {

        comparePass(string) {
            return bcryptjs.compareSync(string, this.password)
        }
    }),
    Admin = new Model('admins', adminSchema)

    

module.exports = Admin