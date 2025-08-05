import { Component, OnInit } from '@angular/core';
import { CompanyService } from '../../services/company.service';
import { Company } from '../../models/company.model';
import { CompanyContextService } from '../../services/company-context.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';

@Component({
    selector: 'app-select-company',
    standalone: true,
    imports: [CommonModule, ButtonModule, DataViewModule],
    templateUrl: './select-company.component.html',
    styleUrls: ['./select-company.component.scss']
})
export class SelectCompanyComponent implements OnInit {
    companies$!: Observable<Company[]>;

    constructor(
        private companyService: CompanyService,
        private companyContextService: CompanyContextService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.companies$ = this.companyService.getCompanies().pipe(map((companies) => companies.filter((company) => company && company.id && company.name)));
        console.log(this.companies$);
    }

    selectCompany(companyId: string): void {
        this.companyContextService.setActiveCompany(companyId);
        this.router.navigate(['/']);
    }
}
