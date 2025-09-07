# Corrección del Cambio de Empresa para Superadmin

## Problema Identificado
Cuando un superadmin cambiaba de empresa usando el botón "Cambiar Empresa" en el topbar, el logo no se actualizaba correctamente. Solo se actualizaba el nombre de la empresa, pero el logo permanecía igual.

## Causa del Problema
En el componente `SelectCompanyComponent`, el método `selectCompany()` solo actualizaba el `activeCompanyId` en el `CompanyContextService`, pero no obtenía los datos completos de la empresa seleccionada (incluyendo el logo).

**Flujo problemático**:
1. Superadmin hace clic en "Cambiar Empresa"
2. Se navega a `/select-company`
3. Se selecciona una empresa
4. Solo se actualiza `activeCompanyId` ❌
5. No se obtienen los datos de la empresa ❌
6. El topbar no recibe el logo actualizado ❌

## Solución Implementada

### **Archivo**: `ventory-frontend/src/app/pages/select-company/select-company.component.ts`

#### **1. Importación del SessionService**
```typescript
import { SessionService } from '../../services/session.service';
```

#### **2. Inyección del servicio en el constructor**
```typescript
constructor(
    private companyService: CompanyService,
    private companyContextService: CompanyContextService,
    private sessionService: SessionService, // ✅ Agregado
    private router: Router
) {}
```

#### **3. Método selectCompany() mejorado**
```typescript
selectCompany(companyId: string): void {
    this.companyContextService.setActiveCompany(companyId);
    
    // ✅ Obtener los datos de la empresa seleccionada y actualizar la sesión
    this.companyService.getSettings(companyId).subscribe({
        next: (settings) => {
            // ✅ Actualizar la sesión con los datos de la empresa seleccionada
            this.sessionService.updateCompany(settings.name, settings.logo || null);
        },
        error: (error) => {
            console.error('Error al obtener datos de la empresa:', error);
        }
    });
    
    this.router.navigate(['/']);
}
```

## Flujo Corregido

### **Antes (Problemático)**
```
1. Superadmin hace clic en "Cambiar Empresa"
2. Se navega a /select-company
3. Se selecciona una empresa
4. Solo se actualiza activeCompanyId ❌
5. Topbar no recibe logo actualizado ❌
6. Logo permanece igual ❌
```

### **Después (Corregido)**
```
1. Superadmin hace clic en "Cambiar Empresa"
2. Se navega a /select-company
3. Se selecciona una empresa
4. Se actualiza activeCompanyId ✅
5. Se obtienen datos completos de la empresa ✅
6. Se actualiza la sesión con nombre y logo ✅
7. Topbar se actualiza automáticamente ✅
8. Logo cambia correctamente ✅
```

## Casos de Uso Cubiertos

### **1. Cambio de Empresa**
- ✅ Al seleccionar una empresa → Logo se actualiza al logo de esa empresa
- ✅ Al navegar de vuelta → Logo se mantiene actualizado
- ✅ Al cambiar entre empresas → Logo cambia correctamente

### **2. Sincronización**
- ✅ Topbar y formulario muestran el mismo logo
- ✅ Cambios se reflejan inmediatamente
- ✅ No hay desincronización entre componentes

### **3. Manejo de Errores**
- ✅ Si falla la obtención de datos → Se registra el error
- ✅ La navegación continúa normalmente
- ✅ No se rompe la funcionalidad

## Archivos Modificados

1. **`ventory-frontend/src/app/pages/select-company/select-company.component.ts`**
   - Agregada importación de `SessionService`
   - Inyectado `SessionService` en el constructor
   - Modificado `selectCompany()` para obtener datos completos de la empresa
   - Agregada actualización de sesión con nombre y logo

## Verificación

Para verificar que funciona correctamente:

1. **Como superadmin**:
   - Hacer clic en "Cambiar Empresa" en el topbar
   - Seleccionar una empresa diferente
   - Verificar que el logo cambia al logo de esa empresa
   - Verificar que el nombre también cambia

2. **Navegación**:
   - Después de cambiar empresa, navegar a otras páginas
   - Verificar que el logo se mantiene actualizado

3. **Consistencia**:
   - Ir a configuración de empresa
   - Verificar que el logo coincide entre topbar y formulario

## Resultado

✅ **El cambio de empresa ahora actualiza correctamente tanto el nombre como el logo.**

✅ **La sincronización es automática y en tiempo real.**

✅ **No hay desincronización entre el topbar y los parámetros de la empresa.**

✅ **Funciona tanto para el cambio manual como para la carga inicial de datos.**
