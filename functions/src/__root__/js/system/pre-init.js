/* global site */
(function (html, window, search, hash, get, high, low, auth, token, htoken) {
  'use strict';

  var mod = function (action, arg) { html.className = html.className.split(' ')[action](arg).join(' '); };
  var add = function (cl) { mod('concat', [cl]); };
  var remove = function (cl) { mod('filter', function (x) { return x !== cl; }); };
  var toggle = function (cond, cl) { (cond ? add : remove)(cl); };

  var config = {
    apiKey: "AIzaSyCDzSta7tq03a1KmcBhiqXSHB9YxHQoi9E",
    authDomain: "backpacks-5bda5.firebaseapp.com",
    databaseURL: "https://backpacks-5bda5.firebaseio.com",
    projectId: "backpacks-5bda5",
    storageBucket: "backpacks-5bda5.appspot.com",
    messagingSenderId: "949854778876"
  };
  firebase.initializeApp(config);

  try {
    window.site = {};

  } catch (e) {
    return false;
  }
})(document.documentElement, window, window.location.search, window.location.hash, window.localStorage && window.localStorage.getItem.bind(window.localStorage), 'high', 'low', 'Site.X-Auth-', 'Token', 'Site.historic-user');
