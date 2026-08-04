const mongoose = require('mongoose');
const User = require('../src/models/User');
const {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
} = require('../src/controllers/user.controller');

jest.mock('../src/models/User');

const createRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('user.controller unit', () => {
    let objectIdSpy;

    beforeEach(() => {
        jest.clearAllMocks();
        objectIdSpy = jest.spyOn(mongoose.Types.ObjectId, 'isValid');
    });

    afterEach(() => {
        objectIdSpy.mockRestore();
    });

    test('createUser devuelve 400 por campos faltantes', async () => {
        const req = { body: { email: 'x@mail.com' } };
        const res = createRes();
        const next = jest.fn();

        await createUser(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'name, email y password son obligatorios.' });
        expect(next).not.toHaveBeenCalled();
    });

    test('createUser devuelve 400 por email duplicado', async () => {
        User.findOne.mockResolvedValue({ _id: 'exists' });

        const req = { body: { name: 'A', email: 'x@mail.com', password: '123456' } };
        const res = createRes();
        const next = jest.fn();

        await createUser(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'El email ya esta registrado.' });
    });

    test('createUser crea usuario admin cuando role es admin', async () => {
        User.findOne.mockResolvedValue(null);
        User.create.mockResolvedValue({
            _id: '1',
            name: 'Admin',
            email: 'admin@mail.com',
            role: 'admin',
        });

        const req = {
            body: { name: 'Admin', email: 'admin@mail.com', password: '123456', role: 'admin' },
        };
        const res = createRes();
        const next = jest.fn();

        await createUser(req, res, next);

        expect(User.create).toHaveBeenCalledWith(
            expect.objectContaining({ role: 'admin' })
        );
        expect(res.status).toHaveBeenCalledWith(201);
    });

    test('createUser usa role user por defecto', async () => {
        User.findOne.mockResolvedValue(null);
        User.create.mockResolvedValue({
            _id: '1',
            name: 'User',
            email: 'user@mail.com',
            role: 'user',
        });

        const req = {
            body: { name: 'User', email: 'user@mail.com', password: '123456', role: 'otro' },
        };
        const res = createRes();
        const next = jest.fn();

        await createUser(req, res, next);

        expect(User.create).toHaveBeenCalledWith(
            expect.objectContaining({ role: 'user' })
        );
    });

    test('createUser llama next en error inesperado', async () => {
        const error = new Error('boom');
        User.findOne.mockRejectedValue(error);

        const req = { body: { name: 'A', email: 'x@mail.com', password: '123456' } };
        const res = createRes();
        const next = jest.fn();

        await createUser(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });

    test('getUsers devuelve lista de usuarios', async () => {
        const users = [{ name: 'U1' }, { name: 'U2' }];
        User.find.mockReturnValue({
            select: jest.fn().mockResolvedValue(users),
        });

        const req = {};
        const res = createRes();
        const next = jest.fn();

        await getUsers(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(users);
    });

    test('getUsers llama next en error inesperado', async () => {
        const error = new Error('boom');
        User.find.mockReturnValue({
            select: jest.fn().mockRejectedValue(error),
        });

        const req = {};
        const res = createRes();
        const next = jest.fn();

        await getUsers(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });

    test('getUserById devuelve 404 si no existe', async () => {
        User.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue(null),
        });

        const req = { params: { id: '507f191e810c19729de860ea' } };
        const res = createRes();
        const next = jest.fn();

        await getUserById(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Usuario no encontrado.' });
    });

    test('getUserById llama next en error inesperado', async () => {
        const error = new Error('boom');
        User.findById.mockReturnValue({
            select: jest.fn().mockRejectedValue(error),
        });

        const req = { params: { id: 'x' } };
        const res = createRes();
        const next = jest.fn();

        await getUserById(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });

    test('updateUser no cambia role si valor es invalido', async () => {
        const userDoc = {
            _id: '1',
            name: 'Before',
            email: 'before@mail.com',
            password: '123456',
            role: 'user',
            save: jest.fn().mockResolvedValue(undefined),
        };

        User.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue(userDoc),
        });

        const req = {
            params: { id: '507f191e810c19729de860ea' },
            body: { role: 'superadmin', name: 'After' },
        };
        const res = createRes();
        const next = jest.fn();

        await updateUser(req, res, next);

        expect(userDoc.role).toBe('user');
        expect(userDoc.name).toBe('After');
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('updateUser cambia role cuando es valido', async () => {
        const userDoc = {
            _id: '1',
            name: 'Before',
            email: 'before@mail.com',
            password: '123456',
            role: 'user',
            save: jest.fn().mockResolvedValue(undefined),
        };

        User.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue(userDoc),
        });

        const req = {
            params: { id: '507f191e810c19729de860ea' },
            body: { role: 'admin', email: 'after@mail.com' },
        };
        const res = createRes();
        const next = jest.fn();

        await updateUser(req, res, next);

        expect(userDoc.role).toBe('admin');
        expect(userDoc.email).toBe('after@mail.com');
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('updateUser actualiza password cuando viene en body', async () => {
        const userDoc = {
            _id: '1',
            name: 'Before',
            email: 'before@mail.com',
            password: 'oldpass',
            role: 'user',
            save: jest.fn().mockResolvedValue(undefined),
        };

        User.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue(userDoc),
        });

        const req = {
            params: { id: '507f191e810c19729de860ea' },
            body: { password: 'newpass123' },
        };
        const res = createRes();
        const next = jest.fn();

        await updateUser(req, res, next);

        expect(userDoc.password).toBe('newpass123');
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('updateUser llama next en error inesperado', async () => {
        const error = new Error('boom');
        User.findById.mockReturnValue({
            select: jest.fn().mockRejectedValue(error),
        });

        const req = { params: { id: 'x' }, body: {} };
        const res = createRes();
        const next = jest.fn();

        await updateUser(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });

    test('deleteUser devuelve 404 con id invalido', async () => {
        objectIdSpy.mockReturnValue(false);

        const req = { params: { id: 'abc' } };
        const res = createRes();
        const next = jest.fn();

        await deleteUser(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Usuario no encontrado.' });
        expect(User.findById).not.toHaveBeenCalled();
    });

    test('deleteUser devuelve 404 con id valido no existente', async () => {
        objectIdSpy.mockReturnValue(true);
        User.findById.mockResolvedValue(null);

        const req = { params: { id: '507f191e810c19729de860ea' } };
        const res = createRes();
        const next = jest.fn();

        await deleteUser(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Usuario no encontrado.' });
    });

    test('deleteUser llama next en error inesperado', async () => {
        const error = new Error('boom');
        objectIdSpy.mockReturnValue(true);
        User.findById.mockRejectedValue(error);

        const req = { params: { id: '507f191e810c19729de860ea' } };
        const res = createRes();
        const next = jest.fn();

        await deleteUser(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});
