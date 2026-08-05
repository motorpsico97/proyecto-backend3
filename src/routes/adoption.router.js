const express = require('express');
const authRoutes = require('./auth.routes.js');
const userRoutes = require('./user.routes.js');
const productRoutes = require('./product.routes.js');
const cartRoutes = require('./cart.routes.js');

const router = express.Router();

router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'La aplicación está funcionando' });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);

module.exports = router;
