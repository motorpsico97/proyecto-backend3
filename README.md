# Proyecto Nuevo - Ecommerce API

API REST para autenticacion, usuarios y productos, construida con Node.js, Express y MongoDB.

## Tabla de contenido

1. [Resumen](#resumen)
2. [Arquitectura y flujo](#arquitectura-y-flujo)
3. [Stack tecnologico](#stack-tecnologico)
4. [Estructura del proyecto](#estructura-del-proyecto)
5. [Requisitos](#requisitos)
6. [Variables de entorno](#variables-de-entorno)
7. [Instalacion y ejecucion](#instalacion-y-ejecucion)
8. [Scripts disponibles](#scripts-disponibles)
9. [Autenticacion y autorizacion](#autenticacion-y-autorizacion)
10. [Documentacion Swagger](#documentacion-swagger)
11. [Logs estructurados](#logs-estructurados)
12. [Formato de respuestas](#formato-de-respuestas)
13. [Endpoints](#endpoints)
14. [Ejemplos fake y reales](#ejemplos-fake-y-reales)
15. [Pruebas automatizadas](#pruebas-automatizadas)
16. [Docker](#docker)
17. [Errores comunes y troubleshooting](#errores-comunes-y-troubleshooting)
18. [Notas de seguridad y produccion](#notas-de-seguridad-y-produccion)

## Resumen

La aplicacion expone endpoints para:

- Registro y login de usuarios con JWT.
- Perfil del usuario autenticado.
- CRUD de usuarios (solo administradores).
- CRUD de productos (lectura publica, escritura solo administradores).
- Health checks para monitoreo.
- Documentacion Swagger en entorno no productivo.

## Arquitectura y flujo

La API sigue una separacion por capas:

- Rutas: definen endpoints HTTP y middlewares.
- Controladores: orquestan validaciones y respuestas.
- DAO: capa de acceso a datos con Mongoose.
- Modelos: definicion de esquemas MongoDB.
- Middlewares: autenticacion, autorizacion y manejo de errores.
- Utils: helpers como hashing y formateo de respuesta.

Flujo simplificado de una request:

```text
Cliente -> Route -> Middleware(s) -> Controller -> DAO -> MongoDB
                                       |
                                       -> Response JSON
```

## Stack tecnologico

- Node.js (CommonJS)
- Express 5
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- Cookies (cookie-parser)
- Swagger (swagger-jsdoc + swagger-ui-express)
- Testing (Jest + Supertest + mongodb-memory-server)

## Estructura del proyecto

```text
.
├── Dockerfile
├── jest.config.js
├── package.json
├── README.md
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── product.controller.js
│   │   └── user.controller.js
│   ├── dao/
│   │   ├── index.js
│   │   ├── product.dao.js
│   │   └── user.dao.js
│   ├── docs/
│   │   └── swagger.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   └── error.middleware.js
│   ├── models/
│   │   ├── Product.js
│   │   └── User.js
│   ├── routes/
│   │   ├── adoption.router.js
│   │   ├── auth.routes.js
│   │   ├── index.js
│   │   ├── product.routes.js
│   │   └── user.routes.js
│   └── utils/
│       ├── hash.js
│       ├── logger.js
│       └── response.js
└── tests/
    ├── adoption.router.test.js
    ├── app.test.js
    ├── auth.controller.unit.test.js
    ├── auth.test.js
    ├── dao.test.js
    ├── middlewares.test.js
    ├── product.controller.test.js
    ├── product.dao.test.js
    ├── products.test.js
    ├── response.util.test.js
    ├── user.controller.test.js
    ├── user.dao.test.js
    ├── users.test.js
    └── setup/
        └── db.setup.js
```

## Requisitos

- Node.js 20 o superior (recomendado 22)
- npm 9+
- MongoDB local o remoto
- Docker (opcional)

## Variables de entorno

La app carga variables con este orden de prioridad:

1. `.env.local` en la raiz del proyecto
2. `.env` en la raiz del proyecto
3. `src/.env` (compatibilidad)

Archivo recomendado en raiz: `.env`

```env
PORT=8080
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/ecommerce
JWT_SECRET=supersecretkey123
JWT_EXPIRES_IN=1d
```

### Ejemplo fake (para documentacion o demos)

```env
PORT=8080
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/ecommerce_demo
JWT_SECRET=fake_secret_for_docs_only
JWT_EXPIRES_IN=1d
```

### Ejemplo realista (entorno cloud, sin secretos reales)

```env
PORT=8080
NODE_ENV=production
MONGO_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/ecommerce?retryWrites=true&w=majority
JWT_SECRET=<secreto_largo_aleatorio>
JWT_EXPIRES_IN=1d
```

Descripcion rapida:

- PORT: puerto HTTP donde escucha Express.
- NODE_ENV: `development`, `test` o `production`.
- MONGO_URI: cadena de conexion para Mongoose.
- JWT_SECRET: secreto de firmado de tokens.
- JWT_EXPIRES_IN: expiracion del JWT (ejemplo: `1d`, `12h`).

## Instalacion y ejecucion

1. Instalar dependencias:

```bash
npm install
```

2. Crear archivo `.env` en la raiz del proyecto.

3. Iniciar en desarrollo (nodemon):

```bash
npm run dev
```

4. Iniciar modo normal:

```bash
npm start
```

URLs utiles:

- API root: http://localhost:8080/
- Health global: http://localhost:8080/health
- API base: http://localhost:8080/api
- Health API: http://localhost:8080/api/health
- Swagger: http://localhost:8080/api/docs

## Scripts disponibles

```bash
npm run dev            # nodemon src/server.js
npm start              # node src/server.js
npm test               # jest --runInBand
npm run test:coverage  # jest --runInBand --coverage
```

## Autenticacion y autorizacion

La API acepta token de 2 formas:

- Cookie httpOnly `token`
- Header `Authorization: Bearer <token>`

Roles:

- `user`: acceso a rutas autenticadas basicas.
- `admin`: acceso a CRUD de usuarios y escritura de productos.

Middlewares:

- `protect`: valida JWT y carga `req.user`.
- `authorize('admin')`: limita acceso por rol.

## Documentacion Swagger

- Disponible en `/api/docs`.
- En `production` retorna 403 con mensaje:

```json
{ "message": "Documentacion no disponible en produccion." }
```

Importante:

- `#/components/schemas/...` no es una carpeta fisica.
- Es una seccion interna de OpenAPI definida en `src/docs/swagger.js`.

## Logs estructurados

La API incorpora un logger estructurado para registrar eventos de forma consistente y facil de filtrar en consola.

### Caracteristicas

- Salida en formato JSON.
- Niveles: `info`, `warn` y `error`.
- Incluye marca de tiempo, entorno y metadata adicional como metodo, ruta, puerto o servicio.
- Se utiliza para:
  - peticiones HTTP entrantes
  - arranque del servidor
  - errores 404/500 y fallos de inicio

### Ejemplos reales de salida

Cada tipo de evento queda registrado de forma individual. Por ejemplo:

#### 1) Inicio del servidor

```json
{"timestamp":"2026-08-04T12:00:00.000Z","level":"info","message":"servidor listo","environment":"development","port":8080}
```

#### 2) Petición entrante

```json
{"timestamp":"2026-08-04T12:00:05.123Z","level":"info","message":"request received","category":"http","method":"GET","path":"/health","ip":"::ffff:127.0.0.1"}
```

#### 3) Petición completada

```json
{"timestamp":"2026-08-04T12:00:05.145Z","level":"info","message":"request completed","category":"http","method":"GET","path":"/health","statusCode":200,"durationMs":22}
```

#### 4) Ruta no encontrada

```json
{"timestamp":"2026-08-04T12:00:10.321Z","level":"warn","message":"ruta no encontrada","method":"GET","path":"/no-existe"}
```

#### 5) Error de la aplicación

```json
{"timestamp":"2026-08-04T12:00:15.700Z","level":"error","message":"error de solicitud","method":"GET","path":"/api/usuarios","statusCode":500,"message":"Error inesperado"}
```

### Ubicacion

- Logger reutilizable: `src/utils/logger.js`
- Integracion en la app: `src/app.js`
- Integracion en errores: `src/middlewares/error.middleware.js`
- Integracion en arranque: `src/server.js`

## Formato de respuestas

La API tiene dos estilos de respuesta porque conviven controladores con y sin helper `sendResponse`:

1. Estilo estandarizado (principalmente usuarios):

```json
{
  "message": "Usuario creado.",
  "data": {
    "user": {
      "id": "66af00000000000000000001",
      "name": "Admin",
      "email": "admin@mail.com",
      "role": "admin"
    }
  }
}
```

2. Estilo directo (algunos endpoints de auth y products):

```json
{
  "message": "Login exitoso.",
  "token": "<jwt>",
  "user": {
    "id": "66af00000000000000000001",
    "name": "Admin",
    "email": "admin@mail.com",
    "role": "admin"
  }
}
```

## Endpoints

Base: `/api`

### Publicos

- `GET /health`
- `GET /products`
- `GET /products/:id`
- `POST /auth/register`
- `POST /auth/login`

### Requieren autenticacion

- `GET /auth/me`
- `POST /auth/logout`

### Requieren rol admin

- `POST /users`
- `GET /users`
- `GET /users/:id`
- `PUT /users/:id`
- `DELETE /users/:id`
- `POST /products`
- `PUT /products/:id`
- `DELETE /products/:id`

## Ejemplos fake y reales

### 1) Health check (real)

```bash
curl -i http://localhost:8080/health
```

Respuesta esperada:

```json
{
  "status": "ok",
  "message": "La aplicación está funcionando"
}
```

### 2) Registro de usuario (fake)

Request:

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Ada Lovelace",
    "email":"ada@example.com",
    "password":"123456",
    "role":"admin"
  }'
```

Response esperada (realista):

```json
{
  "message": "Usuario creado correctamente.",
  "token": "<jwt>",
  "user": {
    "id": "66af00000000000000000001",
    "name": "Ada Lovelace",
    "email": "ada@example.com",
    "role": "admin"
  }
}
```

### 3) Login (real)

Request:

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"ada@example.com",
    "password":"123456"
  }'
```

Response esperada:

```json
{
  "message": "Login exitoso.",
  "token": "<jwt>",
  "user": {
    "id": "66af00000000000000000001",
    "name": "Ada Lovelace",
    "email": "ada@example.com",
    "role": "admin"
  }
}
```

### 4) Obtener perfil autenticado (real)

```bash
curl http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer <jwt>"
```

Respuesta esperada:

```json
{
  "_id": "66af00000000000000000001",
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "role": "admin",
  "createdAt": "2026-08-04T12:00:00.000Z",
  "updatedAt": "2026-08-04T12:00:00.000Z",
  "__v": 0
}
```

### 5) Crear usuario desde panel admin (fake)

```bash
curl -X POST http://localhost:8080/api/users \
  -H "Authorization: Bearer <jwt_admin>" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Grace Hopper",
    "email":"grace@example.com",
    "password":"123456",
    "role":"user"
  }'
```

Respuesta esperada:

```json
{
  "message": "Usuario creado.",
  "data": {
    "user": {
      "id": "66af00000000000000000002",
      "name": "Grace Hopper",
      "email": "grace@example.com",
      "role": "user"
    }
  }
}
```

### 6) Listar usuarios (real)

```bash
curl http://localhost:8080/api/users \
  -H "Authorization: Bearer <jwt_admin>"
```

Ejemplo de respuesta:

```json
{
  "message": "Usuarios obtenidos.",
  "data": [
    {
      "_id": "66af00000000000000000001",
      "name": "Ada Lovelace",
      "email": "ada@example.com",
      "role": "admin"
    },
    {
      "_id": "66af00000000000000000002",
      "name": "Grace Hopper",
      "email": "grace@example.com",
      "role": "user"
    }
  ]
}
```

### 7) Crear producto (fake)

```bash
curl -X POST http://localhost:8080/api/products \
  -H "Authorization: Bearer <jwt_admin>" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Teclado mecanico",
    "price": 45000,
    "stock": 10
  }'
```

Respuesta esperada:

```json
{
  "message": "Producto creado.",
  "product": {
    "_id": "66af00000000000000001000",
    "title": "Teclado mecanico",
    "price": 45000,
    "stock": 10,
    "createdAt": "2026-08-04T12:00:00.000Z",
    "updatedAt": "2026-08-04T12:00:00.000Z",
    "__v": 0
  }
}
```

### 8) Listar productos (real)

```bash
curl http://localhost:8080/api/products
```

Respuesta esperada:

```json
{
  "payload": "Lista de productos",
  "products": [
    {
      "_id": "66af00000000000000001000",
      "title": "Teclado mecanico",
      "price": 45000,
      "stock": 10
    }
  ]
}
```

### 9) Ejemplos de errores reales

Sin token:

```json
{ "message": "No autorizado. Token requerido." }
```

Token invalido o expirado:

```json
{ "message": "Token invalido o expirado." }
```

Sin permisos:

```json
{ "message": "No tienes permisos para esta accion." }
```

Recurso no encontrado:

```json
{ "message": "Usuario no encontrado." }
```

## Pruebas automatizadas

Suite completa:

```bash
npm test
```

Con cobertura:

```bash
npm run test:coverage
```

Archivo puntual:

```bash
npx jest tests/adoption.router.test.js
```

La suite incluye pruebas de:

- app base
- autenticacion
- middlewares
- controladores
- capa DAO
- utilidades de respuesta
- enrutado principal

## Docker

El proyecto incluye `Dockerfile` para construir y ejecutar la API.

### Construir imagen

```bash
docker build -t proyecto-nuevo:1.0.0 .
```

### Ejecutar contenedor

Nota: el contenedor usa puerto interno 3000, por eso se fuerza `PORT=3000`.

```bash
docker run --name proyecto-nuevo-api --env-file .env -e PORT=3000 -p 3000:3000 proyecto-nuevo:1.0.0
```

### Comandos utiles Docker

```bash
docker ps
docker logs -f proyecto-nuevo-api
docker stop proyecto-nuevo-api
docker rm proyecto-nuevo-api
```

## Errores comunes y troubleshooting

### Error: MONGO_URI undefined en mongoose.connect

Mensaje tipico:

```text
The `uri` parameter to `openUri()` must be a string, got "undefined"
```

Checklist:

1. Verifica que exista `.env` en la raiz.
2. Verifica que `MONGO_URI` este definida.
3. Reinicia nodemon luego de editar env.
4. Si usas varios env, recuerda prioridad: `.env.local` > `.env` > `src/.env`.

### Error 403 en /api/docs

En `production`, Swagger esta bloqueado por diseno.

### Error 400 ID invalido

Se produce cuando Mongoose detecta `CastError` o IDs incorrectos.

## Notas de seguridad y produccion

- Usa un `JWT_SECRET` robusto y unico por entorno.
- No commitees archivos `.env` con secretos.
- Limita CORS y origenes en despliegues reales.
- En produccion, evita exponer stack traces.
- Rota credenciales y tokens periodicamente.

---

### Links Dockers
Repositorio:
https://hub.docker.com/repository/docker/motorpsico97/proyecto-nuevo/general
https://hub.docker.com/r/motorpsico97/proyecto-nuevo


docker push motorpsico97/proyecto-nuevo:latest
### Link GitHub
https://github.com/motorpsico97/proyecto-backend3.git
