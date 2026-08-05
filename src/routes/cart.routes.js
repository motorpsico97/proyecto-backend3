const express = require('express');
const {
    createCart,
    getCart,
    addItemToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
} = require('../controllers/cart.controller.js');
const { protect } = require('../middlewares/auth.middleware.js');

const router = express.Router();

/**
 * @swagger
 * /api/cart:
 *   post:
 *     tags: [Cart]
 *     summary: Crear carrito o agregar un producto inicial al carrito
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CartCreateBody'
 *     responses:
 *       201:
 *         description: Carrito creado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartResponse'
 *             example:
 *               message: Carrito creado con producto.
 *               cartId: 66af00000000000000000001
 *               cart:
 *                 _id: 66af00000000000000000001
 *                 user: 66af00000000000000000002
 *                 items:
 *                   - product: 66af00000000000000001000
 *                     title: Teclado mecanico
 *                     price: 45000
 *                     quantity: 2
 *                 itemCount: 2
 *                 subtotal: 90000
 *       400:
 *         description: Datos inválidos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: quantity debe ser un entero mayor a 0.
 *       401:
 *         description: No autorizado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: No autorizado. Token requerido.
 *       404:
 *         description: Producto no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: Producto no encontrado.
 */
router.post('/', protect, createCart);

/**
 * @swagger
 * /api/cart/{cartId}:
 *   get:
 *     tags: [Cart]
 *     summary: Obtener un carrito por id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: cartId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Carrito encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartGetResponse'
 *             example:
 *               cart:
 *                 _id: 66af00000000000000000001
 *                 user: 66af00000000000000000002
 *                 items:
 *                   - product: 66af00000000000000001000
 *                     title: Teclado mecanico
 *                     price: 45000
 *                     quantity: 2
 *                 itemCount: 2
 *                 subtotal: 90000
 *       400:
 *         description: ID de carrito inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: ID de carrito invalido
 *       401:
 *         description: No autorizado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: No autorizado. Token requerido.
 *       404:
 *         description: Carrito no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: Carrito no encontrado.
 */
router.get('/:cartId', protect, getCart);

/**
 * @swagger
 * /api/cart/{cartId}/items:
 *   post:
 *     tags: [Cart]
 *     summary: Agregar un producto al carrito
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: cartId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CartAddItemBody'
 *     responses:
 *       201:
 *         description: Producto agregado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartResponse'
 *             example:
 *               message: Producto agregado al carrito.
 *               cartId: 66af00000000000000000001
 *               cart:
 *                 _id: 66af00000000000000000001
 *                 user: 66af00000000000000000002
 *                 items:
 *                   - product: 66af00000000000000001000
 *                     title: Teclado mecanico
 *                     price: 45000
 *                     quantity: 2
 *                 itemCount: 2
 *                 subtotal: 90000
 *       400:
 *         description: Datos inválidos o stock insuficiente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidId:
 *                 value:
 *                   message: ID invalido
 *               outOfStock:
 *                 value:
 *                   message: No hay suficiente stock disponible.
 *       401:
 *         description: No autorizado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: No autorizado. Token requerido.
 *       404:
 *         description: Producto o carrito no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: Producto no encontrado.
 */
router.post('/:cartId/items', protect, addItemToCart);

/**
 * @swagger
 * /api/cart/{cartId}/items/{productId}:
 *   put:
 *     tags: [Cart]
 *     summary: Actualizar la cantidad de un producto dentro del carrito
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: cartId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: productId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CartUpdateBody'
 *     responses:
 *       200:
 *         description: Cantidad actualizada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartResponse'
 *             example:
 *               message: Cantidad actualizada.
 *               cart:
 *                 _id: 66af00000000000000000001
 *                 user: 66af00000000000000000002
 *                 items:
 *                   - product: 66af00000000000000001000
 *                     title: Teclado mecanico
 *                     price: 45000
 *                     quantity: 3
 *                 itemCount: 3
 *                 subtotal: 135000
 *       400:
 *         description: Datos inválidos o stock insuficiente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidQuantity:
 *                 value:
 *                   message: quantity debe ser un entero mayor a 0.
 *               outOfStock:
 *                 value:
 *                   message: No hay suficiente stock disponible.
 *       401:
 *         description: No autorizado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: No autorizado. Token requerido.
 *       404:
 *         description: Carrito o producto no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: Producto no encontrado en el carrito.
 */
router.put('/:cartId/items/:productId', protect, updateCartItem);

/**
 * @swagger
 * /api/cart/{cartId}/items/{productId}:
 *   delete:
 *     tags: [Cart]
 *     summary: Eliminar un producto del carrito
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: cartId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: productId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Producto eliminado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartResponse'
 *             example:
 *               message: Producto eliminado del carrito.
 *               cart:
 *                 _id: 66af00000000000000000001
 *                 user: 66af00000000000000000002
 *                 items: []
 *                 itemCount: 0
 *                 subtotal: 0
 *       400:
 *         description: ID inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: ID de carrito invalido
 *       401:
 *         description: No autorizado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: No autorizado. Token requerido.
 *       404:
 *         description: Carrito o producto no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: Producto no encontrado en el carrito.
 */
router.delete('/:cartId/items/:productId', protect, removeCartItem);

/**
 * @swagger
 * /api/cart/{cartId}:
 *   delete:
 *     tags: [Cart]
 *     summary: Vaciar el carrito completo
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: cartId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Carrito vaciado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartResponse'
 *             example:
 *               message: Carrito vaciado.
 *               cart:
 *                 _id: 66af00000000000000000001
 *                 user: 66af00000000000000000002
 *                 items: []
 *                 itemCount: 0
 *                 subtotal: 0
 *       400:
 *         description: ID inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: ID de carrito invalido
 *       401:
 *         description: No autorizado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: No autorizado. Token requerido.
 *       404:
 *         description: Carrito no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: Carrito no encontrado.
 */
router.delete('/:cartId', protect, clearCart);

module.exports = router;
