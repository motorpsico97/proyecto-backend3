const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../src/app.js');
const Product = require('../src/models/Product.js');

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

describe('Product endpoints', () => {
    test('GET /api/products devuelve payload y lista', async () => {
        const response = await request(app).get('/api/products');

        expect(response.statusCode).toBe(200);
        expect(response.body.payload).toBe('Lista de productos');
        expect(Array.isArray(response.body.products)).toBe(true);
    });

    test('POST /api/products crea producto con admin', async () => {
        const adminToken = await registerAndGetToken('admin');

        const response = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ title: 'Teclado', price: 1000, stock: 5 });

        expect(response.statusCode).toBe(201);
        expect(response.body.product.title).toBe('Teclado');
    });

    test('POST /api/products devuelve 400 por datos faltantes', async () => {
        const adminToken = await registerAndGetToken('admin');

        const response = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ price: 1000 });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('title y price son obligatorios.');
    });

    test('POST /api/products devuelve 401 sin token', async () => {
        const response = await request(app).post('/api/products').send({
            title: 'Mouse',
            price: 200,
            stock: 1,
        });

        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe('No autorizado. Token requerido.');
    });

    test('POST /api/products devuelve 403 con token no admin', async () => {
        const userToken = await registerAndGetToken('user');

        const response = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ title: 'Monitor', price: 4000, stock: 2 });

        expect(response.statusCode).toBe(403);
        expect(response.body.message).toBe('No tienes permisos para esta accion.');
    });

    test('GET /api/products/:id devuelve producto existente', async () => {
        const product = await Product.create({ title: 'SSD', price: 3000, stock: 7 });

        const response = await request(app).get(`/api/products/${product._id}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.title).toBe('SSD');
    });

    test('GET /api/products/:id devuelve 400 si id es invalido', async () => {
        const response = await request(app).get('/api/products/abc');

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('ID invalido');
    });

    test('GET /api/products/:id devuelve 404 si no existe', async () => {
        const id = new mongoose.Types.ObjectId();
        const response = await request(app).get(`/api/products/${id}`);

        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe('Producto no encontrado.');
    });

    test('PUT /api/products/:id actualiza producto existente', async () => {
        const adminToken = await registerAndGetToken('admin');
        const product = await Product.create({ title: 'RAM', price: 2000, stock: 6 });

        const response = await request(app)
            .put(`/api/products/${product._id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ price: 2500 });

        expect(response.statusCode).toBe(200);
        expect(response.body.product.price).toBe(2500);
    });

    test('PUT /api/products/:id devuelve 400 con id invalido', async () => {
        const adminToken = await registerAndGetToken('admin');

        const response = await request(app)
            .put('/api/products/abc')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ price: 1 });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('ID invalido');
    });

    test('PUT /api/products/:id devuelve 404 si no existe', async () => {
        const adminToken = await registerAndGetToken('admin');
        const id = new mongoose.Types.ObjectId();

        const response = await request(app)
            .put(`/api/products/${id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ price: 1 });

        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe('Producto no encontrado.');
    });

    test('PUT /api/products/:id devuelve 403 con token no admin', async () => {
        const userToken = await registerAndGetToken('user');
        const product = await Product.create({ title: 'GPU', price: 8000, stock: 2 });

        const response = await request(app)
            .put(`/api/products/${product._id}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({ price: 9000 });

        expect(response.statusCode).toBe(403);
        expect(response.body.message).toBe('No tienes permisos para esta accion.');
    });

    test('DELETE /api/products/:id elimina producto existente', async () => {
        const adminToken = await registerAndGetToken('admin');
        const product = await Product.create({ title: 'CPU', price: 6000, stock: 4 });

        const response = await request(app)
            .delete(`/api/products/${product._id}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Producto eliminado.');
    });

    test('DELETE /api/products/:id devuelve 404 con id invalido', async () => {
        const adminToken = await registerAndGetToken('admin');

        const response = await request(app)
            .delete('/api/products/abc')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe('Producto no encontrado.');
    });

    test('DELETE /api/products/:id devuelve 404 si no existe', async () => {
        const adminToken = await registerAndGetToken('admin');
        const id = new mongoose.Types.ObjectId();

        const response = await request(app)
            .delete(`/api/products/${id}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe('Producto no encontrado.');
    });

    test('DELETE /api/products/:id devuelve 403 con token no admin', async () => {
        const userToken = await registerAndGetToken('user');
        const product = await Product.create({ title: 'Case', price: 500, stock: 10 });

        const response = await request(app)
            .delete(`/api/products/${product._id}`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(response.statusCode).toBe(403);
        expect(response.body.message).toBe('No tienes permisos para esta accion.');
    });
});
