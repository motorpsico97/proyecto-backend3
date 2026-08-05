const userDao = require('./user.dao.js');
const productDao = require('./product.dao.js');
const cartDao = require('./cart.dao.js');

module.exports = {
    ...userDao,
    ...productDao,
    ...cartDao,
};
