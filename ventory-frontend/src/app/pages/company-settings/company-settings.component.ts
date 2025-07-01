import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CompanyService, CompanySettings } from '../../services/company.service';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-company-settings',
    standalone: true,
    templateUrl: './company-settings.component.html',
    styleUrl: './company-settings.component.scss',
    imports: [CommonModule, ReactiveFormsModule, DropdownModule, InputNumberModule, ButtonModule, ToastModule],
    providers: [MessageService]
})
export class CompanySettingsComponent implements OnInit {
    form = this.fb.group({
        currency: ['', Validators.required],
        vatPercent: [0, [Validators.required, Validators.min(0), Validators.max(100)]]
    });

    currencies = [
        { label: 'COP', value: 'COP' },
        { label: 'USD', value: 'USD' },
        { label: 'EUR', value: 'EUR' }
    ];

    readonlyMode = false;

    constructor(
        private fb: FormBuilder,
        private companyService: CompanyService,
        private messageService: MessageService,
        private auth: AuthService
    ) {}

    ngOnInit() {
        const role = this.auth.currentUser?.role?.name || this.auth.currentUser?.role;
        this.readonlyMode = role !== 'admin' && role !== 'superadmin';
        if (this.readonlyMode) {
            this.form.disable();
        }

        const companyId = this.auth.companyId;
        if (companyId) {
            this.companyService.getSettings(companyId).subscribe({
                next: (data) => this.form.patchValue(data),
                error: () =>
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'No se pudieron cargar los parámetros.'
                    })
            });
        }
    }

    save() {
        if (this.form.invalid || this.readonlyMode) return;
        const companyId = this.auth.companyId;
        if (!companyId) return;

        const payload = this.form.value as CompanySettings;
        this.companyService.updateSettings(companyId, payload).subscribe({
            next: () =>
                this.messageService.add({
                    severity: 'success',
                    summary: 'Guardado',
                    detail: 'Parámetros actualizados'
                }),
            error: () =>
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudieron guardar los cambios'
                })
        });
    }
}
