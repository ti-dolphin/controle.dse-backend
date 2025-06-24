var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
const cors = require('cors');
const cookieParser = require("cookie-parser");

// Rotas principais
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

// Entidade: Requisições
var requisitionRouter = require('./routes/requisitionRouter');
var requisitionItemsRouter = require('./routes/resquisitionItemsRouter');
var requisitionKanbanRouter = require('./routes/requisitionKanbanRouter'); 
var requisitionStatusRouter = require('./routes/requisitionStatusRouter');

// Entidade: Anexos
var reqItemFileRouter = require('./routes/reqItemFileRouter');
var requisitionFileRouter = require('./routes/requisitionFileRouter');
var itemFileRouter = require('./routes/itemFileRouter');

// Entidade: Patrimônio
var patrimonyRouter = require('./routes/patrimonyRouter');
var patrimonyAccessoryRouter = require('./routes/patrimonyAccessoryRouter');
var movementationRouter = require('./routes/movementationRouter');
var patrimonyFileRouter = require('./routes/patrimonyFileRouter');
// Entidade: Produtos
var productsRouter = require('./routes/productsRouter');

// Entidade: Projetos
var projectRouter = require('./routes/projectRouter');

// Entidade: Oportunidades
var oppoprtunityRouter = require('./routes/OpportunityRouter');

// Entidade: Checklist
var checklistRouter = require('./routes/checkListRouter');
var itemsChecklistMovimentacaoRouter = require('./routes/itemsCheckListMovimentacaoRouter');
// Entidade: Cotações
var quoteRouter = require('./routes/quoteRouter');
var quoteItemRouter = require("./routes/QuoteItemRouter");
var quoteFileRouter = require("./routes/quoteFIleRouter");
// Middlewares e Schedulers
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

// Rotas principais
app.use('/', indexRouter);
app.use('/users', usersRouter);

// Rotas de Requisições
app.use('/requisicoes', requisitionRouter);
app.use("/item_requisicao", requisitionItemsRouter); // faltando update many, create many, delete many
app.use("/requisicao_kanban", requisitionKanbanRouter);
app.use("/status_requisicao", requisitionStatusRouter); 
// Rotas de Movimentação de Patrimônio

app.use('/movimentacao_patrimonio', movementationRouter);

// Rotas de Patrimônio
app.use("/patrimonios", patrimonyRouter);
app.use("/acessorio_patrimonio", patrimonyAccessoryRouter);

// Rotas de Produtos
app.use('/produtos', productsRouter);

// Rotas de Oportunidades
app.use("/oportunidades", oppoprtunityRouter);

// Rotas de Checklist

app.use("/checklist", checklistRouter);
app.use("/checklist_movimentacao", checklistRouter);
app.use("/item_checklist_movimentacao", itemsChecklistMovimentacaoRouter); // faltando update many, create many, delete many
// Rotas de Projetos
app.use("/projetos", projectRouter);

// Rotas de Cotações
app.use("/cotacoes", quoteRouter);
app.use('/item_cotacao', quoteItemRouter); // faltando update many, create many, delete many

// Rotas de Anexos da requisição
app.use("/anexo_requisicao", requisitionFileRouter); // rota para anexos de requisição
app.use("/anexo_item_requisicao", reqItemFileRouter);
//Rotas de Anexos do Patrimônio
app.use("/anexo_patrimonio", patrimonyFileRouter); // rota para anexos de patrimônio

//Rotas de anexos da Cotação
app.use("/anexo_cotacao", quoteFileRouter); // rota para anexos de itens de cotação
// Tratamento de erros
app.use(function(req, res, next) {
  next(createError(404));
});
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

// Schedulers (descomentando ativa)
// OpportunityScheduler.startExpiredOppsVerification();
// PatrimonyScheduler.startEmailSchedule();
// PatrimonyScheduler.startchecklistVerification();

module.exports = app;
