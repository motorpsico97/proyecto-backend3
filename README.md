# Proyecto Nuevo - Ecommerce API

API REST para gestion de usuarios, autenticacion y productos.

Stack principal:
- Node.js + Express
- MongoDB + Mongoose
- JWT (en cookie httpOnly y Bearer token)
- Swagger para documentacion de endpoints
- Jest + Supertest para pruebas

## Caracteristicas

- Registro, login, perfil y logout.
- Autorizacion por roles (user/admin).
- CRUD de usuarios (solo admin).
- CRUD de productos (lectura publica, escritura admin).
- Middleware de errores centralizado.
- Documentacion interactiva via Swagger.

## Estructura del proyecto

src/
- app.js: configuracion de Express, middlewares y rutas.
- server.js: arranque del servidor y conexion a MongoDB.
- config/db.js: conexion a base de datos.
- controllers/: logica de negocio.
- middlewares/: auth y manejo de errores.
- models/: esquemas Mongoose.
- routes/: rutas agrupadas por recurso.
- docs/swagger.js: configuracion OpenAPI.

tests/
- pruebas de integracion y unitarias con Jest.

## Requisitos

- Node.js 20 o superior (recomendado 22)
- npm
- MongoDB (local o remoto)
- Docker (opcional)

## Variables de entorno

Este proyecto no trae .env.example actualmente. Crea un archivo llamado .env en la raiz con el siguiente contenido:

```env
PORT=8080
MONGO_URI=mongodb://localhost:27017/proyecto_nuevo
JWT_SECRET=una_clave_super_segura
JWT_EXPIRES_IN=1d
NODE_ENV=development
```

Descripcion rapida:
- PORT: puerto HTTP de la API.
- MONGO_URI: cadena de conexion de MongoDB.
- JWT_SECRET: clave para firmar tokens.
- JWT_EXPIRES_IN: vencimiento del JWT (ej: 1d, 12h).
- NODE_ENV: development, test o production.

## Instalacion y ejecucion local

1. Instalar dependencias:

```bash
npm install
```

2. Crear el archivo .env con los valores anteriores.

3. Levantar en desarrollo:

```bash
npm run dev
```

4. Levantar en modo normal:

```bash
npm start
```

Servidor:
- API base: http://localhost:8080/api
- Health basico: http://localhost:8080/

## Documentacion Swagger

- URL local: http://localhost:8080/api/docs
- Nota: en produccion esta deshabilitada (retorna 403).

## Autenticacion y autorizacion

La API acepta token de 2 formas:
- Cookie httpOnly llamada token.
- Header Authorization: Bearer <token>

Roles:
- user: acceso a rutas autenticadas de perfil.
- admin: acceso a CRUD de usuarios y escritura de productos.

## Endpoints

Base URL: /api

Auth:
- POST /auth/register
- POST /auth/login
- GET /auth/me
- POST /auth/logout

Users (admin):
- POST /users
- GET /users
- GET /users/:id
- PUT /users/:id
- DELETE /users/:id

Products:
- GET /products
- GET /products/:id
- POST /products (admin)
- PUT /products/:id (admin)
- DELETE /products/:id (admin)

## Ejemplos de uso en Postman

Sugerencia: crea un Environment en Postman con estas variables.

- baseUrl: http://localhost:8080/api
- token: vacio al inicio

### 1) Registrar usuario

- Method: POST
- URL: {{baseUrl}}/auth/register
- Headers:
   - Content-Type: application/json
- Body (raw, JSON):

```json
{
   "name": "Admin",
   "email": "admin@mail.com",
   "password": "123456",
   "role": "admin"
}
```

### 2) Login y guardar token para siguientes requests

- Method: POST
- URL: {{baseUrl}}/auth/login
- Headers:
   - Content-Type: application/json
- Body (raw, JSON):

```json
{
   "email": "admin@mail.com",
   "password": "123456"
}
```

En la respuesta obtendras un campo token. Guardalo en la variable token del Environment.

Opcional (automatico), en la pestana Tests de esta request:

```javascript
const jsonData = pm.response.json();
if (jsonData.token) {
   pm.environment.set("token", jsonData.token);
}
```

### 3) Obtener perfil del usuario autenticado

- Method: GET
- URL: {{baseUrl}}/auth/me
- Authorization: Bearer Token
- Token: {{token}}

Nota: tambien puedes usar la cookie token que devuelve login, si tienes habilitado el cookie jar de Postman.

### 4) Crear producto (solo admin)

- Method: POST
- URL: {{baseUrl}}/products
- Authorization: Bearer Token
- Token: {{token}}
- Headers:
   - Content-Type: application/json
- Body (raw, JSON):

```json
{
   "title": "Teclado mecanico",
   "price": 45000,
   "stock": 15
}
```

### 5) Listar productos (publico)

- Method: GET
- URL: {{baseUrl}}/products

### 6) Ejemplos extra recomendados

Actualizar producto:
- Method: PUT
- URL: {{baseUrl}}/products/{{productId}}
- Authorization: Bearer Token
- Token: {{token}}
- Body (raw, JSON):

```json
{
   "title": "Teclado mecanico RGB",
   "price": 52000,
   "stock": 10
}
```

Eliminar producto:
- Method: DELETE
- URL: {{baseUrl}}/products/{{productId}}
- Authorization: Bearer Token
- Token: {{token}}

## Pruebas

Ejecutar suite de tests:

```bash
npm test
```

Cobertura:

```bash
npm run test:coverage
```

La carpeta coverage/ se genera automaticamente con el reporte.

## Docker

El proyecto incluye Dockerfile.

### Build

```bash
docker build -t proyecto-nuevo:1.0.0 .
```

### Run

Opcion recomendada (alinear contenedor y puerto 3000):

```bash
docker run --name proyecto-nuevo-api --env-file .env -e PORT=3000 -p 3000:3000 proyecto-nuevo:1.0.0
```

Alternativa usando puerto por defecto de la app (8080):

```bash
docker run --name proyecto-nuevo-api --env-file .env -p 8080:8080 proyecto-nuevo:1.0.0
```

## Publicar imagen en Docker Hub

1. Login:

```bash
docker login
```

2. Tag:

```bash
docker tag proyecto-nuevo:1.0.0 TU_USUARIO/proyecto-nuevo:1.0.0
docker tag proyecto-nuevo:1.0.0 TU_USUARIO/proyecto-nuevo:latest
```

3. Push:

```bash
docker push TU_USUARIO/proyecto-nuevo:1.0.0
docker push TU_USUARIO/proyecto-nuevo:latest
```

Ejemplo real:

```bash
docker push motorpsico97/proyectofinal:1.0.0
```

## Errores comunes

- Error de conexion MongoDB:
   revisa MONGO_URI y que la instancia este disponible.

- 401 No autorizado:
   falta token en cookie o Bearer, o el token expiro.

- 403 No tienes permisos:
   el usuario autenticado no tiene rol admin.

- denied al hacer docker push:
   verifica docker login, nombre del repo y permisos en Docker Hub.

