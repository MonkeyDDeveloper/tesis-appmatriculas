'use strict' 
const express = require('express'),
  override = require('method-override'),
  morgan = require('morgan'),
  path = require('path'),
  favicon = require('serve-favicon'),
  session = require('express-session'),
  flash = require('connect-flash'),
  {
    encrypt 
  } = require('./models/students'),
  cors = require('cors'),
  router_public = require('./routers/public.routes'),
  router_students = require('./routers/students.routes'),
  router_qualifiers = require('./routers/qualifiers.routes'),
  router_admin = require('./routers/admin.routes'),
  icono = path.join(__dirname, 'public', 'images', 'icono_ispedib.ico'),
  views = path.join(__dirname, 'views'),
  files_public = express.static(path.join(__dirname, 'public')), 
  urlBody = express.urlencoded({
    extended: true,
    limit: '25mb'
  }),
  configSession = {
    secret: encrypt('ispedib_secret'),
    resave: true,
    saveUninitialized: false
  },
  app = express()

//Database Events
require('./models/connection_events')

//MyMiddlewares
function flashMessages(req, res, next) {
  res.locals.success = req.flash('success')[0]
  res.locals.error = req.flash('error')[0]
  res.locals.session_error = req.flash('session_error')[0]
  next()
}
//Settings 
app
  .set('view engine', 'pug')
  .set('views', views)
//Middlewares
app
  .use(cors())
  .use(favicon(icono))
  .use(files_public)
  .use(override('_method'))
  .use(session(configSession))
  .use(flash())
  .use(flashMessages)
  .use(morgan('dev'))
  .use(urlBody)
  .use(express.json({limit:'25mb'}))
  .use(router_public)
  .use(router_students)
  .use(router_qualifiers)
  .use(router_admin)

module.exports = app