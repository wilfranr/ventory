import { Component, OnInit, inject } from '@angular/core';
import { NonNullableFormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { FileUploadModule } from 'primeng/fileupload';
import { MessageService } from 'primeng/api';
import { CompanyService, CompanySettings } from '../../services/company.service';
import { AuthService } from '../../services/auth.service';
import { SessionService } from '../../services/session.service';
import { CompanyContextService } from '../../services/company-context.service';
import { CompanyThemeService } from '../../services/company-theme.service';
import { LayoutService } from '../../layout/service/layout.service';
import { AppConfigurator } from '../../layout/component/app.configurator';

@Component({
    selector: 'app-company-settings',
    standalone: true,
    templateUrl: './company-settings.component.html',
    styleUrl: './company-settings.component.scss',
    imports: [CommonModule, DropdownModule, InputNumberModule, InputTextModule, ButtonModule, ToastModule, ReactiveFormsModule, FileUploadModule, AppConfigurator],
    providers: [MessageService]
})
export class CompanySettingsComponent implements OnInit {
    private fb = inject(NonNullableFormBuilder);
    private companyService = inject(CompanyService);
    private messageService = inject(MessageService);
    private auth = inject(AuthService);
    private session = inject(SessionService);
    private companyContext = inject(CompanyContextService);
    private companyThemeService = inject(CompanyThemeService);
    private layoutService = inject(LayoutService);

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
        logo: ['']
    });
    logoPreview: string | null = null;
    private logoFile: File | null = null;

    currencies = [
        { label: 'COP', value: 'COP' },
        { label: 'USD', value: 'USD' },
        { label: 'EUR', value: 'EUR' }
    ];

    readonlyMode = false;

    constructor() {}

    ngOnInit() {
        const role = this.auth.currentUser?.role?.name || this.auth.currentUser?.role;
        this.readonlyMode = role !== 'admin' && role !== 'superadmin' && role !== 'propietario';
        if (this.readonlyMode) {
            this.form.disable();
        }
        const activeCompanyId = this.companyContext.getActiveCompanyId();
        const companyId = activeCompanyId || this.session.companyId;
        if (companyId) {
            // Cargar configuración general
            this.companyService.getSettings(companyId).subscribe({
                next: (data) => {
                    this.form.patchValue(data);
                    if (data.logo) {
                        this.logoPreview = data.logo;
                        // Actualizar la sesión con el logo actual de la empresa
                        this.session.updateCompany(data.name, data.logo);
                    }
                },
                error: () =>
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'No se pudieron cargar los parámetros.'
                    })
            });

            // Cargar configuración de estilos (el AppConfigurator se encarga de aplicarlos)
            this.companyThemeService.getThemeSettings(companyId).subscribe({
                next: (themeData) => {
                    // Los estilos se aplicarán automáticamente por el LayoutService
                    console.log('Estilos de empresa cargados:', themeData);
                },
                error: (error) => {
                    console.warn('No se pudieron cargar los estilos de la empresa:', error);
                }
            });
        }
    }

    onLogoSelect(event: { files: File[] }) {
        if (event.files.length > 0) {
            this.logoFile = event.files[0];
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.logoPreview = e.target.result;
            };
            reader.readAsDataURL(this.logoFile as Blob);
        }
    }

    onLogoClear() {
        this.logoFile = null;
        this.logoPreview = null;
    }

    getCurrentCompanyId(): string | null {
        const activeCompanyId = this.companyContext.getActiveCompanyId();
        return activeCompanyId || this.session.companyId;
    }

    save() {
        console.log('Form validity:', this.form.valid);
        console.log('Form values:', this.form.getRawValue());
        console.log('Readonly mode:', this.readonlyMode);

        if (this.form.invalid || this.readonlyMode) {
            console.log('Save method returned early due to invalid form or readonly mode.');
            return;
        }
        const activeCompanyId = this.companyContext.getActiveCompanyId();
        const companyId = activeCompanyId || this.session.companyId;
        console.log('Company ID:', companyId);
        if (!companyId) {
            console.error('Company ID is missing. Cannot save.');
            return;
        }

        const formData = this.form.getRawValue();
        
        // Solo guardar datos generales (los estilos los maneja el AppConfigurator)
        const generalSettings: CompanySettings = {
            name: formData.name,
            nit: formData.nit,
            email: formData.email,
            address: formData.address,
            phones: formData.phones,
            website: formData.website,
            currency: formData.currency,
            vatPercent: formData.vatPercent,
            logo: formData.logo
        };

        this.companyService.updateSettings(companyId, generalSettings, this.logoFile).subscribe({
            next: (res) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Guardado',
                    detail: 'Parámetros actualizados'
                });

                const newName = this.form.controls.name.value;
                const newLogoUrl = res.logoUrl || this.logoPreview;

                if (newName && newLogoUrl) {
                    this.session.updateCompany(newName, newLogoUrl);
                }

                if (res.logoUrl) {
                    this.logoPreview = res.logoUrl;
                    this.form.controls.logo.setValue(res.logoUrl);
                }
            },
            error: (err) => {
                console.error('Error saving settings:', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudieron guardar los cambios'
                });
            }
        });
    }
}
