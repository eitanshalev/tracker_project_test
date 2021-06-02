var createError = require('http-errors');
var express = require('express');
var path = require('path');
var fs = require('fs')

var logger2 = require('./logger');
const bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

const session = require('express-session');

var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret:"somesecretkey",

  resave: false, // Force save of session for each request
  saveUninitialized: true, // Save a session that is new, but has not been modified
  //cookie: {maxAge: 10*60*1000 } // milliseconds!
}));
app.use('/', indexRouter);
app.use('/users', usersRouter);



const port = process.env.PORT || 3000;



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })

app.use(logger('combined', { stream: accessLogStream }))

//exit prog and logger!
// process.on("uncaughtException", (err)=>{
//   console.log(err)
// })

logger2('test  09-04-2021');

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
  logger2(err.message);

});


module.exports = app;
