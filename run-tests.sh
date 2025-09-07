#!/bin/bash

# Script para ejecutar todas las pruebas de la lógica de empresas
# Ventory - Company Logic Tests

echo "🧪 Ejecutando pruebas de la lógica de empresas de Ventory"
echo "=================================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar resultados
show_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# Backend Tests
echo -e "\n${BLUE}🔧 Ejecutando pruebas del Backend${NC}"
echo "----------------------------------------"

# Pruebas unitarias
echo -e "\n${YELLOW}📋 Pruebas Unitarias:${NC}"

echo "• CompanyFilterInterceptor..."
cd ventory-backend && npm test -- --testPathPattern=company-filter.interceptor.spec.ts
show_result $? "CompanyFilterInterceptor"

echo "• CompanyAccessGuard..."
npm test -- --testPathPattern=company-access.guard.spec.ts
show_result $? "CompanyAccessGuard"

echo "• ListItemService..."
npm test -- --testPathPattern=list-item.service.spec.ts
show_result $? "ListItemService"

echo "• ListItemController..."
npm test -- --testPathPattern=list-item.controller.spec.ts
show_result $? "ListItemController"

echo "• UsersService..."
npm test -- --testPathPattern=users.service.spec.ts
show_result $? "UsersService"

echo "• Company Access Exceptions..."
npm test -- --testPathPattern=company-access.exception.spec.ts
show_result $? "Company Access Exceptions"

# Pruebas de integración
echo -e "\n${YELLOW}🔗 Pruebas de Integración:${NC}"

echo "• Company Access E2E..."
npm run test:e2e -- --testPathPattern=company-access.e2e-spec.ts
show_result $? "Company Access E2E"

cd ..

# Frontend Tests
echo -e "\n${BLUE}🎨 Ejecutando pruebas del Frontend${NC}"
echo "----------------------------------------"

cd ventory-frontend

echo "• CompanyIdInterceptor..."
npm test -- --include="**/company-id.interceptor.spec.ts"
show_result $? "CompanyIdInterceptor"

echo "• SessionService..."
npm test -- --include="**/session.service.spec.ts"
show_result $? "SessionService"

cd ..

# Resumen
echo -e "\n${BLUE}📊 Resumen de Pruebas${NC}"
echo "===================="

echo -e "\n${GREEN}✅ Pruebas implementadas:${NC}"
echo "• Interceptor de filtrado por empresa"
echo "• Guard de acceso a empresa"
echo "• Servicios con validación de empresa"
echo "• Controladores con protección de empresa"
echo "• Excepciones específicas de acceso"
echo "• Pruebas de integración end-to-end"
echo "• Interceptor del frontend"
echo "• Servicios de sesión del frontend"

echo -e "\n${YELLOW}📝 Cobertura de pruebas:${NC}"
echo "• Unitarias: Guards, Interceptors, Services, Controllers"
echo "• Integración: Flujos completos de acceso a empresa"
echo "• E2E: Aislamiento de datos entre empresas"
echo "• Frontend: Interceptores y servicios de contexto"

echo -e "\n${BLUE}🚀 Para ejecutar pruebas específicas:${NC}"
echo "Backend: cd ventory-backend && npm test -- --testPathPattern=<nombre>"
echo "Frontend: cd ventory-frontend && npm test -- --include='**/<nombre>.spec.ts'"
echo "E2E: cd ventory-backend && npm run test:e2e -- --testPathPattern=<nombre>"

echo -e "\n${GREEN}🎉 ¡Pruebas de la lógica de empresas completadas!${NC}"
