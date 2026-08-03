const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        let token = req.cookies.token;

        if (!token && authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ message: 'No autorizado. Token requerido.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ message: 'No autorizado. Usuario no encontrado.' });
        }

        req.user = user;
        return next();
    } catch (error) {
        return res.status(401).json({ message: 'Token invalido o expirado.' });
    }
};

const authorize = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'No tienes permisos para esta accion.' });
    }

    return next();
};

module.exports = {
    protect,
    authorize,
};
