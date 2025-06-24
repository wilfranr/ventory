# Estructura de carpetas/proyecto

El proyecto sigue una organización modular basada en las mejores prácticas de Angular.

**Estructura general:**

src/

├── app/

│   ├── core/            # Servicios y utilidades compartidas

│   ├── features/        # Módulos y vistas principales (usuarios, productos, pedidos, etc.)

│   ├── shared/          # Componentes reutilizables y pipes/directivas personalizadas

│   ├── assets/          # Recursos estáticos (imágenes, logos, etc.)

│   ├── styles/          # Archivos globales de estilos (Tailwind, variables, etc.)

│   └── app.configurator # Configuración visual (colores, temas)

├── environments/        # Configuraciones de entorno (desarrollo, producción)

├── main.ts              # Punto de entrada de la aplicación

└── index.html

**Notas:**

- Cada módulo funcional está en `features`.
- Los componentes y servicios reutilizables van en `shared`.
- Las configuraciones y servicios globales van en `core`.
- Los estilos globales y configuraciones visuales están en `styles` y `app.configurator`.

> Esta estructura puede adaptarse a las necesidades del proyecto. Mantén la coherencia al crear nuevos módulos o componentes.
>