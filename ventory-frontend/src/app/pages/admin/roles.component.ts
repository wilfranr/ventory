import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';

@Component({
    standalone: true,
    selector: 'app-roles',
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, DialogModule, InputTextModule, CheckboxModule, ConfirmDialogModule, MultiSelectModule, ToolbarModule, TagModule, InputIconModule, IconFieldModule],
    templateUrl: './roles.component.html',
    providers: [HttpClient, ConfirmationService]
})
export class RolesComponent implements OnInit {
    roles: any[] = [];
    permissions: any[] = [];
    role: any = { name: '', permissions: [] };
    selectedRoles: any[] = [];
    roleDialog = false;
    submitted = false;

    constructor(private http: HttpClient) {}

    ngOnInit() {
        this.loadRoles();
        this.loadPermissions();
    }

    loadRoles() {
        this.http.get('/api/roles').subscribe((data: any) => (this.roles = data));
    }

    loadPermissions() {
        this.http.get('/api/permissions').subscribe((data: any) => (this.permissions = data));
    }

    openNewRoleDialog() {
        this.role = { name: '', permissions: [] };
        this.roleDialog = true;
        this.submitted = false;
    }

    editRole(role: any) {
        this.role = { ...role, permissions: [...role.permissions] };
        this.roleDialog = true;
        this.submitted = false;
    }

    saveRole() {
        this.submitted = true;
        if (!this.role.name) return;

        if (this.role.id) {
            const payload = {
                permissionIds: this.role.permissions.map((p: any) => (typeof p === 'string' ? p : p.id))
            };
            this.http.patch(`/api/roles/${this.role.id}/permissions`, payload).subscribe(() => {
                this.loadRoles();
                this.roleDialog = false;
            });
        } else {
            const payload = {
                name: this.role.name
            };
            this.http.post('/api/roles', payload).subscribe(() => {
                this.loadRoles();
                this.roleDialog = false;
            });
        }
    }

    deleteRole(role: any) {
        // Lógica para eliminar individual (usa confirmdialog)
    }

    deleteSelectedRoles() {
        // Lógica para eliminar en lote
    }

    onGlobalFilter(dt: any, event: Event) {
        const input = event.target as HTMLInputElement;
        dt.filterGlobal(input.value, 'contains');
    }

    hideRoleDialog() {
        this.roleDialog = false;
    }
}
