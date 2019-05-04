'use strict';

const _ = require('lodash');
const admin = require('firebase-admin');
const db = admin.app().firestore();


// const path = require('path');

async function middleware (ctx, next) {

}

setup.middleware = function * (next) {
  const path = _.get(this.state, 'page.path');
  if (!path || path.indexOf('order/') !== 0) return yield next;
  const slug = this.state.relativeUrl.replace('order/', '').replace(/\/.*$/, '');

  var data = {}

  yield db.collection('orders').doc(slug).get()
    .then((res) =>{
      data = res.data();
    })
    .catch((e) => {
      console.log('error' + e)
    });

  this.state.firePageData = data;


  this.body = yield this.renderTemplate('dynamic:order');
  this.type = 'text/html';
};

function setup (app, router) {
  return async function (ctx, next) {
    app.use(middleware);

  }
}

module.exports = setup;
