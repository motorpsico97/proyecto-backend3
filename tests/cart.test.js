const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../src/app.js');
const Product = require('../src/models/Product.js');

const uniqueEmail = () => `cart_${Date.now()}_${Math.floor(Math.random() * 10000)}@mail.com`;

const registerAndGetToken = async () => {
    const response = await request(app).post('/api/auth/register').send({
        name: 'Cart user',
        email: uniqueEmail(),
        password: '123456',
    });

    return response.body.token;
};

const createCart = async (token) => {
    const response = await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${token}`);

    return response.body.cart;
};

describe('Cart endpoints', () => {
    test('POST /api/cart crea un carrito para el usuario autenticado', async () => {
        const token = await registerAndGetToken();

        const response = await request(app)
            .post('/api/cart')
            .set('Authorization', `Bearer ${token}`);

        expect(response.statusCode).toBe(201);
        expect(response.body.cart.items).toEqual([]);
        expect(response.body.cart.itemCount).toBe(0);
        expect(response.body.cart.subtotal).toBe(0);
    });

    test('POST /api/cart/:cartId/items crea un carrito si no existe y agrega el producto', async () => {
        const token = await registerAndGetToken();
        const product = await Product.create({ title: 'Mouse', price: 1500, stock: 10 });
        const cartId = new mongoose.Types.ObjectId().toString();

        const response = await request(app)
            .post(`/api/cart/${cartId}/items`)
            .set('Authorization', `Bearer ${token}`)
            .send({ productId: product._id, quantity: 2 });

        expect(response.statusCode).toBe(201);
        expect(response.body.cartId).toBeDefined();
        expect(response.body.cart.items[0].title).toBe('Mouse');
        expect(response.body.cart.items[0].quantity).toBe(2);
        expect(response.body.cart.itemCount).toBe(2);
        expect(response.body.cart.subtotal).toBe(3000);
    });

    test('POST /api/cart crea el carrito con productos y devuelve toda la información', async () => {
        const token = await registerAndGetToken();
        const product = await Product.create({ title: 'Teclado', price: 2500, stock: 5 });

        const response = await request(app)
            .post('/api/cart')
            .set('Authorization', `Bearer ${token}`)
            .send({ productId: product._id, quantity: 2 });

        expect(response.statusCode).toBe(201);
        expect(response.body.cartId).toBeDefined();
        expect(response.body.cart.items).toHaveLength(1);
        expect(response.body.cart.items[0].title).toBe('Teclado');
        expect(response.body.cart.items[0].quantity).toBe(2);
        expect(response.body.cart.itemCount).toBe(2);
        expect(response.body.cart.subtotal).toBe(5000);
    });

    test('POST /api/cart/:cartId/items agrega un producto al carrito', async () => {
        const token = await registerAndGetToken();
        const product = await Product.create({ title: 'Mouse', price: 1500, stock: 10 });
        const cart = await createCart(token);

        const response = await request(app)
            .post(`/api/cart/${cart._id}/items`)
            .set('Authorization', `Bearer ${token}`)
            .send({ productId: product._id, quantity: 2 });

        expect(response.statusCode).toBe(201);
        expect(response.body.cart.items[0].title).toBe('Mouse');
        expect(response.body.cart.items[0].quantity).toBe(2);
        expect(response.body.cartId).toBeDefined();
        expect(response.body.cart.itemCount).toBe(2);
        expect(response.body.cart.subtotal).toBe(3000);
        expect(response.body.cart.items[0].title).toBe('Mouse');
    });

    test('PUT /api/cart/:cartId/items/:productId actualiza la cantidad de un item', async () => {
        const token = await registerAndGetToken();
        const product = await Product.create({ title: 'Teclado', price: 2500, stock: 5 });
        const cart = await createCart(token);

        await request(app)
            .post(`/api/cart/${cart._id}/items`)
            .set('Authorization', `Bearer ${token}`)
            .send({ productId: product._id, quantity: 1 });

        const response = await request(app)
            .put(`/api/cart/${cart._id}/items/${product._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ quantity: 3 });

        expect(response.statusCode).toBe(200);
        expect(response.body.cart.items[0].quantity).toBe(3);
        expect(response.body.cart.itemCount).toBe(3);
        expect(response.body.cart.subtotal).toBe(7500);
    });

    test('POST /api/cart/:cartId/items usa el cartId del URL para crear el carrito y agregar el producto', async () => {
        const token = await registerAndGetToken();
        const product = await Product.create({ title: 'Impresora', price: 8000, stock: 10 });
        const cartId = new mongoose.Types.ObjectId().toString();

        const response = await request(app)
            .post(`/api/cart/${cartId}/items`)
            .set('Authorization', `Bearer ${token}`)
            .send({ productId: product._id, quantity: 2 });

        expect(response.statusCode).toBe(201);
        expect(response.body.cartId).toBe(cartId);
        expect(response.body.cart._id.toString()).toBe(cartId);
        expect(response.body.cart.items[0].quantity).toBe(2);
        expect(response.body.cart.itemCount).toBe(2);
    });

    test('PUT /api/cart/:cartId/items/:productId actualiza la cantidad usando el cartId del URL', async () => {
        const token = await registerAndGetToken();
        const product = await Product.create({ title: 'Router', price: 6000, stock: 8 });
        const cartId = new mongoose.Types.ObjectId().toString();

        await request(app)
            .post(`/api/cart/${cartId}/items`)
            .set('Authorization', `Bearer ${token}`)
            .send({ productId: product._id, quantity: 1 });

        const response = await request(app)
            .put(`/api/cart/${cartId}/items/${product._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ quantity: 4 });

        expect(response.statusCode).toBe(200);
        expect(response.body.cart.items[0].quantity).toBe(4);
        expect(response.body.cart._id.toString()).toBe(cartId);
        expect(response.body.cart.itemCount).toBe(4);
    });

    test('DELETE /api/cart/:cartId/items/:productId elimina un producto del carrito', async () => {
        const token = await registerAndGetToken();
        const product = await Product.create({ title: 'Monitor', price: 4000, stock: 3 });
        const cart = await createCart(token);

        await request(app)
            .post(`/api/cart/${cart._id}/items`)
            .set('Authorization', `Bearer ${token}`)
            .send({ productId: product._id, quantity: 1 });

        const response = await request(app)
            .delete(`/api/cart/${cart._id}/items/${product._id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Producto eliminado del carrito.');
        expect(response.body.cart.items).toEqual([]);
    });

    test('POST /api/cart/:cartId/items no permite agregar más unidades que el stock disponible', async () => {
        const token = await registerAndGetToken();
        const product = await Product.create({ title: 'Auriculares', price: 3000, stock: 2 });
        const cart = await createCart(token);

        const response = await request(app)
            .post(`/api/cart/${cart._id}/items`)
            .set('Authorization', `Bearer ${token}`)
            .send({ productId: product._id, quantity: 3 });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('No hay suficiente stock disponible.');

        const updatedProduct = await Product.findById(product._id);
        expect(updatedProduct.stock).toBe(2);
    });

    test('POST /api/cart/:cartId/items descuenta el stock del producto al agregarlo', async () => {
        const token = await registerAndGetToken();
        const product = await Product.create({ title: 'Laptop', price: 120000, stock: 5 });
        const cart = await createCart(token);

        const response = await request(app)
            .post(`/api/cart/${cart._id}/items`)
            .set('Authorization', `Bearer ${token}`)
            .send({ productId: product._id, quantity: 2 });

        expect(response.statusCode).toBe(201);

        const updatedProduct = await Product.findById(product._id);
        expect(updatedProduct.stock).toBe(3);
    });
});
