import { AuthService } from '../../services/auth.service';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { MessageModule } from 'primeng/message';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, AppFloatingConfigurator, MessageModule, CommonModule],
    template: `
        <app-floating-configurator />
        <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
            <div class="flex flex-col items-center justify-center">
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                        <div class="text-center mb-8">
                            <img src="assets/images/Logo-ventory5.png" alt="Ventory Logo" class="mb-8 w-32 shrink-0 mx-auto" />

                            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Bienvenido a Ventory</div>

                            <span class="text-muted-color font-medium">Iniciar Sesión</span>
                        </div>
                        <div>
                            <label for="email1" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Email</label>
                            <input pInputText id="email1" type="text" class="w-full md:w-[30rem] mb-8" [(ngModel)]="email" />

                            <label for="password1" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Password</label>
                            <p-password id="password1" [(ngModel)]="password" [toggleMask]="true" styleClass="mb-4" [fluid]="true" [feedback]="false"></p-password>

                            <div class="flex items-center justify-between mt-2 mb-8 gap-8">
                                <div class="flex items-center">
                                    <p-checkbox [(ngModel)]="checked" id="rememberme1" binary class="mr-2"></p-checkbox>
                                    <label for="rememberme1">Recordarme</label>
                                </div>
                                <span class="font-medium no-underline ml-2 text-right cursor-pointer text-primary">Olvidó su contraseña?</span>
                            </div>

                            <p-message *ngIf="errorMessage" severity="error" [text]="errorMessage"></p-message>
                            <p-button label="Iniciar sesión" styleClass="w-full mt-3" (onClick)="onSubmit()" [loading]="loading"> </p-button>
                            <p-button label="¿No te encuentras registrado?" styleClass="w-full mt-3" routerLink="/auth/register" outlined></p-button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class Login {
    email: string = '';

    password: string = '';

    checked: boolean = false;

    loading: boolean = false;

    errorMessage: string = '';

    constructor(private auth: AuthService) {}

    onSubmit() {
        // Validar que los campos no estén vacíos
        if (!this.email || !this.password) {
            this.errorMessage = 'Por favor, completa todos los campos correctamente.';
            return;
        }

        this.loading = true;
        this.errorMessage = ''; // Limpiar mensaje anterior

        const credentials = { email: this.email, password: this.password };

        this.auth.login(credentials).subscribe({
            next: () => {
                this.loading = false;
                // El redireccionamiento ya lo hace el AuthService (por el tap)
            },
            error: (err) => {
                this.loading = false;
                this.errorMessage = err.message || 'Ocurrió un error inesperado.';
            }
        });
    }
}
