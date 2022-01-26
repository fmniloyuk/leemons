const create = require('../src/services/timetables/create');
const get = require('../src/services/timetables/get');
const count = require('../src/services/timetables/count');
const update = require('../src/services/timetables/update');
const deleteOne = require('../src/services/timetables/delete');

module.exports = {
  create,
  get,
  count,
  update,
  delete: deleteOne,
};