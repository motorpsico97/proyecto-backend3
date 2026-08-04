const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../src/app.js');
const User = require('../src/models/User.js');

const uniqueEmail = () => `user_${Date.now()}_${Math.floor(Math.random() * 10000)}@mail.com`;

const registerAndGetToken = async (role = 'user') => {
    const response = await request(app).post('/api/auth/register').send({
        name: `${role} user`,
        email: uniqueEmail(),
        password: '123456',
        role,
    });

    return response.body.token;
};

describe('User endpoints', () => {
    test('POST /api/users crea usuario con admin', async () => {
        const adminToken = await registerAndGetToken('admin');

        const response = await request(app)
            .post('/api/users')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Nuevo',
                email: uniqueEmail(),
                password: '123456',
                role: 'user',
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.data.user).toBeDefined();
    });

    test('POST /api/users devuelve 401 sin token', async () => {
        const response = await request(app).post('/api/users').send({
            name: 'NoToken',
            email: uniqueEmail(),
            password: '123456',
        });

        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe('No autorizado. Token requerido.');
    });

    test('POST /api/users devuelve 403 con token no admin', async () => {
        const userToken = await registerAndGetToken('user');

        const response = await request(app)
            .post('/api/users')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                name: 'No Admin',
                email: uniqueEmail(),
                password: '123456',
            });

        expect(response.statusCode).toBe(403);
        expect(response.body.message).toBe('No tienes permisos para esta accion.');
    });

    test('GET /api/users lista usuarios con admin', async () => {
        const adminToken = await registerAndGetToken('admin');

        const response = await request(app)
            .get('/api/users')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('GET /api/users/:id obtiene usuario existente', async () => {
        const adminToken = await registerAndGetToken('admin');
        const user = await User.create({
            name: 'Target User',
            email: uniqueEmail(),
            password: '123456',
            role: 'user',
        });

        const response = await request(app)
            .get(`/api/users/${user._id}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.data.email).toBe(user.email);
    });

    test('GET /api/users/:id devuelve 404 si no existe', async () => {
        const adminToken = await registerAndGetToken('admin');
        const id = new mongoose.Types.ObjectId();

        const response = await request(app)
            .get(`/api/users/${id}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe('Usuario no encontrado.');
    });

    test('PUT /api/users/:id actualiza usuario existente', async () => {
        const adminToken = await registerAndGetToken('admin');
        const user = await User.create({
            name: 'Before Update',
            email: uniqueEmail(),
            password: '123456',
            role: 'user',
        });

        const response = await request(app)
            .put(`/api/users/${user._id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'After Update' });

        expect(response.statusCode).toBe(200);
        expect(response.body.data.user.name).toBe('After Update');
    });

    test('PUT /api/users/:id devuelve 404 si no existe', async () => {
        const adminToken = await registerAndGetToken('admin');
        const id = new mongoose.Types.ObjectId();

        const response = await request(app)
            .put(`/api/users/${id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'No one' });

        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe('Usuario no encontrado.');
    });

    test('DELETE /api/users/:id elimina usuario existente', async () => {
        const adminToken = await registerAndGetToken('admin');
        const user = await User.create({
            name: 'Delete User',
            email: uniqueEmail(),
            password: '123456',
            role: 'user',
        });

        const response = await request(app)
            .delete(`/api/users/${user._id}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Usuario eliminado.');
    });

    test('DELETE /api/users/:id devuelve 404 si id es invalido', async () => {
        const adminToken = await registerAndGetToken('admin');

        const response = await request(app)
            .delete('/api/users/abc')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe('Usuario no encontrado.');
    });

    test('DELETE /api/users/:id devuelve 403 con token no admin', async () => {
        const userToken = await registerAndGetToken('user');
        const user = await User.create({
            name: 'Protected User',
            email: uniqueEmail(),
            password: '123456',
            role: 'user',
        });

        const response = await request(app)
            .delete(`/api/users/${user._id}`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(response.statusCode).toBe(403);
        expect(response.body.message).toBe('No tienes permisos para esta accion.');
    });
});
