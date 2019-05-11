var moment = require('moment');

module.exports = function (date, context) {
  return moment(date).format('YYYY-MM-DD:hh:mm');
};
