'use strict'
const mongoose = require('./connection'),
    {
        enrollmentSchema
    } = require('./enrollments'),
    bcrypt = require('bcryptjs'),
    Schema = mongoose.Schema

function encrypt(string) {
    let salt = bcrypt.genSaltSync(10)
    let hash = bcrypt.hashSync(string, salt)
    return hash
}

const studentSchema = new Schema({
        confidentiality: {
            type: Boolean
        },
        upload_doc: {
            type: Boolean,
            default: false
        },
        first_name: {
            type: String,
            trim: true,
            uppercase: true
        },
        second_name: {
            type: String,
            trim: true,
            uppercase: true,
            default: 'NA',
            set: v => v.length > 0 ? v : 'NA'
        },
        first_lastname: {
            type: String,
            trim: true,
            uppercase: true
        },
        second_lastname: {
            type: String,
            trim: true,
            uppercase: true,
            default: 'NA',
            set: v => v.length > 0 ? v : 'NA'
        },
        birth_date: {
            type: String,
            trim: true,
            set: v => /[0-9]{4}-[0-9]{2}-[0-9]{2}/.exec(v)[0]
        },
        sex: {
            type: Boolean,
            set: v => (v == 'hombre' || v == 'true') ? true : false
        },
        gender: {
            type: Boolean
        },
        marital_status: {
            type: String,
            default: 'undefined',
            uppercase: true,
            trim: true
        },
        ethnicity: {
            type: String,
            default: 'UNDEFINED',
            uppercase: true,
            trim: true
        },
        village: {
            type: String,
            default: 'NO APLICA',
            uppercase: true,
            trim: true
        },
        blood_type: {
            type: String,
            default: 'UNDEFINED',
            uppercase: true,
            trim: true
        },
        disability: {
            type: Boolean
        },
        disability_type: {
            type: String,
            default: 'NO APLICA',
            uppercase: true,
            trim: true
        },
        disability_percentage: {
            type: String,
            default: 'NO APLICA',
            uppercase: true,
            trim: true
        },
        conadis_msp: {
            type: String,
            default: 'NO APLICA',
            uppercase: true,
            trim: true
        },
        nationality: {
            type: String,
            default: 'UNDEFINED',
            uppercase: true,
            trim: true
        },
        province_birth: {
            type: String,
            default: 'NO APLICA',
            uppercase: true,
            trim: true
        },
        canton_birth: {
            type: String,
            default: 'NO APLICA',
            uppercase: true,
            trim: true
        },
        country_residence: {
            type: String,
            default: 'ECUADOR',
            set: () => 'ECUADOR',
            uppercase: true,
            trim: true
        },
        province_residence: {
            type: String,
            default: 'UNDEFINED',
            uppercase: true,
            trim: true
        },
        canton_residence: {
            type: String,
            default: 'UNDEFINED',
            uppercase: true,
            trim: true
        },
        type_school: {
            type: String,
            default: 'UNDEFINED',
            uppercase: true,
            trim: true
        },
        father_level: {
            type: String,
            default: 'UNDEFINED',
            uppercase: true,
            trim: true
        },
        mother_level: {
            type: String,
            default: 'UNDEFINED',
            uppercase: true,
            trim: true
        },
        household_income: {
            type: String,
            default: 'UNDEFINED',
            uppercase: true,
            trim: true
        },
        ancestral_language: {
            type: String,
            default: 'NO APLICA',
            uppercase: true,
            trim: true
        },
        migratory_category: {
            type: String,
            default: 'NO APLICA',
            uppercase: true,
            trim: true
        },
        identifier: {
            type: String,
            uppercase: true
        },
        no_identifier: {
            type: String,
            unique: true,
            uppercase: true,
            trim: true
        },
        email: {
            type: String,
            unique: true,
            trim: true
        },
        no_celular: {
            type: String,
            trim: true,

        },
        no_telf: {
            type: String,
            trim: true,
            default: '999999',
            set: v => /^([0-9]{6}|[0-9]{9})/.test(v) ? v : '999999'
        },
        updated: {
            type: Boolean,
            default: false
        },
        modality: {
            type: String,
            default: 'DUAL'
        },
        work_day: {
            type: String,
            default: 'undefined',
            uppercase: true
        },
        subjects_repeated: {
            type: Boolean,
            default: false
        },
        direction: {
            type: Array,
            default: [-76.88 + (Math.random() * 0.2 - 0.1), 0.083 - (Math.random() * 0.02 - 0.01)]
        },
        career_start: {
            type: String,
            default: 'undefined'
        },
        level: {
            type: String,
            default: '1'
        },
        gratuity: {
            type: Boolean,
            default: true
        },
        new_student: {
            type: Boolean,
            default: true
        },
        drags: {
            type: Boolean,
            default: false
        },
        number_enrollments: {
            type: Number,
            default: Number(0)
        },
        enroll_active: {
            type: Boolean,
            default: false,
        },
        differentiated_pension: {
            type: String,
            default: 'undefined',
        },
        student_occupation: {
            type: String,
            default: 'undefined',
            uppercase: true
        },
        student_income: {
            type: String,
            default: 'undefined',
            uppercase: true
        },
        development_bonus: {
            type: String,
            default: 'undefined',
        },
        type_scholarship: {
            type: String,
            default: 'undefined',
            uppercase: true
        },
        scholarship_reason: {
            type: String,
            default: 'undefined',
            uppercase: true
        },
        scholarship_amount: {
            type: String,
            default: 'undefined',
            uppercase: true
        },
        tariff_coverage: {
            type: String,
            default: 'undefined',
            uppercase: true
        },
        maintenance_coverage: {
            type: String,
            default: 'undefined',
            uppercase: true
        },
        scholarship_funding: {
            type: String,
            default: 'undefined',
            uppercase: true
        },
        educative_credit: {
            type: String,
            default: 'undefined',
        },
        members_family: {
            type: String,
            default: 'undefined',
            uppercase: true
        },
        economic_aid: {
            type: String,
            default: 'undefined',
            uppercase: true
        },
        parallel: {
            type: String,
            default: 'undefined',
            uppercase: true
        },
        emergency_contact: {
            type: String,
            default: 'undefined',
            uppercase: true
        },
        no_emergency_contact:{
            type: String,
            default: 'undefined',
            uppercase: true
        },
        higher_degree: {
            type: String,
            default: 'undefined',
        },
        career: {
            type: String,
            trim: true,
            uppercase: true
        },
        subjects: {
            type: []
        },
        enrollment: {
            type: [{}],
            default: []
        },
        periods: {
            type: [{}],
            default: [{qualified:[false], enrollment_features:{type:[0.1]}}]
        },
        password: {
            type: String,
            require: true,
            trim: true,
            set: encrypt
        },
        title_name: {
            type: String,
            default: 'undefined',
            uppercase: true
        }
    }, {
        versionKey: false,
        timestamps: true,
        autoIndex: true
    }).loadClass(class {
        comparePassword(password) {
            return bcrypt.compareSync(password, this.password)
        }
        get getFullName() {
            return [this.first_name, this.second_name, this.first_lastname, this.second_lastname]
        }
        get getName() {
            return `${this.first_name} ${this.first_lastname}`
        }
    }),
    Student = mongoose.model('students', studentSchema)

module.exports = {
    Student,
    encrypt,
    studentSchema
}