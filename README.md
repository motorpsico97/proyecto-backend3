# Proyecto Nuevo - Ecommerce API

API REST para la gestión de usuarios, autenticación y productos, construida con Node.js, Express y MongoDB.

## Stack principal

- Node.js + Express
- MongoDB + Mongoose
- JWT en cookie httpOnly y Bearer token
- Swagger para documentación de endpoints
- Jest + Supertest para pruebas unitarias e integradas

## Características

- Registro, login, perfil y logout
- Autorización por roles (user/admin)
- CRUD de usuarios (solo admin)
- CRUD de productos (lectura pública, escritura admin)
- Middleware de errores centralizado
- Health check para verificar que la API responde
- Capa DAO para separar acceso a datos de la lógica de controladores
- Utilidad de hashing para contraseñas
- Tests con mocks y fakes para aislar dependencias externas

## Estructura del proyecto

```text
src/
├── app.js                 # Configuración de Express, middlewares y rutas base
├── server.js              # Arranque del servidor y carga de variables de entorno
├── config/
│   └── db.js              # Conexión a MongoDB
├── controllers/           # Lógica de negocio por recurso
├── dao/                   # Capa de acceso a datos (DAO)
├── docs/                  # Configuración Swagger
├── middlewares/           # Auth y manejo de errores
├── models/                # Esquemas Mongoose
├── routes/                # Rutas agrupadas por recurso
├── utils/                 # Utilidades compartidas (hashing, etc.)
└── .env                   # Variables de entorno locales

tests/
├── app.test.js
├── auth.controller.unit.test.js
├── auth.test.js
├── dao.test.js
├── middlewares.test.js
├── product.controller.test.js
├── product.dao.test.js
├── products.test.js
├── user.controller.test.js
├── user.dao.test.js
├── users.test.js
└── setup/
```

## Requisitos

- Node.js 20 o superior (recomendado 22)
- npm
- MongoDB (local o remoto)
- Docker (opcional)

## Variables de entorno

Crea un archivo llamado .env dentro de la carpeta src con este contenido:

```env
PORT=8080
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/ecommerce
JWT_SECRET=supersecretkey123
JWT_EXPIRES_IN=1d
```

### Descripción rápida

- PORT: puerto HTTP de la API
- NODE_ENV: development, test o production
- MONGO_URI: cadena de conexión de MongoDB
- JWT_SECRET: clave para firmar tokens
- JWT_EXPIRES_IN: tiempo de expiración del JWT

## Instalación y ejecución local

1. Instalar dependencias:

```bash
npm install
```

2. Crear el archivo .env en src/ con las variables anteriores.

3. Levantar en desarrollo:

```bash
npm run dev
```

4. Levantar en modo normal:

```bash
npm start
```

### URLs útiles

- API base: http://localhost:8080/api
- Health check: http://localhost:8080/health
- Health check API: http://localhost:8080/api/health
- Swagger: http://localhost:8080/api/docs

## Autenticación y autorización

La API acepta tokens de dos formas:

- Cookie httpOnly llamada token
- Header Authorization: Bearer <token>

Roles:

- user: acceso a rutas autenticadas de perfil
- admin: acceso a CRUD de usuarios y escritura de productos

## Formato estándar de respuestas

Todas las respuestas exitosas y de error de la API siguen un formato consistente mediante la utilidad de estandarización de respuestas.

### Estructura general

```json
{
  "message": "Descripción breve del resultado",
  "data": {
    "...": "contenido principal"
  }
}
```

### Ejemplos

Respuesta exitosa de creación de usuario:

```json
{
  "message": "Usuario creado.",
  "data": {
    "user": {
      "id": "64f1c2d3e4f5a6b7c8d9e0f1",
      "name": "Admin",
      "email": "admin@mail.com",
      "role": "admin"
    }
  }
}
```

Respuesta de error:

```json
{
  "message": "Usuario no encontrado."
}
```

Este esquema permite que los clientes consuman la API de forma uniforme, sin importar el recurso consultado.

## Endpoints

Base URL: /api

### Auth

- POST /auth/register
- POST /auth/login
- GET /auth/me
- POST /auth/logout

### Users (admin)

- POST /users
- GET /users
- GET /users/:id
- PUT /users/:id
- DELETE /users/:id

### Products

- GET /products
- GET /products/:id
- POST /products (admin)
- PUT /products/:id (admin)
- DELETE /products/:id (admin)

## Ejemplos de uso en Postman

Configura un Environment con:

- baseUrl: http://localhost:8080/api
- token: vacío al inicio

### 1) Registrar usuario

```http
POST {{baseUrl}}/auth/register
Content-Type: application/json
```

```json
{
  "name": "Admin",
  "email": "admin@mail.com",
  "password": "123456",
  "role": "admin"
}
```

### 2) Login

```http
POST {{baseUrl}}/auth/login
Content-Type: application/json
```

```json
{
  "email": "admin@mail.com",
  "password": "123456"
}
```

Guarda el token recibido en la variable token del Environment.

### 3) Obtener perfil

```http
GET {{baseUrl}}/auth/me
Authorization: Bearer {{token}}
```

### 4) Logout

```http
POST {{baseUrl}}/auth/logout
Authorization: Bearer {{token}}
```

### 5) Crear un usuario (solo admin)

```http
POST {{baseUrl}}/users
Authorization: Bearer {{token}}
Content-Type: application/json
```

```json
{
  "name": "Usuario Nuevo",
  "email": "usuario@mail.com",
  "password": "123456",
  "role": "user"
}
```

### 6) Listar usuarios (solo admin)

```http
GET {{baseUrl}}/users
Authorization: Bearer {{token}}
```

### 7) Obtener un usuario por ID (solo admin)

```http
GET {{baseUrl}}/users/507f191e810c19729de860ea
Authorization: Bearer {{token}}
```

### 8) Actualizar un usuario (solo admin)

```http
PUT {{baseUrl}}/users/507f191e810c19729de860ea
Authorization: Bearer {{token}}
Content-Type: application/json
```

```json
{
  "name": "Usuario Actualizado",
  "role": "admin"
}
```

### 9) Eliminar un usuario (solo admin)

```http
DELETE {{baseUrl}}/users/507f191e810c19729de860ea
Authorization: Bearer {{token}}
```

### 10) Crear un producto (solo admin)

```http
POST {{baseUrl}}/products
Authorization: Bearer {{token}}
Content-Type: application/json
```

```json
{
  "title": "Teclado mecánico",
  "price": 45000,
  "stock": 15
}
```

### 11) Listar productos (público)

```http
GET {{baseUrl}}/products
```

### 12) Obtener un producto por ID

```http
GET {{baseUrl}}/products/507f191e810c19729de860ea
```

### 13) Actualizar un producto (solo admin)

```http
PUT {{baseUrl}}/products/507f191e810c19729de860ea
Authorization: Bearer {{token}}
Content-Type: application/json
```

```json
{
  "title": "Teclado mecánico RGB",
  "price": 52000,
  "stock": 10
}
```

### 14) Eliminar un producto (solo admin)

```http
DELETE {{baseUrl}}/products/507f191e810c19729de860ea
Authorization: Bearer {{token}}
```

## Pruebas

Ejecutar la suite completa:

```bash
npm test
```

Ejecutar un archivo de pruebas específico:

```bash
npx jest tests/auth.test.js
```

Ejecutar varios archivos específicos:

```bash
npx jest tests/user.controller.test.js tests/product.controller.test.js
```

Ejecutar un archivo en modo detallado y sin watch:

```bash
npx jest tests/app.test.js --runInBand
```

Generar cobertura:

```bash
npm run test:coverage
```

## Docker

El proyecto incluye un Dockerfile listo para construir una imagen de la API.

### 1) Construir la imagen

```bash
docker build -t proyecto-nuevo:1.0.0 .
```

### 2) Ejecutar el contenedor

```bash
docker run --name proyecto-nuevo-api --env-file src/.env -e PORT=3000 -p 3000:3000 proyecto-nuevo:1.0.0
```

### 3) Verificar que el contenedor está corriendo

```bash
docker ps
```

### 4) Ver logs del contenedor

```bash
docker logs -f proyecto-nuevo-api
```

### 5) Detener y eliminar el contenedor

```bash
docker stop proyecto-nuevo-api
docker rm proyecto-nuevo-api
```

### 6) Usar un puerto distinto

```bash
docker run --name proyecto-nuevo-api --env-file src/.env -e PORT=8080 -p 8080:8080 proyecto-nuevo:1.0.0
```

### 7) Acceder a la API desde el host

Una vez levantado el contenedor, la API quedará disponible en:

- http://localhost:3000/api
- http://localhost:3000/health
- http://localhost:3000/api/docs

## Errores comunes

- Error de conexión a MongoDB: revisa MONGO_URI y que la instancia esté disponible.
- 401 No autorizado: falta token en cookie o Bearer, o el token expiró.
- 403 No tienes permisos: el usuario autenticado no tiene rol admin.
- Error al hacer docker push: verifica docker login, nombre del repo y permisos en Docker Hub.

