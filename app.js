const fs = require('fs');
const createError = require('http-errors');
const express = require('express');
const path = require('path');

if (fs.existsSync('.env')) {
  // eslint-disable-next-line global-require
  require('dotenv').config();
}

// launch the server and listen
const app = express();
const port = process.env.APP_PORT;

const indexRouter = require('./routes/index');
const urlRouter = require('./routes/url');
const binaryRouter = require('./routes/binary');

const cors = require('cors');
app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/url', urlRouter);
app.use('/binary', binaryRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(port, function () {
  console.log(`App started, listening on port ${port}`);
  console.log(``);
})

module.exports = app;
