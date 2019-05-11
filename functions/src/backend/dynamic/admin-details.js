'use strict';

const _ = require('lodash');
const admin = require('firebase-admin');
const db = admin.app().firestore();


// const path = require('path');

async function middleware (ctx, next) {

}

setup.middleware = function * (next) {
  return yield next;
};

function setup (app, router) {
  return async function (ctx, next) {
    app.use(middleware);
  }
}

module.exports = setup;
