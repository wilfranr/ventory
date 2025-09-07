# Módulo Third Parties

Este módulo gestiona terceros (entidades de negocio) y sus roles como clientes y/o proveedores, siguiendo un patrón de "Entidad-Rol" y una arquitectura multi-tenant.

## Estructura del Módulo

```
src/third-parties/
├── dto/
│   ├── create-third-party.dto.ts    # DTO base para crear terceros
│   ├── create-client.dto.ts         # DTO para crear clientes
│   ├── create-provider.dto.ts       # DTO para crear proveedores
│   └── update-third-party.dto.ts    # DTO para actualizar terceros
├── third-parties.controller.ts      # Controlador con endpoints REST
├── third-parties.service.ts         # Lógica de negocio
├── third-parties.module.ts          # Configuración del módulo
└── README.md                        # Esta documentación
```

## Modelos de Base de Datos

### ThirdParty (Modelo Central)
- **id**: Identificador único
- **name**: Nombre del tercero
- **nit**: Documento de identificación (único por empresa)
- **address**: Dirección física (opcional)
- **phones**: Teléfonos de contacto (opcional)
- **email**: Correo electrónico (opcional, único)
- **website**: Sitio web (opcional)
- **companyId**: ID de la empresa (multi-tenant)
- **createdAt/updatedAt**: Timestamps

### Client (Rol: Cliente)
- **id**: Identificador único
- **creditLimit**: Límite de crédito (default: 0)
- **thirdPartyId**: Referencia al ThirdParty (One-to-One)
- **companyId**: ID de la empresa (redundancia controlada)

### Provider (Rol: Proveedor)
- **id**: Identificador único
- **paymentTerms**: Términos de pago (ej: "Net 30")
- **bankAccount**: Cuenta bancaria
- **thirdPartyId**: Referencia al ThirdParty (One-to-One)
- **companyId**: ID de la empresa (redundancia controlada)

## Endpoints API

### Autenticación
Todos los endpoints requieren autenticación JWT y filtrado por empresa.

### Clientes
- `POST /third-parties/clients` - Crear cliente
  - Roles: `admin`, `sales`
  - Body: `CreateClientDto`

### Proveedores
- `POST /third-parties/providers` - Crear proveedor
  - Roles: `admin`, `purchasing`
  - Body: `CreateProviderDto`

### Terceros (General)
- `GET /third-parties` - Listar todos los terceros
- `GET /third-parties/clients` - Listar solo clientes
- `GET /third-parties/providers` - Listar solo proveedores
- `GET /third-parties/:id` - Obtener tercero específico
- `PATCH /third-parties/:id` - Actualizar tercero
  - Roles: `admin`, `sales`, `purchasing`
- `DELETE /third-parties/:id` - Eliminar tercero
  - Roles: `admin`

## Características de Seguridad

### Multi-tenancy
- Todos los queries filtran por `companyId`
- Aislamiento completo de datos entre empresas
- Validación de pertenencia en operaciones de actualización/eliminación

### Validaciones
- NIT único por empresa
- Email único globalmente
- Validaciones de entrada con class-validator

### Transacciones
- Creación de clientes/proveedores en transacciones atómicas
- Rollback automático en caso de error

## Uso del Servicio

```typescript
// Inyectar el servicio
constructor(private thirdPartiesService: ThirdPartiesService) {}

// Crear un cliente
const client = await this.thirdPartiesService.createClient(
  createClientDto, 
  companyId
);

// Crear un proveedor
const provider = await this.thirdPartiesService.createProvider(
  createProviderDto, 
  companyId
);

// Listar todos los terceros
const thirdParties = await this.thirdPartiesService.findAll(companyId);
```

## DTOs

### CreateThirdPartyDto
```typescript
{
  name: string;        // Requerido
  nit: string;         // Requerido
  address?: string;    // Opcional
  phones?: string;     // Opcional
  email?: string;      // Opcional, debe ser email válido
  website?: string;    // Opcional
}
```

### CreateClientDto
Extiende `CreateThirdPartyDto` y añade:
```typescript
{
  creditLimit?: number; // Opcional, default: 0
}
```

### CreateProviderDto
Extiende `CreateThirdPartyDto` y añade:
```typescript
{
  paymentTerms?: string; // Opcional
  bankAccount?: string;  // Opcional
}
```

### UpdateThirdPartyDto
Todos los campos de `CreateThirdPartyDto` como opcionales usando `PartialType`.

