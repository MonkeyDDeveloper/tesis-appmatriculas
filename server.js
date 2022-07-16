'use strict'
const app = require('./app'),
  server = require('http').createServer(app),
  io = require('socket.io')(server),
  {
    getEnrollmentByCi,
    saveNewEnrollment,
    deleteEnrollment,
    lookForStudentEnrollment,
    removeStudentEnrollmentByStudent,
    removeStudentTitlePeriodByStudent,
    lookInReviewing,
    updateEnrollment,
    updateStudent,
    updateStudentTitle,
    updateStudentData,
    studentUpdateStudent,
    deleteStudent,
    deleteStudentEnrollment,
    deleteStudentEnrollmentTitle,
    saveNewTitlePeriod,
    deleteTitlePeriod,
    updateEnrollmenTitle
  } = require('./controllers/events_controller'),
  port = process.env.PORT || 3000

var qualifiersWorking = {},
  qualifiersConnected = [],
  adminsWorking = {},
  adminsConnected = []

io.on('connection', socket => {
  console.log(`SOCKET.IO CONECTADO`)

  if (socket.handshake.auth.type == 'Q') {
    if (qualifiersConnected.some(v => v == socket.handshake.auth.identifier)) {
      socket.emit('noValidPass')
    } else qualifiersConnected.push(socket.handshake.auth.identifier)
  }
  if (socket.handshake.auth.type == 'A') {
    if (adminsConnected.some(v => v == socket.handshake.auth.user[0])) {
      socket.emit('noValidPass')
    } else adminsConnected.push(socket.handshake.auth.user[0])
  }

  socket.on('disconnect', () => {
    if (socket.handshake.auth.type == 'Q') {
      let identifier = `${socket.handshake.auth.identifier}`
      qualifiersConnected = qualifiersConnected.filter(v => v != identifier)
      delete qualifiersWorking[identifier]
    }
    if (socket.handshake.auth.type == 'A') {
      let identifier = socket.handshake.auth.user[0]
      adminsConnected = adminsConnected.filter(v => v != identifier)
      delete adminsWorking[identifier]
    }
  })



  // ESTUDIANTES

  socket.on('searchErollmentForStudent', async data => {
    try {
      await lookForStudentEnrollment(data)
      let existEnrollment = await getEnrollmentByCi(data.ci)
      if (!existEnrollment.exist) socket.emit('no_enrollment', existEnrollment.message)
      else {
        let {
          student,
          enrollment,
          subjectsInformation
        } = existEnrollment
        socket.emit('searchErollmentForStudent_success', {
          student,
          enrollment,
          subjectsInformation
        })
      }
    } catch (err) {
      socket.emit('event_error', err.err_message)
    }
  })

  socket.on('studentActData', async newStudentData => {
    try {
      let res = await studentUpdateStudent(newStudentData)
      socket.emit('studentActData_success', res.message)
    } catch (err) {
      socket.emit('studentActData_error', err.err_message)
    }
  })

  socket.on('cancelStudentEnrollment', async enroll_data => {
    try {
      let {
        message,
        _id
      } = await removeStudentEnrollmentByStudent(enroll_data)
      socket.emit('cancelStudentEnrollment_success', {
        message,
        _id
      })
      socket.broadcast.emit('student_cancel_enrollment', enroll_data.enrollId)
    } catch (err) {
      socket.emit('cancelStudentEnrollment_error', err.err_message)
    }
  }) 

  socket.on('cancelStudentTitlePeriodEnrollment', async enroll_data => {
    try {
      let {
        message,
        _id
      } = await removeStudentTitlePeriodByStudent(enroll_data)
      socket.emit('cancelStudentTitlePeriodEnrollment_success', {
        message,
        _id
      })
      socket.broadcast.emit('student_cancel_enrollment', enroll_data.enrollId)
    } catch (err) {
      socket.emit('cancelStudentTitlePeriodEnrollment_error', err.err_message)
    }
  })

  socket.on('enrollmentStudentInReviewS', async ids_array => {
    try {
      let {
        coincidences
      } = await lookInReviewing(qualifiersWorking, ids_array)
      socket.emit('enrollmentInReviewS', coincidences)
    } catch (err) {
      socket.emit('error_in_server', err.message)
    }
  })

  //



  // ADMIN

  socket.on('enrollmentStudentInReviewA', async ids_array => {
    try {
      let {
        coincidences
      } = await lookInReviewing(adminsWorking, ids_array)
      socket.emit('enrollmentInReviewA', coincidences)
    } catch (err) {
      socket.emit('error_in_server', err.message)
    }
  })

  socket.on('saveNewEnrollment', async enrollmentData => {
    try {
      await saveNewEnrollment(enrollmentData)
      io.emit('save_success')
    } catch (err) {
      socket.emit('save_failure', err.err_message)
    }
  })

  socket.on('saveNewTitlePeriod', async titlePeriodData => {
    try {
      await saveNewTitlePeriod(titlePeriodData)
      io.emit('save_title_success')
    } catch (err) {
      socket.emit('save_title_error', err.err_message)
    }
  })

  socket.on('deleteEnrollment', async data => {
    try {
      let deleted = await deleteEnrollment(data)
      io.emit('delete_success', deleted.id)
    } catch (err) {
      socket.emit('delete_error', err.err_message)
    }
  })

  socket.on('delete_title_period', async data => {
    try {
      let {id} = await deleteTitlePeriod(data)
      io.emit('delete_title_success', id)
    } catch (err) {
      socket.emit('delete_title_error', err.err_message)
    }
  })

  socket.on('adminWorking', async data_admin => {
    try {
      let {
        enrollment_id,
        admin_identifier
      } = data_admin
      adminsWorking[admin_identifier] = [enrollment_id]
      socket.broadcast.emit('enrollmentInReviewA', [enrollment_id])
    } catch (err) {
      socket.emit('error_in_server', err.message)
    }
  })

  socket.on('stopWatchingAdmin', ci => {
    try {
      delete adminsWorking[ci]
    } catch (err) {
      socket.emit('error_in_server', err.message)
    }
  })

  socket.on('admin_qualifies', async data => {
    try {
      let enroll_id = await updateStudent(data)
      socket.emit('admin_qualifies_success', enroll_id)
      socket.broadcast.emit('enroll_qualified', enroll_id)
    } catch (err) {
      socket.emit('admin_qualifies_error', err.message)
    }
  })

  socket.on('admin_qualifies_title', async data => {
    try {
      let enroll_id = await updateStudentTitle(data)
      socket.emit('admin_qualifies_title_success', enroll_id)
      socket.broadcast.emit('enroll_qualified_title', enroll_id)
    } catch (err) {
      socket.emit('admin_qualifies_title_error', err.message)
    }
  })

  socket.on('admin_act_student', async formData => {
    try {
      let resp = await updateStudentData(formData, socket.handshake.auth.user[1])
      socket.emit('admin_act_student_success', resp)
    } catch (err) {
      socket.emit('server_error', err.message)
    }
  })

  socket.on('admin_delete_student', async student_id => {
    try {
      let {
        _id
      } = await deleteStudent(student_id, socket.handshake.auth.user[1])
      socket.emit('admin_delete_student_success', _id)
    } catch (err) {
      socket.emit('admin_delete_student_error', err.message)
    }
  })

  socket.on('delete_enrollment_admin', async enrollment_id => {
    try {
      await deleteStudentEnrollment(enrollment_id, socket.handshake.auth.user[1])
      socket.emit('delete_enrollment_admin_success')
    } catch (err) {
      socket.emit('delete_enrollment_admin_error', err.message)
    }
  })

  socket.on('delete_enrollment_admin_title', async enrollment_id => {
    try {
      await deleteStudentEnrollmentTitle(enrollment_id, socket.handshake.auth.user[1])
      socket.emit('delete_enrollment_admin_title_success')
    } catch (err) {
      socket.emit('delete_enrollment_admin_title_error', err.message)
    }
  })

  // CALIFIADORES

  socket.on('qualifierWorking', async data_qualifier => {
    try {
      let {
        enrollment_id,
        qualifier_identifier
      } = data_qualifier
      qualifiersWorking[qualifier_identifier] = [enrollment_id]
      socket.broadcast.emit('enrollmentInReview', [enrollment_id])
      socket.broadcast.emit('enrollmentInReviewS', [enrollment_id])
    } catch (err) {
      socket.emit('error_in_server', err.message)
    }
  })

  socket.on('enrollmentStudentInReview', async ids_array => {
    try {
      let {
        coincidences 
      } = await lookInReviewing(qualifiersWorking, ids_array)
      socket.emit('enrollmentInReview', coincidences)
    } catch (err) {
      socket.emit('error_in_server', err.message)
    }
  })


  socket.on('stopWatchingQualifier', ci => {
    try {
      delete qualifiersWorking[ci]
    } catch (err) {
      socket.emit('error_in_server', err.message)
    }
  })

  socket.on('accept_enrollment', async data => {
    try {
      let mesg = await updateEnrollment(data, 'true')
      io.emit('enroll_cheked', data._id)
      socket.emit('checked_sucess', mesg)
    } catch (err) {
      socket.emit('err_modify', err.message)
    }
  })

  socket.on('deny_enrollment', async data => {
    try {
      let mesg = await updateEnrollment(data, 'false')
      io.emit('enroll_cheked', data._id)
      socket.emit('checked_sucess', mesg)
    } catch (err) {
      socket.emit('err_modify', err.message)
    }
  })

  socket.on('accept_enrollment_title', async data => {
    try {
      let mesg = await updateEnrollmenTitle(data, 'true')
      io.emit('enroll_cheked_title', data._id)
      socket.emit('checked_sucess', mesg)
    } catch (err) {
      socket.emit('err_modify', err.message)
    }
  })

  socket.on('deny_enrollment_title', async data => {
    try {
      let mesg = await updateEnrollmenTitle(data, 'false')
      io.emit('enroll_cheked_title', data._id)
      socket.emit('checked_sucess', mesg)
    } catch (err) {
      socket.emit('err_modify', err.message)
    }
  })

  //


  // TEST

  //
})

server.listen(port, () => console.log('Server running on port %d', port))
