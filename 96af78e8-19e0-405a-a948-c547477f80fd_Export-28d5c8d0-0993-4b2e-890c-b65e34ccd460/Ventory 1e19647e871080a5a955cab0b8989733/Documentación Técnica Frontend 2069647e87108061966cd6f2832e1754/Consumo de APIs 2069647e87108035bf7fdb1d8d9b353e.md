# Consumo de APIs

# Consumo de APIs

El frontend de Ventory se comunica con el backend a través de servicios HTTP utilizando `HttpClient` de Angular.

---

## Prefijo de rutas

Todas las rutas de la API están bajo el prefijo `/api`.

- **Obtener usuarios:**`GET <http://localhost:3001/api/users`>

> Recomendación:
> 
> 
> Centraliza la URL base en los archivos de entorno (`environment.ts`) para facilitar cambios entre ambientes de desarrollo y producción.
> 

---

## Autenticación

- La API utiliza autenticación mediante **JWT Bearer Token**.
- Para consumir endpoints protegidos, debes enviar el header:

Authorization: Bearer <tu_token>

- El token se obtiene desde el endpoint de login:
    
    `POST <http://localhost:3001/api/auth/login`>
    
- Se recomienda utilizar un **interceptor de Angular** para agregar automáticamente el token a cada petición saliente.

---

## Documentación automática (Swagger)

- Consulta y prueba todos los endpoints de la API de forma interactiva en:
    
    [http://localhost:3001/api/docs](http://localhost:3001/api/docs)
    
- Swagger muestra rutas, parámetros, modelos de datos, ejemplos y permite autenticarse para probar endpoints protegidos.

---

## Buenas prácticas

- Crea un servicio por cada módulo principal (ejemplo: `users.service.ts` para usuarios, `roles.service.ts` para roles, etc).
- Centraliza la URL base de la API en los archivos de entorno (`environment.ts`).
- Maneja los errores y respuestas utilizando interceptores y operadores como `catchError`.
- Usa modelos (`interfaces` o `types`) para tipar las respuestas del backend y facilitar el desarrollo.
- Documenta en esta sección cualquier integración especial: paginación, filtros, headers personalizados, manejo de archivos, etc.

---

## Ejemplo de servicio Angular para usuarios

```tsx
@Injectable({ providedIn: 'root' })
export class UsersService {
  private apiUrl = environment.apiUrl + '/users';

  constructor(private http: HttpClient) {}

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  create(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  // Otros métodos: update, delete, etc.
}

```

Ejemplo de petición con `curl`

curl -X GET '[http://localhost:3001/api/users](http://localhost:3001/api/users)' \
-H 'accept: application/json' \
-H 'Authorization: Bearer <tu_token>'

## Notas

- La autenticación y manejo de tokens JWT se realiza mediante interceptores en Angular.
- Mantén los nombres de métodos claros y descriptivos (`getAll`, `create`, `update`, `delete`).
- Actualiza aquí cualquier integración especial (por ejemplo: paginación, filtros, headers personalizados, manejo de archivos, carga/descarga de documentos, etc.).
- Si la API está desplegada en otro entorno (producción, pruebas), especifica también la URL correspondiente.