var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
const cors = require('cors');
const cookieParser = require("cookie-parser");
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var requisitionRouter = require('./routes/requisitionRouter');
var requisitionItemsRouter = require('./routes/resquisitionItemsRouter');
var requisitionFilesRouter = require( './routes/requisitionFilesRouter');
var patrimonyAccessoryRouter = require('./routes/patrimonyAccessoryRouter');
var productsRouter = require('./routes/productsRouter');
var projectRouter = require('./routes/projectRouter');
var patrimonyRouter = require('./routes/patrimonyRouter');
var itemFileRouter = require('./routes/itemFileRouter');
var movementationRouter = require('./routes/movementationRouter');
var oppoprtunityRouter = require('./routes/OpportunityRouter'); 
var checklistRouter = require('./routes/checkListRouter');
var quoteRouter = require('./routes/quoteRouter');
const authorize = require('./middleware/authentication');
const PatrimonyScheduler  = require('./scheduledScripts/patrimonyScheduler');
const OpportunityScheduler = require('./scheduledScripts/OpportunityScheduler');

var app = express();


app.disable('etag');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(cors());
require("dotenv").config();
app.use(cookieParser());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/requisicoes',  requisitionRouter);
app.use('/requisition/requisitionItems', authorize, requisitionItemsRouter);
app.use('/requisition/quote', authorize, quoteRouter)
app.use('/movementation', authorize, movementationRouter)
app.use("/patrimony", authorize, patrimonyRouter);
app.use('/products', authorize, productsRouter);

app.use('/project', authorize, projectRouter);
app.use('/requisitionFiles', authorize, requisitionFilesRouter);
app.use('/itemFiles', authorize, itemFileRouter);
app.use("/accessory", authorize,  patrimonyAccessoryRouter);
app.use('/checklist', authorize, checklistRouter);

app.use("/oportunidades",  oppoprtunityRouter);

//rotas publicas

app.use("/supplier/requisition/quote", quoteRouter);



app.use(function(req, res, next) {
  next(createError(404));
});
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//  OpportunityScheduler.startExpiredOppsVerification();
//  PatrimonyScheduler.startEmailSchedule();
//  PatrimonyScheduler.startchecklistVerification();

module.exports = app;
