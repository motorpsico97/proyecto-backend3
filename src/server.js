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

const PORT = process.env.PORT || 8080;

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Servidor levantado en http://localhost:${PORT} [${process.env.NODE_ENV}]`);
    });
};

startServer();
