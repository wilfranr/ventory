import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { FluidModule } from 'primeng/fluid';
import { AppFloatingConfigurator } from '../../../layout/component/app.floatingconfigurator';
import { CommonModule } from '@angular/common';
import { MessageModule } from 'primeng/message';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    imports: [ReactiveFormsModule, FormsModule, InputTextModule, PasswordModule, ButtonModule, FluidModule, AppFloatingConfigurator, CommonModule, MessageModule],
    standalone: true
})
export class RegisterComponent {
    registerMode: 'newCompany' | 'joinCompany' = 'newCompany';
    registerForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.registerForm = this.fb.group({
            // Comunes
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],

            // Para creación de empresa
            companyName: [''],
            nit: [''],
            address: [''],
            phones: [''],
            companyEmail: [''],
            website: [''],
            logo: [null],

            // Para unión por token
            token: ['']
        });
    }

    switchMode(mode: 'newCompany' | 'joinCompany') {
        this.registerMode = mode;

        if (mode === 'newCompany') {
            this.registerForm.get('token')?.reset();
        } else {
            this.registerForm.patchValue({
                companyName: '',
                nit: '',
                address: '',
                phones: '',
                companyEmail: '',
                website: '',
                logo: null
            });
        }
    }

    onFileChange(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.registerForm.patchValue({ logo: file });
        }
    }

    onSubmit() {
        if (this.registerForm.invalid) return;

        const formData = new FormData();

        Object.entries(this.registerForm.value).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                if (key === 'logo' && value instanceof File) {
                    formData.append(key, value);
                } else {
                    formData.append(key, value.toString());
                }
            }
        });

        this.authService.register(formData).subscribe({
            next: () => this.router.navigate(['/auth/login']),
            error: (err) => console.error('❌ Error en registro:', err)
        });
    }
}
