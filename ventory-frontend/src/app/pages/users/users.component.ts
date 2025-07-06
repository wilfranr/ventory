import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RegistrationTokenService } from '../../services/registration-token.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { InputIconModule } from 'primeng/inputicon';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { UserService } from '../../services/user.service';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ToastModule } from 'primeng/toast';
import { toTitleCase } from '../../utils/string-utils';
import { RolesService, Role } from '../../services/roles.service';

/**
 * Modelo que representa un usuario dentro del sistema.
 * Cada propiedad es opcional ya que se utiliza tanto para la creación
 * como para la edición de usuarios.
 */
interface User {
    /** Identificador único del usuario */
    id?: string;
    /** Nombre para mostrar */
    name?: string;
    /** Correo electrónico del usuario */
    email?: string;
    /**
     * Rol asignado al usuario. Puede ser el nombre del rol o un
     * objeto con la propiedad `name` proveniente del backend.
     */
    role?: string | { id: string; name: string }; // Actualizado para incluir el ID del rol
    /** Estado de la cuenta: activo/inactivo */
    status?: string;
}

@Component({
    selector: 'app-users',
    standalone: true,
    imports: [ToolbarModule, ButtonModule, TableModule, InputTextModule, InputIconModule, DropdownModule, DialogModule, ConfirmDialogModule, TagModule, IconFieldModule, FormsModule, CommonModule, ReactiveFormsModule, InputSwitchModule, ToastModule],
    templateUrl: './users.component.html',
    providers: [ConfirmationService]
})
/**
 * Componente encargado de la gestión de usuarios.
 * Permite generar tokens de registro y ejecutar operaciones CRUD
 * sobre los usuarios registrados.
 */
export class UsersComponent implements OnInit {
    // 🔹 Token para invitación
    /** Formulario reactivo para seleccionar el rol del nuevo usuario */
    tokenForm!: FormGroup;
    /** Controla la visibilidad del diálogo de generación de token */
    displayTokenDialog: boolean = false;
    /** Token generado para invitar a un nuevo usuario */
    generatedToken: string = '';
    /** Indica si hay una operación en proceso */
    loading: boolean = false;
    // 🔹 Datos de Usuarios
    /** Arreglo con todos los usuarios obtenidos del backend */
    users: User[] = [];
    /** Usuarios seleccionados en la tabla */
    selectedUsers: User[] = [];
    /** Columnas que se muestran en la tabla de usuarios */
    cols = [
        { field: 'name', header: 'Nombre' },
        { field: 'email', header: 'Email' },
        { field: 'role', header: 'Rol' },
        { field: 'status', header: 'Estado' }
    ];
    /** Controla la visibilidad del formulario de usuario */
    userDialog: boolean = false;
    /** Usuario actual que se crea o edita */
    user: User = {};
    /** Indica si se envió el formulario para mostrar mensajes de error */
    submitted: boolean = false;

    // 🔹 Roles y estados

    /** Opciones de roles disponibles para los usuarios */
    roles: { label: string; value: string }[] = []; // Ahora se cargan dinámicamente
    /** Estados posibles del usuario */
    statuses = [
        { label: 'Activo', value: 'activo' },
        { label: 'Inactivo', value: 'inactivo' }
    ];

    /**
     * Inyecta los servicios necesarios para el componente.
     */
    constructor(
        private fb: FormBuilder,
        private registrationTokenService: RegistrationTokenService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private userService: UserService,
        private rolesService: RolesService // Inyectar RolesService
    ) {}

    /** Inicializa el formulario y carga los usuarios */
    ngOnInit() {
        this.tokenForm = this.fb.group({
            role: ['', Validators.required]
        });

        this.loadUsers();
        this.loadRoles(); // Cargar roles dinámicamente
    }

    /** Carga los roles desde el backend */
    loadRoles() {
        this.rolesService.getAllRoles().subscribe({
            next: (roles) => {
                this.roles = roles.map(role => ({ label: role.name, value: role.id }));
            },
            error: (err) => {
                console.error('Error al cargar roles:', err);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los roles.' });
            }
        });
    }

    /** Obtiene los usuarios del backend y los asigna a la tabla */
    loadUsers() {
        this.userService.getUsers().subscribe({
            next: (users) => {
                this.users = users;
            },
            error: (error) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los usuarios.' });
            }
        });
    }

    // 🔹 Lógica para Tokens
    /** Abre el diálogo para generar un nuevo token */
    showTokenDialog() {
        this.displayTokenDialog = true;
        this.generatedToken = '';
    }

    /** Cierra el diálogo de generación de token */
    closeTokenDialog() {
        this.displayTokenDialog = false;
    }

    /** Solicita al backend la creación de un token de registro */
    generateToken() {
        if (this.tokenForm.valid) {
            // Asegurarse de enviar el ID del rol, no el nombre
            const selectedRoleValue = this.tokenForm.value.role; // Esto ya debería ser el ID del rol
            this.registrationTokenService.createToken({ roleId: selectedRoleValue }).subscribe({
                next: (response) => {
                    this.generatedToken = response.token;
                    this.messageService.add({ severity: 'success', summary: 'Token generado', detail: 'Token generado exitosamente.' });
                },
                error: () => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo generar el token.' });
                }
            });
        }
    }

    /** Copia el token generado al portapapeles */
    copyToken() {
        navigator.clipboard.writeText(this.generatedToken);
        this.messageService.add({ severity: 'info', summary: 'Copiado', detail: 'Token copiado al portapapeles.' });
    }

    // 🔹 Lógica para Usuarios (CRUD)

    /** Abre el formulario para editar un usuario */
    openNew() {
        this.user = {};
        this.submitted = false;
        this.userDialog = true;
    }

    /** Cierra el diálogo de edición/creación de usuario */
    hideDialog() {
        this.userDialog = false;
        this.submitted = false;
    }

    /**
     * Objeto base que se envía al backend para crear o actualizar usuarios.
     * Se actualiza con los datos del formulario antes de enviarse.
     */
    userPayload = {
        id: this.user.id ?? this.createId(),
        name: this.user.name,
        email: this.user.email,
        role: this.user.role, // string: 'admin', 'vendedor', etc.
        status: this.user.status ?? 'activo'
    };

    /** Guarda la información del usuario editado */
    saveUser() {
        this.submitted = true;

        // Validación de campos obligatorios
        if (!this.user.name || !this.user.email || !this.user.role || !this.user.status) {
            this.messageService.add({
                severity: 'error',
                summary: 'Campos obligatorios',
                detail: 'Por favor, completa todos los campos.'
            });
            return;
        }

        // Solo edición (por tu lógica actual)
        if (!this.user.id) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se puede crear un nuevo usuario desde este formulario.'
            });
            return;
        }

        // Adaptar formato de rol: ahora siempre será un ID de rol
        const roleId = typeof this.user.role === 'object' ? this.user.role.id : this.user.role; // Asegurarse de enviar el ID

        const userPayload = {
            name: toTitleCase(this.user.name),
            email: this.user.email,
            role: roleId, // Enviar el ID del rol
            status: this.user.status ?? 'activo'
        };

        this.loading = true;

        this.userService.updateUser(this.user.id, userPayload).subscribe({
            next: () => {
                this.loading = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Usuario actualizado',
                    life: 3000
                });
                this.loadUsers();
                this.userDialog = false;
                this.user = {};
            },
            error: (err) => {
                this.loading = false;
                // Mensaje adaptado según posible error del backend
                let detail = 'No se pudo actualizar el usuario.';
                if (err.status === 409) {
                    detail = 'El correo electrónico ya está en uso.';
                }
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail
                });
            }
        });
    }

    /** Carga los datos de un usuario en el formulario para su edición */
    editUser(user: User) {
        this.user = {
            ...user,
            // Asegurarse de que el rol se muestre correctamente en el dropdown
            role: typeof user.role === 'object' ? user.role.id : user.role,
            status: user.status ?? 'activo' // valor por defecto si está vacío
        };
        this.userDialog = true;
    }
    /** Pregunta confirmación y elimina un usuario de la tabla */
    deleteUser(user: User) {
        this.confirmationService.confirm({
            message: `¿Seguro que quieres eliminar a ${user.name}?`,
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.users = this.users.filter((val) => val.id !== user.id);
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario eliminado', life: 3000 });
            }
        });
    }

    /** Elimina todos los usuarios seleccionados tras confirmación */
    deleteSelectedUsers() {
        this.confirmationService.confirm({
            message: '¿Seguro que quieres eliminar los usuarios seleccionados?',
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.users = this.users.filter((val) => !this.selectedUsers.includes(val));
                this.selectedUsers = [];
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuarios eliminados', life: 3000 });
            }
        });
    }

    /** Aplica el filtro global de la tabla */
    onGlobalFilter(dt: any, event: Event) {
        const input = event.target as HTMLInputElement;
        dt.filterGlobal(input.value, 'contains');
    }

    /**
     * Devuelve la severidad del tag según el estado del usuario
     * para mostrar estilos en la tabla.
     */
    getStatusSeverity(status: string) {
        switch (status) {
            case 'activo':
                return 'success';
            case 'inactivo':
                return 'danger';
            default:
                return 'info';
        }
    }

    /** Genera un identificador aleatorio para usuarios locales */
    private createId(): string {
        return Math.random().toString(36).substring(2, 9);
    }
}
