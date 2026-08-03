const express = require('express');
const {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
} = require('../controllers/user.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/users:
 *   post:
 *     tags: [Users]
 *     summary: Crear usuario
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterBody'
 *     responses:
 *       201:
 *         description: Usuario creado
 *       400:
 *         description: Datos invalidos o email ya registrado.
 *         content:
 *           application/json:
 *             examples:
 *               missingFields:
 *                 value:
 *                   message: name, email y password son obligatorios.
 *               duplicateEmail:
 *                 value:
 *                   message: El email ya esta registrado.
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
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', protect, authorize('admin'), createUser);

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Listar usuarios
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Listado de usuarios
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
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', protect, authorize('admin'), getUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Obtener usuario por id
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
 *         description: Usuario encontrado
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
 *         description: Usuario no encontrado.
 *         content:
 *           application/json:
 *             example:
 *               message: Usuario no encontrado.
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', protect, authorize('admin'), getUserById);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: Actualizar usuario
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
 *             $ref: '#/components/schemas/RegisterBody'
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *       400:
 *         description: Datos invalidos o ID invalido.
 *         content:
 *           application/json:
 *             examples:
 *               invalidId:
 *                 value:
 *                   message: ID invalido
 *               duplicateEmail:
 *                 value:
 *                   message: Ya existe un registro con ese valor unico
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
 *         description: Usuario no encontrado.
 *         content:
 *           application/json:
 *             example:
 *               message: Usuario no encontrado.
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id', protect, authorize('admin'), updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Eliminar usuario
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
 *         description: Usuario eliminado
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
 *         description: Usuario no encontrado.
 *         content:
 *           application/json:
 *             example:
 *               message: Usuario no encontrado.
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
