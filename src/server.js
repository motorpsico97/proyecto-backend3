require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 8080;

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Servidor levantado en http://localhost:${PORT}`);
    });
};

startServer();
