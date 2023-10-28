var express = require('express');
var router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.post('/', function(req, res, next) {

});

router.post('/addToCart', function(req, res, next) {

});

router.post('/Checkout', function(req, res, next) {

});

module.exports = router;