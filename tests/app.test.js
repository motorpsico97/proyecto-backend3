const request = require('supertest');
const app = require('../src/app');

describe('App base routes', () => {
    const previousNodeEnv = process.env.NODE_ENV;

    afterEach(() => {
        process.env.NODE_ENV = previousNodeEnv;
    });

    test('GET / responde API Ecommerce funcionando', async () => {
        const response = await request(app).get('/');

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ message: 'API Ecommerce funcionando' });
    });

    test('GET /health responde que la aplicación está funcionando', async () => {
        const response = await request(app).get('/health');

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ status: 'ok', message: 'La aplicación está funcionando' });
    });

    test('GET /api/health responde que la aplicación está funcionando', async () => {
        const response = await request(app).get('/api/health');

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ status: 'ok', message: 'La aplicación está funcionando' });
    });

    test('GET /api/docs/ permite acceso en development', async () => {
        process.env.NODE_ENV = 'development';

        const response = await request(app).get('/api/docs/');

        expect(response.statusCode).toBe(200);
    });

    test('GET /api/docs/ bloquea acceso en production', async () => {
        process.env.NODE_ENV = 'production';

        const response = await request(app).get('/api/docs/');

        expect(response.statusCode).toBe(403);
        expect(response.body).toEqual({ message: 'Documentacion no disponible en produccion.' });
    });
});
