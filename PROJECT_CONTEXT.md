# Contexto del Proyecto "Ventory"

---
### 1. Visión y Propósito
* **Nombre del Proyecto:** Ventory
* **Resumen/Propósito:** Sistema moderno de gestión empresarial full-stack que combina un frontend en Angular con un backend en NestJS. Permite la gestión de empresas, usuarios, roles, permisos y listas personalizables con un enfoque multi-tenant.
* **Público Objetivo:** Empresas que necesitan un sistema de gestión integral con control de acceso granular y personalización por empresa.
* **Funcionalidades Clave:**
    - Gestión multi-tenant de empresas con configuración personalizada
    - Sistema de autenticación y autorización con roles y permisos
    - Gestión de usuarios con invitaciones por tokens
    - Listas personalizables por empresa (ListType y ListItem)
    - Dashboard administrativo con métricas y reportes
    - Configuración visual personalizable por empresa (temas, colores, logos)
    - Integración con servicios de geolocalización (Geonames)
    - Sistema de agents para automatización de tareas

---
### 2. Stack Tecnológico
* **Lenguajes y Versiones:**
    - TypeScript 5.8.3 (Backend) / 5.6.2 (Frontend)
    - Node.js (última versión LTS)
* **Frameworks y Librerías:**
    * **Backend:** NestJS 11.0.1, Prisma 6.13.0, Passport JWT, bcrypt, class-validator
    * **Frontend:** Angular 19.0.0, PrimeNG 19.0.8, TailwindCSS 3.4.17, Chart.js 4.4.2
* **Base de Datos y ORM/ODM:** SQLite (desarrollo) / MySQL (producción) con Prisma ORM
* **Autenticación:** JWT con Passport, refresh tokens, sistema de roles y permisos
* **APIs Externas:** Geonames para datos geográficos
* **Entorno de Despliegue:** Desarrollo local con scripts npm, preparado para producción

---
### 3. Arquitectura y Estructura de Datos
* **Patrón de Arquitectura:** Arquitectura modular con separación de responsabilidades (MVC), patrón Repository con Prisma, Guards e Interceptors para seguridad
* **Modelos de Datos Principales:**
    * `User(id, name, email, password, roleId, companyId, status, refreshToken, createdAt, updatedAt)`
    * `Company(id, name, slug, nit, address, phones, email, website, logo, currency, vatPercent, country, department, city, themePreset, themePrimary, themeSurface, menuMode, createdAt)`
    * `Role(id, name, companyId, users, permissions, createdAt, updatedAt)`
    * `Permission(id, name, roles, createdAt, updatedAt)`
    * `RegistrationToken(id, token, role, companyId, createdAt)`
    * `ListType(id, code, name, description, items, companyId, createdAt, updatedAt)`
    * `ListItem(id, listTypeId, name, description, companyId, active, createdAt, updatedAt)`

---
### 4. Reglas, Estándares y Convenciones
* **Guía de Estilo / Linter:**
    - ESLint con configuraciones específicas para TypeScript y Angular
    - Prettier para formateo de código
    - Reglas personalizadas para padding entre declaraciones
    - Selectores de componentes con prefijo 'p' y estilo kebab-case
    - Directivas con prefijo 'p' y estilo camelCase
* **Convenciones de Nomenclatura:**
    - Componentes Angular sin sufijo de clase
    - Servicios con sufijo 'Service'
    - DTOs para validación de datos de entrada
    - Guards para protección de rutas
    - Interceptors para transformación de datos
* **Estrategia de Testing:**
    - Jest para pruebas unitarias del backend
    - Karma + Jasmine para pruebas del frontend
    - Cypress para pruebas end-to-end
    - Pruebas de integración para flujos completos
    - Mocks para servicios externos

---
### 5. Tu Rol como Asistente de IA
* **Persona:** Asistente de desarrollo especializado en el ecosistema Ventory, con conocimiento profundo de Angular, NestJS, Prisma y las convenciones específicas del proyecto.
* **Formato de Respuesta:** 
    - Siempre responder en español
    - Usar formato markdown para código y documentación
    - Proporcionar ejemplos de código cuando sea relevante
    - Seguir las convenciones de nomenclatura del proyecto
    - Incluir referencias a archivos específicos cuando sea apropiado
* **Instrucciones Específicas:**
    - Mantener coherencia con la arquitectura modular existente
    - Seguir las buenas prácticas de NestJS (guards, interceptors, DTOs)
    - Respetar las convenciones de Angular (standalone components, lazy loading)
    - Considerar el aspecto multi-tenant en todas las implementaciones
    - Documentar cambios importantes en la documentación técnica
    - Priorizar la seguridad y el control de acceso granular
    - Mantener la separación de responsabilidades entre frontend y backend
    - Usar Prisma para todas las operaciones de base de datos
    - Implementar validación robusta con class-validator
    - Considerar la escalabilidad y mantenibilidad del código

---
