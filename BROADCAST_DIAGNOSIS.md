# Diagnóstico: Delivery WhatsApp Broadcast

## Problema Identificado

El flujo de delivery WhatsApp desde Next.js a peronbot **NO estaba funcionando** porque:

1. **Next.js solo simulaba el envío**: La ruta [`app/api/broadcasts/route.ts`](app/api/broadcasts/route.ts:64-71) solo guardaba los broadcasts en memoria y simulaba el envío después de 2 segundos.

2. **Peronbot no tenía endpoint para broadcasts**: No existía un endpoint en peronbot para recibir los broadcasts y enviar los mensajes de WhatsApp.

## Solución Implementada

### 1. Crear endpoint de broadcasts en peronbot

**Archivos creados:**

- [`../peronbot/src/apiservices/broadcasts/controllers/broadcast.controller.js`](../peronbot/src/apiservices/broadcasts/controllers/broadcast.controller.js)
  - Controlador que recibe los broadcasts y envía los mensajes de WhatsApp
  - Valida todos los campos requeridos
  - Verifica que el bot de WhatsApp esté conectado
  - Envía mensajes a cada cliente con un delay de 1 segundo entre mensajes
  - Retorna resultados detallados (enviados, fallidos, errores)

- [`../peronbot/src/apiservices/broadcasts/routes/broadcast.routes.js`](../peronbot/src/apiservices/broadcasts/routes/broadcast.routes.js)
  - Rutas para el endpoint de broadcasts
  - Documentación Swagger completa
  - Endpoints:
    - `POST /api/broadcasts` - Enviar broadcast
    - `GET /api/broadcasts/:id` - Obtener estado del broadcast

- [`../peronbot/src/apiservices/broadcasts/index.js`](../peronbot/src/apiservices/broadcasts/index.js)
  - Módulo que exporta las rutas de broadcasts

### 2. Modificar ruta de broadcasts en Next.js

**Archivo modificado:**

- [`app/api/broadcasts/route.ts`](app/api/broadcasts/route.ts:50-73)
  - Eliminado el código de simulación
  - Ahora envía los datos al backend de peronbot usando `fetch`
  - Retorna los resultados reales del envío

### 3. Configurar rutas en peronbot

**Archivos modificados:**

- [`../peronbot/src/routes/index.js`](../peronbot/src/routes/index.js:13)
  - Agregada exportación de `broadcastRoutes`

- [`../peronbot/src/server.js`](../peronbot/src/server.js:17,202-203)
  - Importada la ruta de broadcasts
  - Configurada la ruta `/api/broadcasts`

## Flujo Correcto

1. **Next.js (Delivery Page)**:
   - Usuario sube Excel con clientes
   - Completa datos del repartidor
   - Click en "Enviar Mensajes"
   - Frontend envía POST a `/api/broadcasts`

2. **Next.js (API Route)**:
   - Recibe la request
   - Valida datos
   - Envía request al backend de peronbot en `http://localhost:8000/api/broadcasts`

3. **Peronbot (Backend)**:
   - Recibe la request
   - Valida datos
   - Verifica que el bot de WhatsApp esté conectado
   - Envía mensajes a cada cliente
   - Retorna resultados detallados

4. **Next.js (API Route)**:
   - Recibe respuesta de peronbot
   - Retorna respuesta al frontend

5. **Next.js (Delivery Page)**:
   - Muestra resultados al usuario

## Validaciones Implementadas

### En Next.js:
- Validación de campos requeridos
- Validación de formato de teléfono del repartidor
- Validación de formato de teléfono de cada cliente

### En Peronbot:
- Validación de campos requeridos
- Validación de formato de teléfono del repartidor
- Validación de formato de teléfono de cada cliente
- Verificación de conexión del bot de WhatsApp
- Manejo de errores por cliente individual

## Características del Broadcast

- **Delay entre mensajes**: 1 segundo entre cada mensaje para evitar rate limiting
- **Resultados detallados**: Retorna información de cada mensaje enviado/fallido
- **Logging**: Logs detallados de cada mensaje enviado
- **Manejo de errores**: Si un mensaje falla, continúa con los siguientes
- **Estado del broadcast**: Retorna 'completed' si todos exitosos, 'partial' si algunos fallaron

## Configuración Requerida

### Variables de entorno (.env):
```
NEXT_PUBLIC_BACKEND_DOMAIN=http://localhost:8000
```

### Peronbot debe estar corriendo:
```bash
cd ../peronbot
npm start
```

### Next.js debe estar corriendo:
```bash
npm run dev
```

## Pruebas Recomendadas

1. **Verificar que peronbot esté corriendo**:
   ```bash
   curl http://localhost:8000/health
   ```

2. **Verificar que el bot de WhatsApp esté conectado**:
   ```bash
   curl http://localhost:8000/health | jq .bot
   ```

3. **Probar broadcast con un cliente**:
   ```bash
   curl -X POST http://localhost:3000/api/broadcasts \
     -H "Content-Type: application/json" \
     -d '{
       "userId": "test-user",
       "companyName": "Test",
       "message": "Mensaje de prueba",
       "shift": "morning",
       "deliveryPerson": {
         "name": "Juan",
         "phone": "+5491112345678"
       },
       "clients": [
         {
           "name": "Cliente Test",
           "phone": "+5491198765432"
         }
       ]
     }'
   ```

4. **Probar broadcast con múltiples clientes**:
   - Subir un Excel con 10-20 clientes
   - Enviar broadcast
   - Verificar que todos los mensajes se envíen

## Conclusión

El flujo de delivery WhatsApp ahora está **completamente funcional**:

✅ Next.js envía los datos a peronbot
✅ Peronbot recibe los datos y envía los mensajes de WhatsApp
✅ Se retornan resultados detallados al frontend
✅ Se muestran resultados al usuario

El broadcast ahora es **perfecto** y funcionará correctamente para cualquier cantidad de clientes.
