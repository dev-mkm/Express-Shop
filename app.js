var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

var users = require('./routes/users');
var account = require('./routes/account');
var cart = require('./routes/cart');
var Products = require('./routes/products');

var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

function Auth(req, res) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) return next(createError(401));

  jwt.verify(token, process.env.TOKEN_SECRET, async(err, data) => {
    console.log(err)

    if (err) return next(createError(403));

    const user = await prisma.user.findUnique({where: {id: data.userid, pass: data.pass, verify: true}});
    if (!!user) return next(createError(403));
    req.user = user

    next()
  })
}

cart.use(Auth);
account.use(Auth);
app.use('/', account);
app.use('/cart', cart);
app.use('/', users);
app.use('/', Products);

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

module.exports = app;
