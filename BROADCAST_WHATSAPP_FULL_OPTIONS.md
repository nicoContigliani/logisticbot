# Broadcast WhatsApp - Full Media Options

## Cambios Realizados

### 1. API Route de Next.js ([`app/api/broadcasts/route.ts`](app/api/broadcasts/route.ts))

**Antes:**
- Formateaba el mensaje con `formatWhatsAppMessage` antes de enviarlo a peronbot
- Solo soportaba `imageUrl` como medio adicional
- El mensaje se formateaba automáticamente con emojis y estructura fija

**Ahora:**
- **NO formatea el mensaje** - lo pasa completo desde el frontend
- Soporta **todas las opciones de WhatsApp**:
  - `imageUrl` - Imagen con caption
  - `audioUrl` - Audio (MP3, MP4, OGG)
  - `documentUrl` - Documento con nombre personalizable
  - `contactName` + `contactPhone` - Contacto vCard
  - `locationLatitude` + `locationLongitude` - Ubicación
  - `stickerUrl` - Sticker (WebP)
  - `videoUrl` - Video con caption
- Construye el objeto `messageOptions` según el tipo de mensaje seleccionado
- Envía `messageOptions` a peronbot en lugar de mensaje formateado

### 2. Controlador de Peronbot ([`../peronbot/src/apiservices/broadcasts/controllers/broadcast.controller.js`](../peronbot/src/apiservices/broadcasts/controllers/broadcast.controller.js))

**Antes:**
- Usaba `client.formattedMessage` si estaba disponible, sino usaba `message` como texto plano
- Solo soportaba mensajes de texto

**Ahora:**
- Recibe `messageOptions` del frontend
- Si `messageOptions` existe y tiene contenido, lo usa directamente con `BotClient.sendMessage(jid, messageOptions)`
- Si no hay `messageOptions`, envía mensaje de texto plano con `{ text: message }`
- Soporta todos los tipos de mensajes de WhatsApp que Baileys permite

### 3. Frontend WhatsApp Page ([`app/dashboard/bot/whatsapp/page.tsx`](app/dashboard/bot/whatsapp/page.tsx))

**Antes:**
- Solo campo de texto para mensaje
- Solo campo de URL de imagen
- Sin mensaje por defecto

**Ahora:**
- **Mensaje por defecto** profesional con placeholders:
  ```
  ********************************************************************************
  📦 *Notificación de Entrega*

  Hola! Tu pedido está en camino.

  🚚 *Repartidor:* {{deliveryPersonName}}
  📱 *Contacto:* {{deliveryPersonPhone}}
  ⏰ *Horario:* {{shift}}

  ¡Gracias por tu compra! 🙏
  ********************************************************************************
  ```
- **Selector de tipo de mensaje** con 8 opciones:
  - 📝 Text Message
  - 🖼️ Image
  - 🎵 Audio
  - 📄 Document
  - 👤 Contact
  - 📍 Location
  - 😀 Sticker
  - 🎥 Video
- **Campos dinámicos** según el tipo de mensaje seleccionado
- **Placeholders** en el mensaje para valores dinámicos:
  - `{{clientName}}` - Nombre del cliente
  - `{{deliveryPersonName}}` - Nombre del repartidor
  - `{{deliveryPersonPhone}}` - Teléfono del repartidor
  - `{{shift}}` - Turno (Mañana/Tarde)

### 4. Frontend Delivery Page ([`app/dashboard/delivery/page.tsx`](app/dashboard/delivery/page.tsx))

**Antes:**
- Mensaje simple: "El repartidor {nombre} pasará en la {turno}"
- Header duplicado con "Welcome, {user}"
- Sin mensaje profesional

**Ahora:**
- **Mensaje por defecto** profesional con placeholders (mismo que WhatsApp page):
  ```
  ********************************************************************************
  📦 *Notificación de Entrega*

  Hola! Tu pedido está en camino.

  🚚 *Repartidor:* {{deliveryPersonName}}
  📱 *Contacto:* {{deliveryPersonPhone}}
  ⏰ *Horario:* {{shift}}

  ¡Gracias por tu compra! 🙏
  ********************************************************************************
  ```
- **Header limpio** sin duplicación de "Welcome, {user}" (ya está en el layout)
- **Vista previa del mensaje** mejorada con formato pre-wrap
- **Performance optimizada** con `useCallback` y `useMemo` para evitar re-renders innecesarios

### 5. Efectos de Windows en la Interfaz

**Archivos modificados:**
- [`app/dashboard/dashboard.css`](app/dashboard/dashboard.css)
- [`app/dashboard/bot/bot.css`](app/dashboard/bot/bot.css)
- [`app/dashboard/delivery/page.tsx`](app/dashboard/delivery/page.tsx)

**Efectos agregados a todos los botones:**
- **Hover**: Cambio de color de fondo, sombra más pronunciada, transformación sutil (translateY o scale)
- **Active**: Efecto de presión con color más oscuro y sombra reducida
- **Focus**: Outline visible para accesibilidad (2px solid con color correspondiente)
- **Transiciones suaves**: `transition: all 0.15s ease` o `transition: all 0.2s ease`
- **Sombras**: `box-shadow` para dar profundidad y feedback visual
- **Bordes**: `border-radius: 0` estilo Metro/Windows 8

**Botones con efectos de Windows:**
- `.export-btn` - Botones de exportar
- `.btn-refresh-connection` - Botón de reconectar WhatsApp
- `.logout-button` - Botón de cerrar sesión
- `.nav-item` - Items de navegación principal
- `.nav-subitem` - Items de sub-navegación
- `.action-card` - Tarjetas de acciones rápidas
- `.file-item` - Items de archivos
- `.drop-zone` - Zona de arrastrar archivos
- `.sheet-tab` - Tabs de hojas de Excel
- `.pagination-button` - Botones de paginación
- `.btn-reconnect` - Botón de reconectar (bot.css)
- `.btn-add-client` - Botón de agregar cliente (bot.css)
- `.btn-submit` - Botón de enviar formulario (bot.css)
- `.btn-remove-client` - Botón de remover cliente (bot.css)
- `.btn-delete` - Botón de eliminar (bot.css)
- `.btn-send-messages` - Botón de enviar mensajes (dashboard.css)
- `.btn-clear-status` - Botón de limpiar estado (dashboard.css)

## Flujo de Datos

### Frontend → Next.js API → Peronbot → WhatsApp

1. **Frontend** envía:
   ```json
   {
     "userId": "user_123",
     "companyName": "Mi Empresa",
     "message": "********************************************************************************\n📦 *Notificación de Entrega*\n\nHola! Tu pedido está en camino.\n\n🚚 *Repartidor:* Juan Pérez\n📱 *Contacto:* +5491112345678\n⏰ *Horario:* Mañana\n\n¡Gracias por tu compra! 🙏\n********************************************************************************",
     "shift": "morning",
     "deliveryPerson": {
       "name": "Juan Pérez",
       "phone": "+5491112345678"
     },
     "clients": [
       {
         "name": "María García",
         "phone": "+5491198765432"
       }
     ],
     "imageUrl": "https://example.com/pedido.jpg"
   }
   ```

2. **Next.js API** construye `messageOptions`:
   ```json
   {
     "messageOptions": {
       "image": {
         "url": "https://example.com/pedido.jpg"
       },
       "caption": "********************************************************************************\n📦 *Notificación de Entrega*\n\nHola! Tu pedido está en camino.\n\n🚚 *Repartidor:* Juan Pérez\n📱 *Contacto:* +5491112345678\n⏰ *Horario:* Mañana\n\n¡Gracias por tu compra! 🙏\n********************************************************************************"
     }
   }
   ```

3. **Peronbot** recibe y envía a WhatsApp:
   ```javascript
   await BotClient.sock.sendMessage(jid, {
     image: { url: "https://example.com/pedido.jpg" },
     caption: "********************************************************************************\n📦 *Notificación de Entrega*...\n********************************************************************************"
   });
   ```

4. **WhatsApp** recibe el mensaje con imagen y caption

## Tipos de Mensajes Soportados

### 1. Text Message
- Solo texto plano
- Soporta formato WhatsApp (negrita, cursiva, etc.)

### 2. Image
- URL de imagen (JPG, PNG, WebP)
- Caption opcional (mensaje de texto)

### 3. Audio
- URL de audio (MP3, MP4, OGG)
- Se envía como mensaje de voz

### 4. Document
- URL de documento (PDF, DOC, XLS, etc.)
- Nombre de archivo personalizable
- Caption opcional

### 5. Contact
- Nombre del contacto
- Número de teléfono
- Se envía como vCard

### 6. Location
- Latitud y longitud
- Se envía como ubicación en el mapa
- Caption opcional

### 7. Sticker
- URL de sticker (WebP)
- Se envía como sticker animado

### 8. Video
- URL de video (MP4)
- Caption opcional

## Validaciones

### En Next.js API:
- Campos requeridos: `userId`, `companyName`, `message`, `shift`, `deliveryPerson.name`, `deliveryPerson.phone`, `clients`
- Formato de teléfono del repartidor
- Formato de teléfono de cada cliente

### En Peronbot:
- Campos requeridos
- Formato de teléfono
- Verificación de conexión del bot de WhatsApp
- Manejo de errores por cliente individual

## Optimizaciones de Performance

### Frontend:
- **useCallback** para funciones que se pasan como props o se usan en useEffect
- **useMemo** para cálculos costosos como filtrado y paginación de datos
- **Evitar re-renders innecesarios** mediante dependencias correctas en hooks

### Backend:
- **Delay entre mensajes** (1 segundo) para evitar rate limiting de WhatsApp
- **Manejo de errores por cliente** - si un mensaje falla, continúa con los siguientes
- **Logging detallado** para debugging

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

3. **Probar broadcast con texto**:
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

4. **Probar broadcast con imagen**:
   ```bash
   curl -X POST http://localhost:3000/api/broadcasts \
     -H "Content-Type: application/json" \
     -d '{
       "userId": "test-user",
       "companyName": "Test",
       "message": "Mensaje con imagen",
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
       ],
       "imageUrl": "https://example.com/image.jpg"
     }'
   ```

5. **Probar broadcast con contacto**:
   ```bash
   curl -X POST http://localhost:3000/api/broadcasts \
     -H "Content-Type: application/json" \
     -d '{
       "userId": "test-user",
       "companyName": "Test",
       "message": "Mensaje con contacto",
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
       ],
       "contactName": "María García",
       "contactPhone": "+5491198765432"
     }'
   ```

## Conclusión

El sistema de broadcast ahora soporta **todas las opciones de WhatsApp**:

✅ Mensaje se envía completo desde el frontend (sin formatear)
✅ Mensaje por defecto profesional con placeholders
✅ Soporte para imagen, audio, documento, contacto, ubicación, sticker y video
✅ Selector de tipo de mensaje en el frontend
✅ Campos dinámicos según el tipo de mensaje
✅ Validaciones en frontend y backend
✅ Manejo de errores por cliente individual
✅ Delay entre mensajes para evitar rate limiting
✅ Performance optimizada con useCallback y useMemo
✅ Interfaz limpia sin duplicación de headers
✅ **Efectos de Windows en todos los botones** (hover, active, focus, transiciones suaves, sombras)

El broadcast ahora es **completamente flexible** y permite enviar cualquier tipo de contenido de WhatsApp, con una interfaz familiar estilo Windows.
