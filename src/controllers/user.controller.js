const mongoose = require('mongoose');
const {
    createUserDao,
    findUserByEmailDao,
    getUsersDao,
    getUserByIdDao,
    getUserByIdWithPasswordDao,
    findUserByIdDao,
} = require('../dao');

const createUser = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'name, email y password son obligatorios.' });
        }

        const exists = await findUserByEmailDao(email);
        if (exists) {
            return res.status(400).json({ message: 'El email ya esta registrado.' });
        }

        const user = await createUserDao({
            name,
            email,
            password,
            role: role && role === 'admin' ? 'admin' : 'user',
        });

        return res.status(201).json({
            message: 'Usuario creado.',
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

const getUsers = async (req, res, next) => {
    try {
        const users = await getUsersDao();
        return res.status(200).json(users);
    } catch (error) {
        return next(error);
    }
};

const getUserById = async (req, res, next) => {
    try {
        const user = await getUserByIdDao(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        return res.status(200).json(user);
    } catch (error) {
        return next(error);
    }
};

const updateUser = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        const user = await getUserByIdWithPasswordDao(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        if (name !== undefined) user.name = name;
        if (email !== undefined) user.email = email;
        if (password !== undefined) user.password = password;
        if (role !== undefined && ['user', 'admin'].includes(role)) user.role = role;

        await user.save();

        return res.status(200).json({
            message: 'Usuario actualizado.',
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

const deleteUser = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        const user = await findUserByIdDao(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        await user.deleteOne();

        return res.status(200).json({ message: 'Usuario eliminado.' });
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
};
