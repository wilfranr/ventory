# Guía de Agents en Ventory

Este documento describe cómo se estructuran y gestionan los *agents* (agentes) dentro del proyecto **Ventory**.

## ¿Qué es un agent?

Un *agent* es un proceso o script independiente encargado de automatizar tareas específicas. Puede ejecutar acciones programadas, integrarse con servicios externos o apoyar en labores de mantenimiento sin intervención manual.

## Tipos de agents

1. **Agents de sincronización**: mantienen la coherencia entre fuentes de datos externas y la base de Ventory.
2. **Agents de notificación**: envían correos o mensajes cuando ocurre algún evento relevante.
3. **Agents de análisis**: ejecutan tareas de monitoreo o generación de reportes.

Estos son ejemplos habituales; se pueden implementar otros tipos según las necesidades del proyecto.

## Estructura de carpetas y archivos

```
/agents        Archivo que registra los agentes en uso.
/ventory-backend
└── src/agents Carpeta sugerida para alojar la implementación de cada agent.
```

El archivo [`agents`](./agents) se utiliza como registro inicial o de referencia de los agents activos en el entorno.

En el backend (NestJS) cada agent suele residir en su propia carpeta dentro de `src/agents`. Cada carpeta puede contener al menos:

- `index.ts` o `main.ts`: punto de entrada del agent.
- Archivos de configuración o utilidades auxiliares.

## Crear o registrar un nuevo agent

1. Crea una subcarpeta dentro de `src/agents` con el nombre del nuevo agent.
2. Implementa la lógica en un archivo principal (`index.ts`).
3. Exporta el agente en el módulo correspondiente para que pueda iniciarse desde el backend.
4. Añade el nombre del agente en el archivo [`agents`](./agents) a modo de registro.

Ejemplo simplificado de `index.ts`:

```ts
import { Cron } from '@nestjs/schedule';

export class EjemploAgent {
  @Cron('0 * * * *')
  handleCron() {
    // Tarea programada cada hora
  }
}
```

## Buenas prácticas

- Documenta la finalidad de cada agente y su configuración.
- Utiliza variables de entorno para credenciales o URLs externas.
- Mantén pruebas unitarias para la lógica crítica de cada agent.
- Si un agent requiere librerías adicionales, añádelas en `package.json` del backend.
- Revisa periódicamente el archivo [`agents`](./agents) para mantenerlo actualizado.

## Consideraciones de seguridad e integración

- Asegúrate de no exponer datos sensibles en registros o mensajes de log.
- Gestiona los permisos necesarios para acceder a recursos externos.
- Integra los agentes con el sistema de autenticación del backend cuando corresponda.

## Testing

Para ejecutar las pruebas de los agents o del backend en general:

```bash
cd ventory-backend
npm test
```

Es recomendable incluir pruebas que verifiquen la ejecución programada y los casos de error de cada agente.

