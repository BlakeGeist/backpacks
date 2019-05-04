const functions = require('firebase-functions');
const firebase = require('firebase');
const admin = require('firebase-admin');
const serviceAccount = require('./backpacks-5bda5-firebase-adminsdk-2pu4h-8cb6c1981b.json');
const mtg = require('mtgsdk')

var languages = [
  'ar','da','de','es','ja','fr','it','ko','pt','ru'
]

const cors = require('cors')({
  origin: true
});

const _ = require('lodash');

const koa = require('koa');
const Router = require('koa-router');

const app = new koa();
const router = new Router();       // will be passed to components
app.component = n => component(n); // shortcut
const buildSettings = require('./src/backend/lib/build-settings');
const configs = require('./configs.json');
var rp = require('request-promise');

function component (name) {
  const _module = require('./src/backend/' + name);
  _module(app, router, configs);
  return app;
}

(app                             // App Configuration:
  .use(buildSettings)            // production build settings
  .component('sys/init')         // set up whitelabel & paths & initial this.state stuff
  .component('sys/render')       // adds this.renderTemplate()
  .component('sys/errors')       // error handling routes
  .component('sys/assets')       // everything in the root /assets folder. this comes first because speed.
  .component('sys/page-info')    // adds asset and page config data to this.state
  //.component('sys/data')         // sets up this.fetch() as an interface to api
  .component('sys/page-data')    // fetches data from api for content/dynamic pages
  .component('sys/etag')         // handles etags for everything other than page.js and page template renders
  .component('sys/slash')        // redirect page to page/
  .component('sys/main-css')     // compiles main.less to main.css
  .component('pages/scripts')    // javascript for both content and dynamic pages
  //.component('sys/healthcheck')  // health-check script
  .component('sys/scripts')      // renders <script> tags into dom
  .component('pages/css')        // css for both content and dynamic pages
  .component('sys/handlebars')   // sets up handlebars for node and browser
  .component('dynamic/routes')   // routes for specific dynamic pages
  .component('pages/handlebars') // renders content/dynamic pages that don't get handled by dynamic/routes
  //.component('pages/static')     // serves page-specific static assets
  .use(router.routes())          // enable the router after all other middlewares have run
  .use(router.allowedMethods())
);

const database = admin.database();
var adminFirestore = admin.app().firestore();

exports.api = functions.https.onRequest(app.callback());

exports.createCollectionObject = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    var collection = req.query.collection;
    var data = req.query.data;
    data.createdAt = new Date();
    const db = admin.app().firestore();

    db.collection(collection).add(data)
      .then(function(doc){
        //send the newly created orderId to the initStripeCheckout function
        res.status(200).send({text: doc.data});
      })
      .catch(function(e){
        console.log('error' + e);
      });
  });
});

exports.handleStripePaymentResponse = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    console.log(req.query)
    var orderId = req.query.orderId;
    var success = req.query.success;
    var location = req.query.location;
    var today = new Date();
    var payload = {
      successfullyCheckedOutViaStripe: success,
      successfullyCheckedOutViaStripeDate: today
    };
    const db = admin.app().firestore();
    db.collection('orders').doc(orderId).update(payload)
      .then((response) =>{
        if(location == 'localhost'){
          res.redirect('//localhost:5000/us/en/order/'+orderId+'/')
        } else {
          res.redirect('//backpack-outfitter.com/us/en/order/'+orderId+'/')
        }
      })
      .catch((e) => {
        console.log('error ' + e);
      });
  });
});

exports.createProductInStripe = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    console.log(req.query)
    var item_name = req.query.item_name;
    var image_file = req.query.image_file;
    var description = req.query.description;
    var price = req.query.price * 100;
    var qty_avail = req.query.qty_avail;
    const stripe = require("stripe")("sk_test_j33B4yA4TNEQlBW2gkaFJePF");

    const product = await stripe.products.create({
      name: item_name,
      type: 'good',
      shippable: true,
      images: [image_file],
      attributes: ["name"],
      description: description
    });
  });
});

exports.createSKUInStripeProduct = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const db = admin.app().firestore();
    var item_name = req.query.item_name;
    var image_file = req.query.image_file;
    var description = req.query.description;
    var price = req.query.price * 100;
    var qty_avail = req.query.qty_avail;
    const stripe = require("stripe")("sk_test_j33B4yA4TNEQlBW2gkaFJePF");
    var target = req.query.target;
    var stripeTarget = req.query.stripeTarget;

    const sku1 = await stripe.skus.create({
      product: 'prod_EzViB6ggGbiAly',
      currency: 'usd',
      price: price,
      inventory: {'type': 'infinite'},
      attributes: {
        'name': item_name
      },
      image: image_file
    });

    var payload = {
      stripeSKU: sku1.id
    }

    console.log(sku1);

    db.collection('products').doc(target).update(payload)

  });
});


//strings functions
const stringsModule = require('./strings');
exports.createString = functions.https.onRequest((req, res) => {
  stringsModule.handler(req, res);
});

//strings functions
const productStrings = require('./productStrings');
exports.createProductString = functions.https.onRequest((req, res) => {
  productStrings.handler(req, res);
});

function convertToSlug(text){
  return text
      .toLowerCase()
      .replace(/[^\w ]+/g,'')
      .replace(/ +/g,'-')
      ;
}
