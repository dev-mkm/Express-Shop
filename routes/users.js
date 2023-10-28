var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
let expires = '1800s';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

function generateAccessToken(userid, pass) {
  var data = {'userid': userid, 'pass': pass};
  return jwt.sign(data, process.env.TOKEN_SECRET, { expiresIn: expires });
}

const transporter = nodemailer.createTransport({
  port: 465,               // true for 465, false for other ports
  host: "smtp.gmail.com",
     auth: {
          user: 'youremail@gmail.com',
          pass: 'password',
       },
  secure: true,
});

router.post('/login', async function(req, res, next) {
  const user = await prisma.user.findUnique({where: {email: req.body.email, verify: true}});
  if (!!user) return next(createHttpError(404, "User Not Found"));
  if (user.pass != req.body.pass) return next(createHttpError(403));
  res.json({'token': generateAccessToken(user.id, user.pass), 'expire': expires});
});

router.post('/signup', async function(req, res, next) {
  const check = await prisma.user.findUnique({where: {email: req.body.email}});
  let user = {};
  let verify = Math.floor(Math.random() * 8);
  if(check){
    if (check.verify) return next(createHttpError(409, "User Already Exists"));
    else {user = await prisma.user.update({
      where: {email: req.body.email},
      data: {pass: verify},
    });}
  } else {
    user = await prisma.user.create({
      data: {email: req.body.email, pass: verify},
    });
  }
  const mailData = {from: 'youremail@gmail.com',  // sender address
  to: req.body.email,   // list of receivers
  subject: 'Verify your Email Address',
  text: 'Verification Code',
  html: '<b>'+verify+'</b>'};
  transporter.sendMail(mailData, function (err, info) {
    if(err)
      console.log(err)
    else
      console.log(info);
  });
});

router.get('/verify', async function(req, res, next) {
  const user = await prisma.user.findUnique({where: {id: req.query.id, pass: req.query.token}});
  if (!!user) return next(createHttpError(400, "Invalid Data"));
  const update = await prisma.user.update({
    where: { id: user.id },
    data: { verify: true }
  });
  res.json({'token': generateAccessToken(user.id, user.pass), 'expire': expires});
});

module.exports = router;