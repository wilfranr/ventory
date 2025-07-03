import { Component, inject, OnInit } from '@angular/core';
import { NonNullableFormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CompanyService } from '../../../services/company.service';
import { GeonamesService } from '../../../services/geonames.service';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { FluidModule } from 'primeng/fluid';
import { AppFloatingConfigurator } from '../../../layout/component/app.floatingconfigurator';
import { CommonModule } from '@angular/common';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    imports: [ReactiveFormsModule, FormsModule, InputTextModule, PasswordModule, ButtonModule, DropdownModule, AutoCompleteModule, FluidModule, AppFloatingConfigurator, CommonModule, MessageModule, ToastModule, RouterModule],
    standalone: true,
    providers: [AppFloatingConfigurator, MessageService]
})
export class RegisterComponent implements OnInit {
    private fb = inject(NonNullableFormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);
    private messageService = inject(MessageService);
    private companyService = inject(CompanyService);
    private geonamesService = inject(GeonamesService);

    registerMode: 'newCompany' | 'joinCompany' = 'newCompany';
    registerForm = this.fb.group({
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
        country: [null],
        department: [null],
        city: [null],
        currency: [''],
        vatPercent: [0]
    });

    countries: any[] = [];
    filteredCountries: any[] = [];
    departments: any[] = [];
    filteredDepartments: any[] = [];
    cities: any[] = [];
    filteredCities: any[] = [];

    constructor() {}

    ngOnInit() {
        this.geonamesService.getCountries().subscribe({
            next: (data) => {
                this.countries = data.map((country: any) => ({ name: country.countryName, code: country.isoAlpha2, geonameId: country.geonameId }));
            },
            error: (err) => {
                console.error('Error al cargar países:', err);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los países.' });
            }
        });
    }

    filterCountries(event: any) {
        const query = event.query;
        this.filteredCountries = this.countries.filter(country => country.name.toLowerCase().includes(query.toLowerCase()));
    }

    filterDepartments(event: any) {
        const query = event.query;
        this.filteredDepartments = this.departments.filter(department => department.name.toLowerCase().includes(query.toLowerCase()));
    }

    filterCities(event: any) {
        const query = event.query;
        this.filteredCities = this.cities.filter(city => city.name.toLowerCase().includes(query.toLowerCase()));
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
                logo: null,
                country: null,
                department: null,
                city: null,
                currency: '',
                vatPercent: 0
            });
        }
    }

    onCountryChange(event: any) {
        const selectedCountry = event.value;
        if (!selectedCountry) return;

        const countryGeonameId = selectedCountry.geonameId;
        this.geonamesService.getDepartments(countryGeonameId).subscribe({ // Usar geonameId para departamentos
            next: (data) => {
                this.departments = data.map((dept: any) => ({ name: dept.name, code: dept.adminCode1, geonameId: dept.geonameId }));
                this.filteredDepartments = this.departments; // Inicializar sugerencias
            },
            error: (err) => {
                console.error('Error al cargar departamentos:', err);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los departamentos.' });
            }
        });

        const countryCode = selectedCountry.code; // Usar el código ISO para la configuración de la empresa
        this.companyService.getCountrySettings(countryCode).subscribe({
            next: (settings) => {
                this.registerForm.patchValue({
                    currency: settings.currency,
                    vatPercent: settings.vatPercent
                });
            },
            error: (err) => {
                console.error('Error al obtener configuración del país:', err);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la configuración del país.' });
            }
        });

        this.registerForm.get('department')?.reset();
        this.registerForm.get('city')?.reset();
        this.cities = [];
        this.filteredCities = [];
    }

    onDepartmentChange(event: any) {
        const selectedDepartment = event.value;
        if (!selectedDepartment) return;

        const departmentGeonameId = selectedDepartment.geonameId;
        this.geonamesService.getCities(departmentGeonameId).subscribe({
            next: (data) => {
                this.cities = data.map((city: any) => ({ name: city.name, code: city.geonameId, geonameId: city.geonameId }));
                this.filteredCities = this.cities; // Inicializar sugerencias
            },
            error: (err) => {
                console.error('Error al cargar ciudades:', err);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las ciudades.' });
            }
        });
        this.registerForm.get('city')?.reset();
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
                if (key === 'logo' && typeof value === 'object' && value !== null && (value as File) instanceof File) {
                    formData.append(key, value);
                } else if (key === 'country' || key === 'department' || key === 'city') {
                    // Para los campos de autocompletado, enviar solo el nombre o el geonameId si es necesario en el backend
                    formData.append(key, (value as any).name); // O .geonameId si el backend lo espera
                } else if (typeof value === 'object' && value !== null && 'code' in value) { // Manejar otros objetos de dropdown
                    formData.append(key, (value as any).code);
                } else {
                    formData.append(key, value?.toString?.() ?? '');
                }
            }
        });

        this.authService.register(formData).subscribe({
            next: (res) => {
                this.messageService.add({ severity: 'success', summary: 'Registro Exitoso', detail: 'Usuario y empresa registrados correctamente.' });
                this.router.navigate(['/auth/login']);
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Error de Registro', detail: err.error.message || 'Ocurrió un error durante el registro.' });
            }
        });
    }
}
