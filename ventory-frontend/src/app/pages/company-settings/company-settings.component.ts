import { Component, OnInit, inject } from '@angular/core';
import { NonNullableFormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
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
    imports: [CommonModule, DropdownModule, InputNumberModule, InputTextModule, ButtonModule, ToastModule, ReactiveFormsModule],
    providers: [MessageService]
})
export class CompanySettingsComponent implements OnInit {
    private fb = inject(NonNullableFormBuilder);
    private companyService = inject(CompanyService);
    private messageService = inject(MessageService);
    private auth = inject(AuthService);

    form = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
        nit: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
        email: ['', [Validators.required, Validators.email]],
        address: ['', [Validators.maxLength(200)]],
        phones: ['', [Validators.maxLength(100)]],
        website: ['', [Validators.maxLength(100)]],
        currency: ['', Validators.required],
        vatPercent: this.fb.control(0, {
            validators: [Validators.required, Validators.min(0), Validators.max(100)]
        }),
        logo: ['', [Validators.maxLength(255)]]
    });
    currencies = [
        { label: 'COP', value: 'COP' },
        { label: 'USD', value: 'USD' },
        { label: 'EUR', value: 'EUR' }
    ];
    readonlyMode = false;

    constructor() {}

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

    get logoPreview(): string | null {
        const value = this.form.get('logo')?.value;
        if (!value) return null;
        try {
            new URL(value);
            return value;
        } catch {
            return null;
        }
    }
}
