const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    });

const cookieOptions = {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000,
};

const register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'name, email y password son obligatorios.' });
        }

        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(400).json({ message: 'El email ya esta registrado.' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role && role === 'admin' ? 'admin' : 'user',
        });

        const token = generateToken(user._id);
        res.cookie('token', token, cookieOptions);

        return res.status(201).json({
            message: 'Usuario creado correctamente.',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        return next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'email y password son obligatorios.' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Credenciales invalidas.' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales invalidas.' });
        }

        const token = generateToken(user._id);
        res.cookie('token', token, cookieOptions);

        return res.status(200).json({
            message: 'Login exitoso.',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        return next(error);
    }
};

const me = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        return res.status(200).json(user);
    } catch (error) {
        return next(error);
    }
};

const logout = (req, res) => {
    res.clearCookie('token', cookieOptions);
    return res.status(200).json({ message: 'Sesion cerrada.' });
};

module.exports = {
    register,
    login,
    me,
    logout,
};
