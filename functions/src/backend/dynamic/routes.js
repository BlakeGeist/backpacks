'use strict';

const Router = require('koa-router');
const dynamic = new Router();

const proposalDetails = require('./proposal-details');
const productDetails = require('./product-details');
const setCardDetails = require('./set-card-details');
const setDetails = require('./set-details');
const orderDetails = require('./order-details');
const admin = require('./admin-details');

function setup (app, router) {
  app.use(proposalDetails.middleware);
  app.use(setCardDetails.middleware);
  app.use(setDetails.middleware);
  app.use(orderDetails.middleware);
  app.use(productDetails.middleware);
  app.use(admin.middleware);

  dynamic.get('/:R/:L/proposal/:slug/', proposalDetails);
  dynamic.get('/:R/:L/product/:slug/', productDetails);
  dynamic.get('/:R/:L/set/:set/card/:slug', setCardDetails);
  dynamic.get('/:R/:L/set/:slug/', setDetails);
  dynamic.get('/:R/:L/order/:slug/', orderDetails);
  //dynamic.get('/:R/:L/admin/', admin);

  app.use(dynamic.routes());
}

module.exports = setup;
