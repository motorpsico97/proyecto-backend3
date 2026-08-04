const jwt = require('jsonwebtoken');
const { register, login, me } = require('../src/controllers/auth.controller');
const dao = require('../src/dao');

jest.mock('../src/dao');
jest.mock('jsonwebtoken');

const createRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.cookie = jest.fn().mockReturnValue(res);
    return res;
};

describe('auth.controller unit', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('register llama next en error inesperado', async () => {
        const error = new Error('boom');
        dao.findUserByEmailDao.mockRejectedValue(error);

        const req = { body: { name: 'A', email: 'a@mail.com', password: '123456' } };
        const res = createRes();
        const next = jest.fn();

        await register(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });

    test('login devuelve 401 cuando usuario no existe', async () => {
        dao.findUserByEmailWithPasswordDao.mockResolvedValue(null);

        const req = { body: { email: 'none@mail.com', password: '123456' } };
        const res = createRes();
        const next = jest.fn();

        await login(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Credenciales invalidas.' });
        expect(next).not.toHaveBeenCalled();
    });

    test('login llama next en error inesperado', async () => {
        const error = new Error('boom');
        dao.findUserByEmailWithPasswordDao.mockRejectedValue(error);

        const req = { body: { email: 'a@mail.com', password: '123456' } };
        const res = createRes();
        const next = jest.fn();

        await login(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });

    test('me llama next en error inesperado', async () => {
        const error = new Error('boom');
        dao.getUserByIdDao.mockRejectedValue(error);

        const req = { user: { _id: '507f191e810c19729de860ea' } };
        const res = createRes();
        const next = jest.fn();

        await me(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });

    test('register usa expiracion por defecto cuando JWT_EXPIRES_IN no existe', async () => {
        const previous = process.env.JWT_EXPIRES_IN;
        delete process.env.JWT_EXPIRES_IN;

        dao.findUserByEmailDao.mockResolvedValue(null);
        dao.createUserDao.mockResolvedValue({
            _id: '1',
            name: 'A',
            email: 'a@mail.com',
            role: 'user',
        });
        jwt.sign.mockReturnValue('token123');

        const req = { body: { name: 'A', email: 'a@mail.com', password: '123456' } };
        const res = createRes();
        const next = jest.fn();

        await register(req, res, next);

        expect(jwt.sign).toHaveBeenCalledWith(
            { id: '1' },
            process.env.JWT_SECRET,
            expect.objectContaining({ expiresIn: '1d' })
        );

        if (previous !== undefined) {
            process.env.JWT_EXPIRES_IN = previous;
        }
    });
});
