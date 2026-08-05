const mongoose = require('mongoose');
const {
    getCartByUserDao,
    upsertCartItemDao,
    updateCartItemQuantityDao,
    removeCartItemDao,
    clearCartDao,
} = require('../dao');
const { sendResponse } = require('../utils/response.js');

const buildCartResponse = (cart) => {
    const items = Array.isArray(cart?.items) ? cart.items : [];
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return {
        cart: {
            _id: cart?._id,
            user: cart?.user,
            items,
            itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
            subtotal,
        },
    };
};

const createCart = async (req, res, next) => {
    try {
        const { productId, quantity = 1 } = req.body || {};

        if (productId) {
            if (!mongoose.Types.ObjectId.isValid(productId)) {
                return sendResponse(res, 400, { message: 'ID invalido' });
            }

            if (!Number.isInteger(quantity) || quantity < 1) {
                return sendResponse(res, 400, { message: 'quantity debe ser un entero mayor a 0.' });
            }

            const { cart, item, product, outOfStock } = await upsertCartItemDao(req.user._id, productId, quantity);

            if (!cart || !product) {
                return sendResponse(res, 404, { message: 'Producto no encontrado.' });
            }

            if (outOfStock) {
                return sendResponse(res, 400, { message: 'No hay suficiente stock disponible.' });
            }

            return sendResponse(res, 201, {
                message: 'Carrito creado con producto.',
                cartId: cart._id,
                cart: {
                    _id: cart._id,
                    user: cart.user,
                    items: cart.items,
                    itemCount: cart.items.reduce((sum, cartItem) => sum + cartItem.quantity, 0),
                    subtotal: cart.items.reduce((sum, cartItem) => sum + cartItem.price * cartItem.quantity, 0),
                },
            });
        }

        const cart = await getCartByUserDao(req.user._id);
        return sendResponse(res, 201, {
            message: 'Carrito creado.',
            cartId: cart._id,
            ...buildCartResponse(cart),
        });
    } catch (error) {
        return next(error);
    }
};

const getCart = async (req, res, next) => {
    try {
        const { cartId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(cartId)) {
            return sendResponse(res, 400, { message: 'ID de carrito invalido' });
        }

        const cart = await getCartByUserDao(req.user._id, cartId);

        if (!cart || cart._id.toString() !== cartId) {
            return sendResponse(res, 404, { message: 'Carrito no encontrado.' });
        }

        return sendResponse(res, 200, {
            message: 'Carrito obtenido.',
            ...buildCartResponse(cart),
        });
    } catch (error) {
        return next(error);
    }
};

const addItemToCart = async (req, res, next) => {
    try {
        const { cartId } = req.params;
        const { productId, quantity = 1 } = req.body;

        if (!productId) {
            return sendResponse(res, 400, { message: 'productId es obligatorio.' });
        }

        if (!mongoose.Types.ObjectId.isValid(cartId)) {
            return sendResponse(res, 400, { message: 'ID de carrito invalido' });
        }

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return sendResponse(res, 400, { message: 'ID invalido' });
        }

        if (!Number.isInteger(quantity) || quantity < 1) {
            return sendResponse(res, 400, { message: 'quantity debe ser un entero mayor a 0.' });
        }

        const { cart, item, product, outOfStock } = await upsertCartItemDao(req.user._id, productId, quantity, cartId);

        if (!cart || !product) {
            return sendResponse(res, 404, { message: 'Producto no encontrado.' });
        }

        if (outOfStock) {
            return sendResponse(res, 400, { message: 'No hay suficiente stock disponible.' });
        }

        return sendResponse(res, 201, {
            message: 'Producto agregado al carrito.',
            cartId: cart._id,
            cart: {
                _id: cart._id,
                user: cart.user,
                items: cart.items,
                itemCount: cart.items.reduce((sum, cartItem) => sum + cartItem.quantity, 0),
                subtotal: cart.items.reduce((sum, cartItem) => sum + cartItem.price * cartItem.quantity, 0),
            },
        });
    } catch (error) {
        return next(error);
    }
};

const updateCartItem = async (req, res, next) => {
    try {
        const { cartId, productId } = req.params;
        const { quantity } = req.body;

        if (!mongoose.Types.ObjectId.isValid(cartId)) {
            return sendResponse(res, 400, { message: 'ID de carrito invalido' });
        }

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return sendResponse(res, 400, { message: 'ID invalido' });
        }

        if (!Number.isInteger(quantity) || quantity < 1) {
            return sendResponse(res, 400, { message: 'quantity debe ser un entero mayor a 0.' });
        }

        const { cart, item, outOfStock } = await updateCartItemQuantityDao(req.user._id, productId, quantity, cartId);

        if (!cart || cart._id.toString() !== cartId) {
            return sendResponse(res, 404, { message: 'Carrito no encontrado.' });
        }

        if (!item) {
            return sendResponse(res, 404, { message: 'Producto no encontrado en el carrito.' });
        }

        if (outOfStock) {
            return sendResponse(res, 400, { message: 'No hay suficiente stock disponible.' });
        }

        return sendResponse(res, 200, {
            message: 'Cantidad actualizada.',
            ...buildCartResponse(cart),
        });
    } catch (error) {
        return next(error);
    }
};

const removeCartItem = async (req, res, next) => {
    try {
        const { cartId, productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(cartId)) {
            return sendResponse(res, 400, { message: 'ID de carrito invalido' });
        }

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return sendResponse(res, 400, { message: 'ID invalido' });
        }

        const { cart, removed } = await removeCartItemDao(req.user._id, productId, cartId);

        if (!cart || cart._id.toString() !== cartId) {
            return sendResponse(res, 404, { message: 'Carrito no encontrado.' });
        }

        if (!removed) {
            return sendResponse(res, 404, { message: 'Producto no encontrado en el carrito.' });
        }

        return sendResponse(res, 200, {
            message: 'Producto eliminado del carrito.',
            ...buildCartResponse(cart),
        });
    } catch (error) {
        return next(error);
    }
};

const clearCart = async (req, res, next) => {
    try {
        const { cartId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(cartId)) {
            return sendResponse(res, 400, { message: 'ID de carrito invalido' });
        }

        const cart = await clearCartDao(req.user._id, cartId);

        if (!cart || cart._id.toString() !== cartId) {
            return sendResponse(res, 404, { message: 'Carrito no encontrado.' });
        }

        return sendResponse(res, 200, {
            message: 'Carrito vaciado.',
            ...buildCartResponse(cart),
        });
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    createCart,
    getCart,
    addItemToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
};
