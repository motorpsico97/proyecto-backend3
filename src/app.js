const express = require('express');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');
const apiRoutes = require('./routes');
const logger = require('./utils/logger');
const { notFound, errorHandler } = require('./middlewares/error.middleware.js');


const isProd = () => process.env.NODE_ENV === 'production';

const app = express();

app.set('env', process.env.NODE_ENV);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
    const startedAt = Date.now();

    logger.http('request received', {
        method: req.method,
        path: req.originalUrl,
        ip: req.ip,
    });

    res.on('finish', () => {
        logger.http('request completed', {
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            durationMs: Date.now() - startedAt,
        });
    });

    next();
});

app.get('/', (req, res) => {
    res.status(200).json({ message: 'API Ecommerce funcionando' });
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'La aplicación está funcionando' });
});

app.use('/api/docs', (req, res, next) => {
    if (isProd()) {
        return res.status(403).json({ message: 'Documentacion no disponible en produccion.' });
    }

    return next();
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api', apiRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
