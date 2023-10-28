var express = require('express');
var router = express.Router();
const { PrismaClient } = require('@prisma/client');
const createHttpError = require('http-errors');
const prisma = new PrismaClient();

router.post('/update', async function(req, res, next) {
  let request = {};
  if(req.body?.pass) {
    if (req.body.pass != req.user.pass) request.pass = req.body.pass
  }
  if(req.query?.name) {
    if (req.body.name != req.user.name) request.name = req.body.name
  }
  if(!!request) next(createHttpError(400, 'No changes made'));
  const update = await prisma.user.update({
    where: { id: req.user.id },
    data: request
  });
  next(createHttpError(200, 'Updated'));
});

module.exports = router;