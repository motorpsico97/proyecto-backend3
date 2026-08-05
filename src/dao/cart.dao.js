const mongoose = require('mongoose');
const Cart = require('../models/Cart.js');
const Product = require('../models/Product.js');

const getCartByUserDao = async (userId, cartId = null) => {
    let cart = null;

    if (cartId) {
        cart = await Cart.findOne({ user: userId, _id: cartId });
    } else {
        cart = await Cart.findOne({ user: userId });
    }

    if (!cart) {
        if (cartId && mongoose.Types.ObjectId.isValid(cartId)) {
            cart = await Cart.create({ _id: cartId, user: userId, items: [] });
        } else {
            cart = await Cart.create({ user: userId, items: [] });
        }
    }

    return cart;
};

const findCartByUserDao = async (userId, cartId = null) => {
    if (cartId) {
        return Cart.findOne({ user: userId, _id: cartId });
    }

    return Cart.findOne({ user: userId });
};

const upsertCartItemDao = async (userId, productId, quantity, cartId = null) => {
    const product = await Product.findById(productId);
    if (!product) {
        return { cart: null, item: null, product: null, outOfStock: false };
    }

    let cart = await findCartByUserDao(userId, cartId);
    if (!cart) {
        cart = await getCartByUserDao(userId, cartId);
    }

    const existingItem = cart.items.find((item) => item.product.toString() === productId.toString());
    const currentQuantity = existingItem ? existingItem.quantity : 0;
    const delta = quantity - currentQuantity;

    if (delta > 0 && product.stock < delta) {
        return { cart, item: existingItem || null, product, outOfStock: true };
    }

    if (delta > 0) {
        product.stock -= delta;
    } else if (delta < 0) {
        product.stock += Math.abs(delta);
    }

    if (existingItem) {
        existingItem.quantity = quantity;
    } else {
        cart.items.push({
            product: product._id,
            title: product.title,
            price: product.price,
            quantity,
        });
    }

    await product.save();
    await cart.save();

    return {
        cart,
        item: cart.items.find((item) => item.product.toString() === productId.toString()),
        product,
        outOfStock: false,
    };
};

const updateCartItemQuantityDao = async (userId, productId, quantity, cartId = null) => {
    const cart = await findCartByUserDao(userId, cartId);
    if (!cart) {
        return { cart: null, item: null, outOfStock: false };
    }

    const item = cart.items.find((item) => item.product.toString() === productId.toString());
    if (!item) {
        return { cart, item: null, outOfStock: false };
    }

    const product = await Product.findById(item.product);
    if (!product) {
        return { cart, item: null, outOfStock: false };
    }

    const delta = quantity - item.quantity;

    if (delta > 0 && product.stock < delta) {
        return { cart, item, outOfStock: true };
    }

    if (delta > 0) {
        product.stock -= delta;
    } else if (delta < 0) {
        product.stock += Math.abs(delta);
    }

    item.quantity = quantity;
    await product.save();
    await cart.save();

    return { cart, item, outOfStock: false };
};

const removeCartItemDao = async (userId, productId, cartId = null) => {
    const cart = await findCartByUserDao(userId, cartId);
    if (!cart) {
        return { cart: null, removed: false };
    }

    const item = cart.items.find((cartItem) => cartItem.product.toString() === productId.toString());
    if (!item) {
        return { cart, removed: false };
    }

    const product = await Product.findById(item.product);
    if (product) {
        product.stock += item.quantity;
        await product.save();
    }

    cart.items = cart.items.filter((cartItem) => cartItem.product.toString() !== productId.toString());
    await cart.save();
    return { cart, removed: true };
};

const clearCartDao = async (userId, cartId = null) => {
    const cart = await findCartByUserDao(userId, cartId);
    if (!cart) {
        return null;
    }

    for (const item of cart.items) {
        const product = await Product.findById(item.product);
        if (product) {
            product.stock += item.quantity;
            await product.save();
        }
    }

    cart.items = [];
    await cart.save();
    return cart;
};

module.exports = {
    getCartByUserDao,
    upsertCartItemDao,
    updateCartItemQuantityDao,
    removeCartItemDao,
    clearCartDao,
};
