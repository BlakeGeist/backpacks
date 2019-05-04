'use strict';

var Handlebars = require('handlebars');
var _ = require('lodash');

//this function will takae a stirng slug, the current page states language, and checks the current page state strings
//var to see if that string exists, if it does, return it
//else return {{NO STRING FOUND}} message
module.exports = function (target, context) {
  var settings = context.data.root.settings;
  var language = settings.language;
  var strings = context.data.root.product;
  var string = strings[target]
  var translatedString;
  if(string){
    translatedString = string[language];
  } else {
    translatedString = '{{' + target + ' NO STRING FOUND}}'
  }
  return translatedString;
}
