const express = require('express');
const {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
} = require('../controllers/product.controller.js');
const { protect, authorize } = require('../middlewares/auth.middleware.js');

const router = express.Router();

/**
 * @swagger
 * /api/products:
 *   get:
 *     tags: [Products]
 *     summary: Listar productos
 *     responses:
 *       200:
 *         description: Lista de productos
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', getProducts);

/**
 * @swagger
 * /api/products:
 *   post:
 *     tags: [Products]
 *     summary: Crear producto
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductBody'
 *     responses:
 *       201:
 *         description: Producto creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StandardResponse'
 *             example:
 *               message: Producto creado.
 *               data:
 *                 product:
 *                   _id: 64f1c2d3e4f5a6b7c8d9e0f1
 *                   title: Teclado mecánico
 *                   price: 45000
 *                   stock: 15
 *       400:
 *         description: Datos invalidos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: title y price son obligatorios.
 *       401:
 *         description: No autorizado. Token requerido o invalido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: No autorizado. Token requerido.
 *       403:
 *         description: No tienes permisos para esta accion.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: No tienes permisos para esta accion.
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', protect, authorize('admin'), createProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Obtener producto por id
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Producto encontrado
 *       400:
 *         description: ID invalido.
 *         content:
 *           application/json:
 *             example:
 *               message: ID invalido
 *       404:
 *         description: Producto no encontrado.
 *         content:
 *           application/json:
 *             example:
 *               message: Producto no encontrado.
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', getProductById);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     tags: [Products]
 *     summary: Actualizar producto
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductBody'
 *     responses:
 *       200:
 *         description: Producto actualizado
 *       400:
 *         description: ID invalido.
 *         content:
 *           application/json:
 *             example:
 *               message: ID invalido
 *       401:
 *         description: No autorizado. Token requerido o invalido.
 *         content:
 *           application/json:
 *             example:
 *               message: No autorizado. Token requerido.
 *       403:
 *         description: No tienes permisos para esta accion.
 *         content:
 *           application/json:
 *             example:
 *               message: No tienes permisos para esta accion.
 *       404:
 *         description: Producto no encontrado.
 *         content:
 *           application/json:
 *             example:
 *               message: Producto no encontrado.
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id', protect, authorize('admin'), updateProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     tags: [Products]
 *     summary: Eliminar producto
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Producto eliminado
 *       401:
 *         description: No autorizado. Token requerido o invalido.
 *         content:
 *           application/json:
 *             example:
 *               message: No autorizado. Token requerido.
 *       403:
 *         description: No tienes permisos para esta accion.
 *         content:
 *           application/json:
 *             example:
 *               message: No tienes permisos para esta accion.
 *       404:
 *         description: Producto no encontrado.
 *         content:
 *           application/json:
 *             example:
 *               message: Producto no encontrado.
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', protect, authorize('admin'), deleteProduct);

module.exports = router;
