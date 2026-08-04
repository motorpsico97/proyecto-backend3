const express = require('express');
const request = require('supertest');

jest.mock('../src/routes/auth.routes.js', () => {
    const express = require('express');
    const router = express.Router();

    router.get('/__test-auth', (req, res) => {
        res.status(200).json({ route: 'auth' });
    });

    return router;
});

jest.mock('../src/routes/user.routes.js', () => {
    const express = require('express');
    const router = express.Router();

    router.get('/__test-users', (req, res) => {
        res.status(200).json({ route: 'users' });
    });

    return router;
});

jest.mock('../src/routes/product.routes.js', () => {
    const express = require('express');
    const router = express.Router();

    router.get('/__test-products', (req, res) => {
        res.status(200).json({ route: 'products' });
    });

    return router;
});

const adoptionRouter = require('../src/routes/adoption.router.js');

describe('adoption.router', () => {
    const app = express();
    app.use('/api', adoptionRouter);

    test('GET /api/health responde estado ok', async () => {
        const response = await request(app).get('/api/health');

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ status: 'ok', message: 'La aplicación está funcionando' });
    });

    test('Monta rutas de auth en /api/auth', async () => {
        const response = await request(app).get('/api/auth/__test-auth');

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ route: 'auth' });
    });

    test('Monta rutas de users en /api/users', async () => {
        const response = await request(app).get('/api/users/__test-users');

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ route: 'users' });
    });

    test('Monta rutas de products en /api/products', async () => {
        const response = await request(app).get('/api/products/__test-products');

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ route: 'products' });
    });
});