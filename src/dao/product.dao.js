const Product = require('../models/Product');

const createProductDao = async (productData) => Product.create(productData);

const getProductsDao = async () => {
    const query = Product.find();
    if (query && typeof query.sort === 'function') {
        return query.sort({ createdAt: -1 });
    }

    return query;
};

const getProductByIdDao = async (id) => Product.findById(id);

const updateProductDao = async (id, updateData) => {
    const product = await Product.findById(id);
    if (!product) {
        return null;
    }

    Object.assign(product, updateData);
    await product.save();
    return product;
};

const deleteProductDao = async (id) => {
    const product = await Product.findById(id);
    if (!product) {
        return null;
    }

    await product.deleteOne();
    return product;
};

module.exports = {
    createProductDao,
    getProductsDao,
    getProductByIdDao,
    updateProductDao,
    deleteProductDao,
};
