# Gestión de estado

La gestión de estado en el frontend es clave para mantener la sincronización entre los datos de la aplicación y la interfaz de usuario.

En Ventory, el enfoque de gestión de estado puede variar según la complejidad de cada módulo y los requerimientos de la aplicación.

---

## Estrategia principal

Actualmente, la gestión de estado en Ventory se implementa utilizando:

- **Servicios de Angular (RxJS Subjects/BehaviorSubjects):**
Para módulos simples y medianamente complejos, se usan servicios inyectables que mantienen y distribuyen el estado a través de Observables.
- **LocalStorage/SessionStorage:**
Para guardar datos simples que deben persistir entre sesiones (por ejemplo, usuario autenticado, token JWT).

---

## Ejemplo con servicios y RxJS

```tsx
@Injectable({ providedIn: 'root' })
export class UserStateService {
  private usersSubject = new BehaviorSubject<User[]>([]);
  users$ = this.usersSubject.asObservable();

  setUsers(users: User[]) {
    this.usersSubject.next(users);
  }

  addUser(user: User) {
    const current = this.usersSubject.value;
    this.usersSubject.next([...current, user]);
  }

  // Otros métodos para actualizar/eliminar usuarios...
}

```

## Uso en componentes

```jsx
@Component({...})
export class UserListComponent implements OnInit {
users$ = this.userStateService.users$;

constructor(private userStateService: UserStateService) {}

ngOnInit() {
// Suscribirse y usar usuarios
}
}
```