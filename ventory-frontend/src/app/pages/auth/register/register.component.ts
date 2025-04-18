import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    imports: [ReactiveFormsModule, FormsModule, InputTextModule, PasswordModule, ButtonModule],
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
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],

            // Campos para crear empresa
            companyName: [''],
            nit: [''],
            address: [''],
            phones: [''],
            companyEmail: [''],
            website: [''],
            logo: [null],

            // Campo para token si se une a una empresa
            token: ['']
        });
    }

    switchMode(mode: 'newCompany' | 'joinCompany') {
        this.registerMode = mode;
        if (mode === 'newCompany') {
            this.registerForm.get('token')?.reset();
        } else {
            this.registerForm.get('companyName')?.reset();
            this.registerForm.get('nit')?.reset();
            this.registerForm.get('address')?.reset();
            this.registerForm.get('phones')?.reset();
            this.registerForm.get('companyEmail')?.reset();
            this.registerForm.get('website')?.reset();
            this.registerForm.get('logo')?.reset();
        }
    }

    onFileChange(event: any) {
        const file = event.target.files[0];
        this.registerForm.patchValue({ logo: file });
    }

    onSubmit() {
        if (this.registerForm.invalid) return;

        const formData = new FormData();

        Object.entries(this.registerForm.value).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                // Si es un archivo (logo)
                if (key === 'logo' && value instanceof File) {
                    formData.append(key, value);
                } else {
                    formData.append(key, value.toString());
                }
            }
        });

        this.authService.register(formData).subscribe(() => {
            this.router.navigate(['/login']);
        });
    }
}
