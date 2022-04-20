const addUserToAssignable = require('../src/services/assignable/addUserToAssignable');
const createAssignable = require('../src/services/assignable/createAssignable');
const getAssignable = require('../src/services/assignable/getAssignable');
const listAssignableUserAgents = require('../src/services/assignable/listAssignableUserAgents');
const getUserPermission = require('../src/services/assignable/permissions/assignable/users/getUserPermission');
const publishAssignable = require('../src/services/assignable/publishAssignable');
const removeAssignable = require('../src/services/assignable/removeAssignable');
const removeUserFromAssignable = require('../src/services/assignable/removeUserFromAssignable');
const updateAssignable = require('../src/services/assignable/updateAssignable');
const getRole = require('../src/services/roles/getRole');
const registerRole = require('../src/services/roles/registerRole');
const unregisterRole = require('../src/services/roles/unregisterRole');
const searchAssignables = require('../src/services/assignable/searchAssignables');

function createAssignableService(assignable, { userSession, transacting }) {
  return createAssignable.call(this, assignable, { userSession, transacting });
}

module.exports = {
  // Assignables
  createAssignable: createAssignableService,
  getAssignable,
  updateAssignable,
  removeAssignable,
  publishAssignable,
  addUserToAssignable,
  removeUserFromAssignable,
  listAssignableUserAgents,
  getUserAssignablePermissions: getUserPermission,
  searchAssignables,

  // Roles
  registerRole,
  unregisterRole,
  getRole,
};