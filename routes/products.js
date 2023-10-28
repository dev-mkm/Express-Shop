var express = require('express');
var router = express.Router();
const { PrismaClient } = require('@prisma/client');
const createHttpError = require('http-errors');
const prisma = new PrismaClient();

router.get('/', async function(req, res) {
  var page = 0;
  var acs = 'desc';
  var sort = null;
  if(req.query?.page) {
    page = req.query.page
  }
  if(req.query?.sort) {
    sort = req.query.sort
  }
  if(req.query?.acs) {
    acs = req.query.acs
  }
  var order = {};
  switch (sort) {
    case 'name':
      order = {name: acs};
      break;
    
    case 'price':
      order = {price: acs};
      break;
  
    default:
      order = {name: 'desc'};
      break;
  }
  const result = await prisma.product.findMany({include: {sales: false, cat: true}, orderBy: order, take: 25, skip: page * 25});
  res.json(result);
});

router.get('/search/:query', async function (req, res) {
  var page = 0;
  if(req.query?.page) {
    page = req.query.page
  }
  const result = await prisma.product.findMany({where: {name: {search: req.params.query}},include: {sales: false, cat: true}, take: 25, skip: page * 25});
  res.json(result);
});

router.get('/product/:id', async function (req, res, next) {
  const result = await prisma.product.findUnique({where: {id: req.params.id}, include: {sales: false, cat: true}});
  if(!!result) return next(createHttpError(404, "Product not found"));
  res.json(result);
});

router.get('/:cat', async function (req, res, next) {
  const ccat = await prisma.category.findUnique({where: {name: req.params.cat}});
  if(!!ccat) return next(createHttpError(404, "Category not found"));
  var page = 0;
  var acs = 'desc';
  var sort = null;
  if(req.query?.page) {
    page = req.query.page
  }
  if(req.query?.sort) {
    sort = req.query.sort
  }
  if(req.query?.acs) {
    acs = req.query.acs
  }
  var order = {};
  switch (sort) {
    case 'name':
      order = {name: acs};
      break;
    
    case 'price':
      order = {price: acs};
      break;
  
    default:
      order = {name: 'desc'};
      break;
  }
  const result = prisma.product.findMany({include: {sales: false, cat: true}, orderBy: order, take: 25, skip: page * 25, where: {cat: {name: req.params.cat}}});
  res.json(result);
});

module.exports = router;
