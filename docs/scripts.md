# Scripts disponibles

En esta carpeta se incluyen utilidades para el mantenimiento del repositorio.

## limpiar-ramas.sh

El script `limpiar-ramas.sh` facilita la eliminación de ramas git que ya fueron fusionadas en `main`.

Uso:

```bash
./scripts/limpiar-ramas.sh
```

El script realiza lo siguiente:

1. Cambia a la rama `main` y la actualiza con `git pull`.
2. Muestra y elimina las ramas locales que ya están fusionadas.
3. Opcionalmente ofrece borrar las ramas remotas que también se hayan fusionado.
