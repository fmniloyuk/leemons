const { table } = require('../tables');

async function deactivateUserAgent(id, { transacting } = {}) {
  return table.userAgent.update({ id }, { deactivated: true }, { transacting });
}

module.exports = {
  deactivateUserAgent,
};
