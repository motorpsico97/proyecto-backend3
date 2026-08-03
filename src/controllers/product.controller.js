const mongoose = require('mongoose');
const Product = require('../models/Product');

const createProduct = async (req, res, next) => {
    try {
        const { title, price, stock } = req.body;

        if (!title || price === undefined) {
            return res.status(400).json({ message: 'title y price son obligatorios.' });
        }

        const product = await Product.create({
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
        const products = await Product.find();
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
        const product = await Product.findById(req.params.id);

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

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }

        if (title !== undefined) product.title = title;
        if (price !== undefined) product.price = price;
        if (stock !== undefined) product.stock = stock;

        await product.save();

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

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }

        await product.deleteOne();

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
