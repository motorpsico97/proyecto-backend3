const userDao = require('./user.dao.js');
const productDao = require('./product.dao.js');

module.exports = {
    ...userDao,
    ...productDao,
};
