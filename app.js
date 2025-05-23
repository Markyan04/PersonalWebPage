import createError from 'http-errors';
import express from 'express';
import favicon from 'serve-favicon';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import http from 'http';
import { init } from './sockets.js';
import ejs from 'ejs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

import indexRouter from './routes/intro.js';
import aboutRouter from './routes/about.js';
import quizRouter from './routes/quiz.js';
import hallRouter from './routes/hall.js';
import loginRouter from './routes/login.js';

const app = express();
const server = http.createServer(app);
init(server);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', ejs.renderFile);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/about', aboutRouter);
app.use('/quiz', quizRouter);
app.use('/login', loginRouter);
app.use('/hall', hallRouter);

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

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

export { app, server };