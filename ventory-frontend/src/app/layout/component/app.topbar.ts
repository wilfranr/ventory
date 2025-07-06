import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '../service/layout.service';
import { AuthService } from '../../services/auth.service';
import { SessionService } from '../../services/session.service';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, AppConfigurator],
    template: ` <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
                <i class="pi pi-bars"></i>
            </button>
            <a class="layout-topbar-logo" routerLink="/">
                <img [src]="logoUrl || 'assets/images/Logo-ventory5.png'" alt="Ventory Logo" style="height: 70px;" />
                <span>{{ companyName || 'VENTORY' }}</span>
            </a>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
                    <i [ngClass]="{ 'pi ': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }"></i>
                </button>
                <div class="relative">
                    <button
                        class="layout-topbar-action layout-topbar-action-highlight"
                        pStyleClass="@next"
                        enterFromClass="hidden"
                        enterActiveClass="animate-scalein"
                        leaveToClass="hidden"
                        leaveActiveClass="animate-fadeout"
                        [hideOnOutsideClick]="true"
                    >
                        <i class="pi pi-palette"></i>
                    </button>
                    <app-configurator />
                </div>
            </div>

            <button class="layout-topbar-menu-button layout-topbar-action" pStyleClass="@next" enterFromClass="hidden" enterActiveClass="animate-scalein" leaveToClass="hidden" leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true">
                <i class="pi pi-ellipsis-v"></i>
            </button>

            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">
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

    constructor(
        public layoutService: LayoutService,
        private auth: AuthService,
        private session: SessionService
    ) {}

    ngOnInit() {
        this.session.companyName$.subscribe(name => this.companyName = name);
        this.session.logoUrl$.subscribe(url => this.logoUrl = url);

        const userJson = localStorage.getItem('user');
        if (userJson) {
            const user = JSON.parse(userJson);
            this.rol = user?.role?.name || 'Sin rol';
            if (user.name) {
                this.firstName = user.name.split(' ')[0];
            }
        } else {
            this.rol = 'Sin rol';
        }
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }

    logout() {
        this.auth.logout();
    }
}
