const notFound = (req, res, next) => {
    const error = new Error(`Ruta no encontrada: ${req.originalUrl}`);
    res.status(404);
    next(error);
};

const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;

    if (err.name === 'CastError') {
        statusCode = 400;
        message = 'ID invalido';
    }

    if (err.code === 11000) {
        statusCode = 400;
        message = 'Ya existe un registro con ese valor unico';
    }

    res.status(statusCode).json({
        message,
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    });
};

module.exports = {
    notFound,
    errorHandler,
};
