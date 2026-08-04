const mongoose = require('mongoose');
const {
    createUserDao,
    findUserByEmailDao,
    getUsersDao,
    getUserByIdDao,
    getUserByIdWithPasswordDao,
    findUserByIdDao,
} = require('../dao');
const { sendResponse } = require('../utils/response');

const createUser = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return sendResponse(res, 400, { message: 'name, email y password son obligatorios.' });
        }

        const exists = await findUserByEmailDao(email);
        if (exists) {
            return sendResponse(res, 400, { message: 'El email ya esta registrado.' });
        }

        const user = await createUserDao({
            name,
            email,
            password,
            role: role && role === 'admin' ? 'admin' : 'user',
        });

        return sendResponse(res, 201, {
            message: 'Usuario creado.',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            },
        });
    } catch (error) {
        return next(error);
    }
};

const getUsers = async (req, res, next) => {
    try {
        const users = await getUsersDao();
        return sendResponse(res, 200, { message: 'Usuarios obtenidos.', data: users });
    } catch (error) {
        return next(error);
    }
};

const getUserById = async (req, res, next) => {
    try {
        const user = await getUserByIdDao(req.params.id);

        if (!user) {
            return sendResponse(res, 404, { message: 'Usuario no encontrado.' });
        }

        return sendResponse(res, 200, { message: 'Usuario obtenido.', data: user });
    } catch (error) {
        return next(error);
    }
};

const updateUser = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        const user = await getUserByIdWithPasswordDao(req.params.id);
        if (!user) {
            return sendResponse(res, 404, { message: 'Usuario no encontrado.' });
        }

        if (name !== undefined) user.name = name;
        if (email !== undefined) user.email = email;
        if (password !== undefined) user.password = password;
        if (role !== undefined && ['user', 'admin'].includes(role)) user.role = role;

        await user.save();

        return sendResponse(res, 200, {
            message: 'Usuario actualizado.',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            },
        });
    } catch (error) {
        return next(error);
    }
};

const deleteUser = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return sendResponse(res, 404, { message: 'Usuario no encontrado.' });
        }

        const user = await findUserByIdDao(req.params.id);

        if (!user) {
            return sendResponse(res, 404, { message: 'Usuario no encontrado.' });
        }

        await user.deleteOne();

        return sendResponse(res, 200, { message: 'Usuario eliminado.' });
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
