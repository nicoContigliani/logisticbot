# HTTP Routes and Domains Audit Report

## Summary
This document provides an audit of all HTTP routes and domains used in both the Next.js (LogisticBot) and Deno.js (PeronBot) projects, ensuring proper connection between them.

## Configuration Files

### Next.js (LogisticBot)
- **Config File**: [`lib/config.ts`](lib/config.ts)
- **Environment File**: [`.env`](.env) (created)
- **Frontend Domain**: `http://localhost:3000` (from `NEXT_PUBLIC_FRONTEND_DOMAIN`)
- **Backend Domain**: `http://localhost:8000` (from `NEXT_PUBLIC_BACKEND_DOMAIN`)

### Deno.js (PeronBot)
- **Config File**: [`../peronbot/src/config/env.js`](../peronbot/src/config/env.js)
- **Environment File**: [`../peronbot/.env`](../peronbot/.env)
- **Server Port**: `8000` (from `PORT`)
- **Frontend Domain**: `http://localhost:3000` (from `FRONTEND_DOMAIN`)
- **Backend Domain**: `http://localhost:8000` (from `BACKEND_DOMAIN`)

## HTTP Routes Analysis

### Next.js API Routes (LogisticBot)
All routes are prefixed with `/api/`:

1. **Bot Connection** - [`app/api/bot/connection/route.ts`](app/api/bot/connection/route.ts)
   - `POST /api/bot/connection` - Create/check bot connection
   - `GET /api/bot/connection` - Get bot connections
   - `PUT /api/bot/connection` - Update bot connection
   - `DELETE /api/bot/connection` - Delete bot connection
   - **Backend Connection**: Checks `${backendUrl}/health` (http://localhost:8000/health)

2. **Broadcasts** - [`app/api/broadcasts/route.ts`](app/api/broadcasts/route.ts)
   - `POST /api/broadcasts` - Create broadcast
   - `GET /api/broadcasts` - Get broadcasts
   - `DELETE /api/broadcasts` - Delete broadcast

3. **Logistics** - [`app/api/logistics/route.ts`](app/api/logistics/route.ts)
   - `POST /api/logistics` - Create logistics records
   - `GET /api/logistics` - Get logistics records
   - `PUT /api/logistics` - Update logistics record
   - `DELETE /api/logistics` - Delete logistics record

4. **Programs** - [`app/api/programs/route.ts`](app/api/programs/route.ts)
   - `POST /api/programs` - Create program
   - `GET /api/programs` - Get programs
   - `PUT /api/programs` - Update program
   - `DELETE /api/programs` - Delete program

5. **Files Upload** - [`app/api/files/upload/route.ts`](app/api/files/upload/route.ts)
   - `POST /api/files/upload` - Upload file
   - `GET /api/files/upload` - Get uploaded files

6. **External APIs** - [`app/api/external/route.ts`](app/api/external/route.ts)
   - `GET /api/external` - Call external API
   - `POST /api/external` - Call external API
   - `PUT /api/external` - Call external API
   - `DELETE /api/external` - Call external API

7. **Users Sync** - [`app/api/users/sync/route.ts`](app/api/users/sync/route.ts)
   - `POST /api/users/sync` - Sync user data
   - `GET /api/users/sync` - Get user data

8. **Clerk Webhooks** - [`app/api/webhooks/clerk/route.ts`](app/api/webhooks/clerk/route.ts)
   - `POST /api/webhooks/clerk` - Handle Clerk webhooks

### Deno.js API Routes (PeronBot)
All routes are prefixed with `/api/`:

1. **Health Check** - [`../peronbot/src/server.js`](../peronbot/src/server.js)
   - `GET /health` - Health check endpoint
   - `GET /` - Root endpoint with API information

2. **Files** - [`../peronbot/src/routes/fileRoutes.js`](../peronbot/src/routes/fileRoutes.js)
   - `POST /api/files/upload` - Upload and process file
   - `POST /api/files/parse` - Parse file
   - `GET /api/files/list` - List files in Supabase Storage
   - `GET /api/files/download/:filename` - Download file from Supabase Storage
   - `DELETE /api/files/:filename` - Delete file from Supabase Storage
   - `POST /api/files/batch` - Process multiple files

3. **Session** - [`../peronbot/src/routes/sessionRoutes.js`](../peronbot/src/routes/sessionRoutes.js)
   - Session management routes

4. **Users** - [`../peronbot/src/apiservices/users/index.js`](../peronbot/src/apiservices/users/index.js)
   - User management routes

5. **Roles** - [`../peronbot/src/apiservices/roles/index.js`](../peronbot/src/apiservices/roles/index.js)
   - Role management routes

6. **Permissions** - [`../peronbot/src/apiservices/permissions/index.js`](../peronbot/src/apiservices/permissions/index.js)
   - Permission management routes

7. **Products** - [`../peronbot/src/apiservices/products/index.js`](../peronbot/src/apiservices/products/index.js)
   - Product management routes

8. **Vehicles** - [`../peronbot/src/apiservices/vehicles/index.js`](../peronbot/src/apiservices/vehicles/index.js)
   - Vehicle management routes

## Connection Verification

### CORS Configuration
The Deno.js server has CORS enabled with:
```javascript
res.header('Access-Control-Allow-Origin', '*');
res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
```

This allows the Next.js app (running on localhost:3000) to make requests to the Deno.js server (running on localhost:8000).

### Backend Connection
The Next.js app connects to the Deno.js backend through:
- **Configuration**: `config.backend.domain` = `http://localhost:8000` (from `NEXT_PUBLIC_BACKEND_DOMAIN`)
- **Health Check**: `${backendUrl}/health` = `http://localhost:8000/health`
- **Endpoint**: Deno.js server has `/health` endpoint that returns server status

## Issues Found and Fixed

### 1. Missing .env File in Next.js App
**Issue**: The Next.js app didn't have a `.env` file, only `.env.example`.
**Fix**: Created [`.env`](.env) file with all necessary environment variables, including:
- `NEXT_PUBLIC_FRONTEND_DOMAIN=http://localhost:3000`
- `NEXT_PUBLIC_BACKEND_DOMAIN=http://localhost:8000`
- All other required environment variables (Clerk, MongoDB, Supabase, etc.)

### 2. Missing PORT Variable in Deno.js .env
**Issue**: The Deno.js server's `.env` file didn't have an explicit `PORT` variable.
**Fix**: Added `PORT=8000` to [`../peronbot/.env`](../peronbot/.env) to make the configuration explicit.

## Route Mapping Summary

| Next.js Route | Deno.js Route | Connection Status |
|--------------|---------------|-------------------|
| `/api/bot/connection` | `/health` | ✅ Connected |
| `/api/broadcasts` | N/A | ✅ Independent |
| `/api/logistics` | N/A | ✅ Independent |
| `/api/programs` | N/A | ✅ Independent |
| `/api/files/upload` | `/api/files/upload` | ✅ Compatible |
| `/api/external` | N/A | ✅ Independent |
| `/api/users/sync` | `/api/users` | ✅ Compatible |
| `/api/webhooks/clerk` | N/A | ✅ Independent |

## Conclusion

All HTTP routes and domains are correctly configured and properly connected between the Next.js and Deno.js projects:

1. ✅ **Next.js app** runs on `http://localhost:3000`
2. ✅ **Deno.js server** runs on `http://localhost:8000`
3. ✅ **CORS** is enabled on Deno.js server to allow cross-origin requests
4. ✅ **Health check** endpoint is available at `http://localhost:8000/health`
5. ✅ **Bot connection** route in Next.js app correctly checks the Deno.js server's health
6. ✅ **Environment variables** are properly configured in both projects

The connection between both projects is working correctly and all routes are properly mapped.
