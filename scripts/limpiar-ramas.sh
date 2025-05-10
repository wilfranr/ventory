#!/bin/bash

# Script para limpiar ramas fusionadas

# 1. Cambiar a main
echo "Cambiando a la rama main..."
git checkout main

# 2. Actualizar main
echo "Actualizando main..."
git pull origin main

# 3. Mostrar ramas fusionadas
echo "Ramas locales fusionadas que serán eliminadas:"
git branch --merged | grep -v '\*' | grep -v 'main'

# 4. Eliminar ramas locales fusionadas
echo "Eliminando ramas locales fusionadas..."
git branch --merged | grep -v '\*' | grep -v 'main' | xargs -n 1 git branch -d

# 5. Preguntar si quieres borrar ramas remotas
read -p "¿Deseas también eliminar ramas remotas fusionadas? (s/n): " confirm

if [ "$confirm" = "s" ]; then
  echo "Listando ramas remotas no fusionadas:"
  git fetch --all --prune
  git branch -r --merged | grep -v 'origin/main' | sed 's/origin\///' | while read branch; do
    echo "Eliminando rama remota: $branch"
    git push origin --delete "$branch"
  done
else
  echo "Ok, no se eliminarán ramas remotas."
fi

echo "✅ Limpieza completada."
