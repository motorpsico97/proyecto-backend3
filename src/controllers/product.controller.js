const mongoose = require('mongoose');
const {
    createProductDao,
    getProductsDao,
    getProductByIdDao,
    updateProductDao,
    deleteProductDao,
} = require('../dao');

const createProduct = async (req, res, next) => {
    try {
        const { title, price, stock } = req.body;

        if (!title || price === undefined) {
            return res.status(400).json({ message: 'title y price son obligatorios.' });
        }

        const product = await createProductDao({
            title,
            price,
            stock,
        });

        return res.status(201).json({
            message: 'Producto creado.',
            product,
        });
    } catch (error) {
        return next(error);
    }
};

const getProducts = async (req, res, next) => {
    try {
        const products = await getProductsDao();
        return res.status(200).json({
            payload: 'Lista de productos',
            products,
        });
    } catch (error) {
        return next(error);
    }
};

const getProductById = async (req, res, next) => {
    try {
        const product = await getProductByIdDao(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }

        return res.status(200).json(product);
    } catch (error) {
        return next(error);
    }
};

const updateProduct = async (req, res, next) => {
    try {
        const { title, price, stock } = req.body;

        const product = await updateProductDao(req.params.id, {
            ...(title !== undefined ? { title } : {}),
            ...(price !== undefined ? { price } : {}),
            ...(stock !== undefined ? { stock } : {}),
        });
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }

        return res.status(200).json({
            message: 'Producto actualizado.',
            product,
        });
    } catch (error) {
        return next(error);
    }
};

const deleteProduct = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }

        const product = await deleteProductDao(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }

        return res.status(200).json({ message: 'Producto eliminado.' });
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
};
