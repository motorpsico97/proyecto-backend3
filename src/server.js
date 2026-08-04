const path = require('path');
require('dotenv').config({
    path: [
        path.resolve(process.cwd(), '.env.local'),
        path.resolve(process.cwd(), '.env'),
        path.join(__dirname, '.env'),
    ],
});

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 8080;

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            logger.info('servidor listo', {
                port: PORT,
                environment: process.env.NODE_ENV,
            });
        });
    } catch (error) {
        logger.error('fallo al iniciar el servidor', {
            error: error.message,
            stack: error.stack,
        });
        process.exit(1);
    }
};

startServer();
