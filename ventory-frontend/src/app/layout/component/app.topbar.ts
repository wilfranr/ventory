import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { LayoutService } from '../service/layout.service';
import { AuthService } from '../../services/auth.service';
import { SessionService } from '../../services/session.service';
import { CompanyContextService } from '../../services/company-context.service';
import { CompanyService } from '../../services/company.service';
import { take } from 'rxjs/operators';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule],
    template: ` <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
                <i class="pi pi-bars"></i>
            </button>
            <a class="layout-topbar-logo" routerLink="/">
                <img [src]="logoUrl || 'assets/images/Logo-ventory5.png'" alt="Ventory Logo" />
                <span *ngIf="!isSuperAdmin">{{ companyName || 'VENTORY' }}</span>
                <span *ngIf="isSuperAdmin">{{ activeCompanyName || 'Seleccionar Empresa' }}</span>
            </a>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
                    <i [ngClass]="{ 'pi ': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }"></i>
                </button>
            </div>

            <button class="layout-topbar-menu-button layout-topbar-action" pStyleClass="@next" enterFromClass="hidden" enterActiveClass="animate-scalein" leaveToClass="hidden" leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true">
                <i class="pi pi-ellipsis-v"></i>
            </button>

            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">
                    <button *ngIf="isSuperAdmin" type="button" class="layout-topbar-action" (click)="changeCompany()">
                        <i class="pi pi-building"></i>
                        <span>Cambiar Empresa</span>
                    </button>
                    <button type="button" class="layout-topbar-action">
                        <i class="pi pi-calendar"></i>
                        <span>Calendar</span>
                    </button>
                    <button type="button" class="layout-topbar-action">
                        <i class="pi pi-inbox"></i>
                        <span>Messages</span>
                    </button>

                    <!-- Botón de perfil tipo paleta -->
                    <div class="relative">
                        <button class="layout-topbar-action" pStyleClass="@next" enterFromClass="hidden" enterActiveClass="animate-scalein" leaveToClass="hidden" leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true">
                            <i class="pi pi-user"></i>
                            <span class="ml-2">Perfil</span>
                        </button>

                        <!-- Dropdown personalizado -->
                        <div class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow z-50 hidden">
                            <div class="py-2">
                                <p class="px-4 py-2 text-gray-700 dark:text-gray-200">{{ firstName }}</p>
                                <p class="px-4 py-2 text-gray-500 dark:text-gray-400">{{ rol }}</p>
                                <hr class="border-gray-200 dark:border-gray-700" />
                                <button class="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"><i class="pi pi-cog mr-2"></i> Configuración</button>
                                <button class="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700" (click)="layoutService.onMenuToggle()"><i class="pi pi-users mr-2"></i> Usuarios</button>
                            </div>
                            <button class="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700" (click)="logout()"><i class="pi pi-sign-out mr-2"></i> Cerrar sesión</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`
})
export class AppTopbar implements OnInit {
    items!: MenuItem[];
    userName: string | null = null;
    firstName: string | null = null;
    rol: string | null = null;
    companyName: string | null = null;
    logoUrl: string | null = null;
    isSuperAdmin = false;
    activeCompanyName: string | null = null;

    constructor(
        public layoutService: LayoutService,
        private auth: AuthService,
        private session: SessionService,
        private companyContext: CompanyContextService,
        private companyService: CompanyService,
        private router: Router
    ) {}

    ngOnInit() {
        this.isSuperAdmin = this.auth.hasRole('superadmin');

        // Suscribirse a los datos de la sesión del usuario
        this.session.companyName$.subscribe(name => {
            this.companyName = name;
        });

        if (this.isSuperAdmin) {
            // Para superadmin, manejar el logo basado en la empresa activa
            this.companyContext.activeCompanyId$.subscribe(companyId => {
                if (companyId) {
                    this.companyService.getSettings(companyId).subscribe(settings => {
                        this.activeCompanyName = settings.name;
                        // Actualizar el logo de la empresa activa
                        this.logoUrl = settings.logo || null;
                    });
                } else {
                    this.activeCompanyName = null;
                    // Restaurar el logo original del usuario cuando no hay empresa seleccionada
                    this.session.logoUrl$.pipe(take(1)).subscribe(url => {
                        this.logoUrl = url;
                    });
                }
            });
        } else {
            // Para usuarios normales, usar el logo de su empresa
            this.session.logoUrl$.subscribe(url => {
                this.logoUrl = url;
            });
        }

        // También escuchar cambios en la sesión para actualizar el logo cuando se actualiza la empresa
        this.session.logoUrl$.subscribe(url => {
            // Solo actualizar si no es superadmin o si no hay empresa activa seleccionada
            if (!this.isSuperAdmin || !this.companyContext.getActiveCompanyId()) {
                this.logoUrl = url;
            }
        });

        this.userName = localStorage.getItem('userName');

        const userJson = localStorage.getItem('user');
        if (userJson) {
            const user = JSON.parse(userJson);
            this.rol = user.role?.name || 'Sin rol';
            if (user.name) {
                this.firstName = user.name.split(' ')[0];
            }
        } else {
            this.rol = 'Sin rol';
        }
    }

    toggleDarkMode() {
        const currentTheme = this.layoutService.layoutConfig().darkTheme;
        this.layoutService.setThemeMode(currentTheme ? 'light' : 'dark');
    }

    logout() {
        this.auth.logout();
        this.companyContext.clearActiveCompany();
    }

    changeCompany() {
        this.router.navigate(['/select-company']);
    }
}
