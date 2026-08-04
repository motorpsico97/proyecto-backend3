const jwt = require('jsonwebtoken');
const User = require('../src/models/User');
const { protect, authorize } = require('../src/middlewares/auth.middleware');
const { notFound, errorHandler } = require('../src/middlewares/error.middleware');

jest.mock('jsonwebtoken');
jest.mock('../src/models/User');

const createRes = () => {
    const res = {};
    res.statusCode = 200;
    res.status = jest.fn().mockImplementation((code) => {
        res.statusCode = code;
        return res;
    });
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('auth.middleware unit', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('protect devuelve 401 cuando token es valido pero usuario no existe', async () => {
        jwt.verify.mockReturnValue({ id: '1' });
        User.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue(null),
        });

        const req = { headers: { authorization: 'Bearer token' }, cookies: {} };
        const res = createRes();
        const next = jest.fn();

        await protect(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'No autorizado. Usuario no encontrado.' });
    });

    test('protect devuelve 401 cuando jwt.verify lanza error', async () => {
        jwt.verify.mockImplementation(() => {
            throw new Error('bad token');
        });

        const req = { headers: { authorization: 'Bearer bad' }, cookies: {} };
        const res = createRes();
        const next = jest.fn();

        await protect(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Token invalido o expirado.' });
    });

    test('authorize deja pasar cuando el rol coincide', () => {
        const middleware = authorize('admin');
        const req = { user: { role: 'admin' } };
        const res = createRes();
        const next = jest.fn();

        middleware(req, res, next);

        expect(next).toHaveBeenCalled();
    });
});

describe('error.middleware unit', () => {
    test('notFound setea 404 y pasa error al next', () => {
        const req = { originalUrl: '/api/unknown' };
        const res = createRes();
        const next = jest.fn();

        notFound(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(next).toHaveBeenCalled();
        const err = next.mock.calls[0][0];
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toContain('Ruta no encontrada');
    });

    test('errorHandler mapea CastError a 400 e ID invalido', () => {
        const err = { name: 'CastError', message: 'cast', stack: 'stack' };
        const req = {};
        const res = createRes();

        errorHandler(err, req, res, jest.fn());

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'ID invalido' })
        );
    });

    test('errorHandler mapea código 11000 a 400', () => {
        const err = { code: 11000, message: 'dup', stack: 'stack' };
        const req = {};
        const res = createRes();

        errorHandler(err, req, res, jest.fn());

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'Ya existe un registro con ese valor unico' })
        );
    });

    test('errorHandler oculta stack en producción', () => {
        const previous = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';

        const err = { message: 'error', stack: 'stacktrace' };
        const req = {};
        const res = createRes();

        errorHandler(err, req, res, jest.fn());

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'error', stack: undefined });

        process.env.NODE_ENV = previous;
    });

    test('errorHandler respeta statusCode existente distinto de 200', () => {
        const err = { message: 'not found', stack: 'stack' };
        const req = {};
        const res = createRes();
        res.statusCode = 404;

        errorHandler(err, req, res, jest.fn());

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'not found' })
        );
    });
});
