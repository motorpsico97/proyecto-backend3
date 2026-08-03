const express = require('express');
const { register, login, me, logout } = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Registrar usuario
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
 *               duplicateEmail:
 *                 value:
 *                   message: El email ya esta registrado.
 *               missingFields:
 *                 value:
 *                   message: name, email y password son obligatorios.
 *       500:
 *         description: Error interno del servidor
 */
router.post('/register', register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginBody'
 *     responses:
 *       200:
 *         description: Login exitoso
 *       400:
 *         description: Faltan credenciales.
 *         content:
 *           application/json:
 *             example:
 *               message: email y password son obligatorios.
 *       401:
 *         description: Credenciales invalidas.
 *         content:
 *           application/json:
 *             example:
 *               message: Credenciales invalidas.
 *       500:
 *         description: Error interno del servidor
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Perfil del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario
 *       401:
 *         description: No autorizado. Token requerido, invalido o expirado.
 *         content:
 *           application/json:
 *             examples:
 *               missingToken:
 *                 value:
 *                   message: No autorizado. Token requerido.
 *               invalidToken:
 *                 value:
 *                   message: Token invalido o expirado.
 *       500:
 *         description: Error interno del servidor
 */
router.get('/me', protect, me);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Cerrar sesion
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesion cerrada
 *       401:
 *         description: No autorizado. Token requerido, invalido o expirado.
 *         content:
 *           application/json:
 *             examples:
 *               missingToken:
 *                 value:
 *                   message: No autorizado. Token requerido.
 *               invalidToken:
 *                 value:
 *                   message: Token invalido o expirado.
 */
router.post('/logout', protect, logout);

module.exports = router;
