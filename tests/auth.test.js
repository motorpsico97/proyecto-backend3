const request = require('supertest');
const app = require('../src/app.js');

const uniqueEmail = () => `user_${Date.now()}_${Math.floor(Math.random() * 10000)}@mail.com`;

describe('Auth endpoints', () => {
    test('POST /api/auth/register crea usuario y devuelve token', async () => {
        const email = uniqueEmail();

        const response = await request(app).post('/api/auth/register').send({
            name: 'Admin Test',
            email,
            password: '123456',
            role: 'admin',
        });

        expect(response.statusCode).toBe(201);
        expect(response.body.token).toBeDefined();
        expect(response.body.user.email).toBe(email);
    });

    test('POST /api/auth/register devuelve 400 por campos faltantes', async () => {
        const response = await request(app).post('/api/auth/register').send({
            email: uniqueEmail(),
        });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('name, email y password son obligatorios.');
    });

    test('POST /api/auth/register devuelve 400 por email duplicado', async () => {
        const email = uniqueEmail();

        await request(app).post('/api/auth/register').send({
            name: 'Usuario 1',
            email,
            password: '123456',
        });

        const response = await request(app).post('/api/auth/register').send({
            name: 'Usuario 2',
            email,
            password: '123456',
        });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('El email ya esta registrado.');
    });

    test('POST /api/auth/login devuelve 200 con credenciales validas', async () => {
        const email = uniqueEmail();
        const password = '123456';

        await request(app).post('/api/auth/register').send({
            name: 'Login User',
            email,
            password,
        });

        const response = await request(app).post('/api/auth/login').send({ email, password });

        expect(response.statusCode).toBe(200);
        expect(response.body.token).toBeDefined();
        expect(response.body.user.email).toBe(email);
    });

    test('POST /api/auth/login devuelve 400 por campos faltantes', async () => {
        const response = await request(app).post('/api/auth/login').send({ email: uniqueEmail() });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('email y password son obligatorios.');
    });

    test('POST /api/auth/login devuelve 401 por credenciales invalidas', async () => {
        const email = uniqueEmail();

        await request(app).post('/api/auth/register').send({
            name: 'Wrong Pass',
            email,
            password: '123456',
        });

        const response = await request(app).post('/api/auth/login').send({
            email,
            password: 'badpass',
        });

        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe('Credenciales invalidas.');
    });

    test('GET /api/auth/me devuelve usuario autenticado', async () => {
        const email = uniqueEmail();
        const register = await request(app).post('/api/auth/register').send({
            name: 'Profile User',
            email,
            password: '123456',
        });

        const token = register.body.token;

        const response = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.email).toBe(email);
        expect(response.body.password).toBeUndefined();
    });

    test('GET /api/auth/me devuelve 401 sin token', async () => {
        const response = await request(app).get('/api/auth/me');

        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe('No autorizado. Token requerido.');
    });

    test('POST /api/auth/logout devuelve 200 con token', async () => {
        const register = await request(app).post('/api/auth/register').send({
            name: 'Logout User',
            email: uniqueEmail(),
            password: '123456',
        });

        const response = await request(app)
            .post('/api/auth/logout')
            .set('Authorization', `Bearer ${register.body.token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Sesion cerrada.');
    });

    test('POST /api/auth/logout devuelve 401 sin token', async () => {
        const response = await request(app).post('/api/auth/logout');

        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe('No autorizado. Token requerido.');
    });
});
