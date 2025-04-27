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

interface User {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
    status?: string;
}

@Component({
    selector: 'app-users',
    standalone: true,
    imports: [ToolbarModule, ButtonModule, TableModule, InputTextModule, InputIconModule, DropdownModule, DialogModule, ConfirmDialogModule, TagModule, IconFieldModule, FormsModule, CommonModule, ReactiveFormsModule],
    templateUrl: './users.component.html',
    providers: [MessageService, ConfirmationService]
})
export class UsersComponent implements OnInit {
    // 🔹 Token para invitación
    tokenForm!: FormGroup;
    displayTokenDialog: boolean = false;
    generatedToken: string = '';

    // 🔹 Datos de Usuarios
    users: User[] = []; // Aquí se almacenan todos los usuarios
    selectedUsers: User[] = [];
    cols = [
        { field: 'name', header: 'Nombre' },
        { field: 'email', header: 'Email' },
        { field: 'role', header: 'Rol' },
        { field: 'status', header: 'Estado' }
    ];
    userDialog: boolean = false;
    user: User = {}; // Usuario que se crea o edita
    submitted: boolean = false;

    // 🔹 Roles y estados
    roles = [
        { label: 'Vendedor', value: 'vendedor' },
        { label: 'Analista de Partes', value: 'analistaPartes' },
        { label: 'Logística', value: 'logistica' }
        // Puedes agregar más
    ];
    statuses = [
        { label: 'Activo', value: 'activo' },
        { label: 'Inactivo', value: 'inactivo' }
    ];

    constructor(
        private fb: FormBuilder,
        private registrationTokenService: RegistrationTokenService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private userService: UserService
    ) {}

    ngOnInit() {
        this.tokenForm = this.fb.group({
            role: ['', Validators.required]
        });

        // Cargar usuarios (luego conecto a API, por ahora datos de ejemplo)
        this.loadUsers();
    }
    loadUsers() {
        this.userService.getUsers().subscribe({
            next: (users) => {
                this.users = users;
            },
            error: (error) => {
                const token = localStorage.getItem('access_token');
                console.log(token);
                console.error('Error al cargar usuarios', error);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los usuarios.' });
            }
        });
    }

    // 🔹 Lógica para Tokens
    showTokenDialog() {
        this.displayTokenDialog = true;
        this.generatedToken = '';
    }

    closeTokenDialog() {
        this.displayTokenDialog = false;
    }

    generateToken() {
        if (this.tokenForm.valid) {
            this.registrationTokenService.createToken(this.tokenForm.value).subscribe({
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

    copyToken() {
        navigator.clipboard.writeText(this.generatedToken);
        this.messageService.add({ severity: 'info', summary: 'Copiado', detail: 'Token copiado al portapapeles.' });
    }

    // 🔹 Lógica para Usuarios (CRUD)

    openNew() {
        this.user = {};
        this.submitted = false;
        this.userDialog = true;
    }

    hideDialog() {
        this.userDialog = false;
        this.submitted = false;
    }

    saveUser() {
        this.submitted = true;

        if (this.user.name && this.user.email && this.user.role && this.user.status) {
            if (this.user.id) {
                // Editar existente
                this.users = this.users.map((u) => (u.id === this.user.id ? this.user : u));
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario actualizado', life: 3000 });
            } else {
                // Crear nuevo
                this.user.id = this.createId();
                this.users.push({ ...this.user });
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario creado', life: 3000 });
            }

            this.userDialog = false;
            this.user = {};
        }
    }

    editUser(user: User) {
        this.user = { ...user };
        this.userDialog = true;
    }

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

    onGlobalFilter(dt: any, event: Event) {
        const input = event.target as HTMLInputElement;
        dt.filterGlobal(input.value, 'contains');
    }

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

    private createId(): string {
        return Math.random().toString(36).substring(2, 9);
    }
}
