# Ecommerce API basica

Backend ecommerce basico con Express + MongoDB + JWT + cookies.

## Tecnologias

- express
- cookie-parser
- bcrypt
- jsonwebtoken
- mongoose

## Instalacion

1. Instalar dependencias:

   npm install

2. Crear archivo de entorno:

   Copiar `.env.example` a `.env` y completar valores.

3. Levantar servidor:

   npm run dev

## Base URL

- http://localhost:8080/api

## Rutas

### Auth

- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- POST /api/auth/logout

### Usuarios (admin)

- POST /api/users
- GET /api/users
- GET /api/users/:id
- PUT /api/users/:id
- DELETE /api/users/:id

### Productos

- GET /api/products
- GET /api/products/:id
- POST /api/products (admin)
- PUT /api/products/:id (admin)
- DELETE /api/products/:id (admin)

## Notas

- El token JWT se devuelve en cookie httpOnly y tambien en la respuesta JSON.
- Para rutas protegidas podes usar cookie o header Authorization: Bearer <token>.
# proyecto-backend3
