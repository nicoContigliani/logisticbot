<p align="center">
  <a href="https://eyteacher.com" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="./public/light-logo.png">
      <img alt="EyTeacher Logo" src="./public/dark-logo.png" height="64">
    </picture>
  </a>
  <br />
</p>

<div align="center">
  <h1>EyTeacher - English Learning Platform</h1>
  <p>Plataforma educativa para aprender inglés con sesiones personalizadas de IA</p>
  
  ![Next.js](https://img.shields.io/badge/Next.js-14-black)
  ![Clerk](https://img.shields.io/badge/Clerk-Authentication-blue)
  ![MongoDB](https://img.shields.io/badge/MongoDB-Database-green)
  ![Material UI](https://img.shields.io/badge/Material%20UI-v7-purple)
  ![Framer Motion](https://img.shields.io/badge/Framer%20Motion-Animations-orange)
</div>

## 🚀 Características

### Autenticación
- 🔐 **Clerk v5** - Autenticación moderna y segura
- 📝 **Login/Register personalizado** - UI custom con Clerk
- 🔒 **Rutas protegidas** - Middleware para proteger rutas

### Base de Datos
- 🍃 **MongoDB** con Mongoose
- 📊 **Modelos** - Student, Teacher, ClassSession
- 🔄 **Servicios** - Funciones helper para CRUD y analytics

### Estado
- 🗃️ **Zustand** - Estado global simple y performante
- 📡 **Hooks personalizados** - useFetch, usePagination, useSearch

### UI/UX
- 🎨 **Material UI v7** - Componentes profesionales
- ✨ **Framer Motion** - Animaciones elegantes
- 📱 **Mobile First** - Diseño responsive
- 🎯 **Minimalista** - UX limpia para todas las edades

### Funcionalidades
- 📝 **DynamicForm** - Formularios desde JSON
- 📊 **DataTable** - Tablas dinámicas con filtros, paginación
- 🔄 **Excel/CSV** - Importación y exportación
- ☁️ **Supabase** - Upload de archivos
- 📚 **English Learning** - Sistema de tracking de progreso

### API
- 📖 **Swagger** - Documentación dinámica
- 🌐 **API Routes** - Estructura para APIs externas
- 🔌 **Proxy** - Conexión a APIs externas

## 📦 Estructura del Proyecto

```
eyteacher/
├── app/
│   ├── api/
│   │   ├── docs/          # Swagger UI
│   │   ├── external/      # APIs externas
│   │   └── cron/          # Tareas programadas
│   ├── dashboard/
│   │   └── english/       # Dashboard de inglés
│   ├── sign-in/           # Login custom
│   ├── sign-up/          # Register custom
│   └── layout.tsx        # Root layout
├── components/
│   ├── providers/        # Context providers
│   └── ui/               # Componentes reutilizables
├── hooks/                # Custom hooks
├── lib/                  # Utilidades y servicios
├── models/               # Modelos Mongoose
├── store/               # Zustand stores
└── theme/               # Tema MUI
```

## 🛠️ Tecnologías

| Tecnología | Versión | Uso |
|------------|---------|-----|
| Next.js | 14 | Framework |
| Clerk | 5.x | Autenticación |
| MongoDB | - | Base de datos |
| Mongoose | - | ODM |
| Zustand | - | Estado |
| Material UI | 7.x | UI Framework |
| Framer Motion | - | Animaciones |
|
