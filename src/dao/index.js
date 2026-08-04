const userDao = require('./user.dao');
const productDao = require('./product.dao');

module.exports = {
    ...userDao,
    ...productDao,
};
