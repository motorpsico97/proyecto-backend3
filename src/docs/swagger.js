const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ecommerce API',
      version: '1.0.0',
      description: 'Documentacion de API ecommerce',
    },
    servers: [
      {
        url: 'http://localhost:8080',
      },
    ],
    tags: [{ name: 'Auth' }, { name: 'Users' }, { name: 'Products' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        RegisterBody: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', example: 'Admin' },
            email: { type: 'string', example: 'admin@mail.com' },
            password: { type: 'string', example: '123456' },
            role: { type: 'string', example: 'admin' },
          },
        },
        LoginBody: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', example: 'admin@mail.com' },
            password: { type: 'string', example: '123456' },
          },
        },
        ProductBody: {
          type: 'object',
          required: ['title', 'price'],
          properties: {
            title: { type: 'string', example: 'Teclado mecanico' },
            price: { type: 'number', example: 45000 },
            stock: { type: 'number', example: 15 },
          },
        },
        StandardResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Operación completada.' },
            data: {
              type: 'object',
              description: 'Contenido principal de la respuesta.',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Usuario no encontrado.' },
          },
        },
      },
    },
  },
  apis: ['src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
