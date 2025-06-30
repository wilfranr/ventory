import { Component } from '@angular/core';
import { ListTypeService } from './list-type.service';
import { DropdownModule } from 'primeng/dropdown';
import { ListItemComponent } from './list-item.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { TabsModule } from 'primeng/tabs';
import { ListItemService } from './list-item.service';
import { SessionService } from '../../services/session.service';

@Component({
    selector: 'app-list-page',
    imports: [DropdownModule, ListItemComponent, CommonModule, FormsModule, ToastModule, TabsModule],
    templateUrl: './list-page.component.html',
    styleUrl: './list-page.component.scss',
    standalone: true
})
export class ListPageComponent {
    listTypes: any[] = [];
    selectedTypeId: number | null = null;
    typeDialogVisible = false;
    selectedTabIndex = 0;
    showDelete = false;
    listItems: any[] = [];
    companyId: string = '';

    constructor(
        private listTypeService: ListTypeService,
        private listItemService: ListItemService,
        private session: SessionService
    ) {}

    ngOnInit() {
        this.reloadListTypes();
        this.companyId = this.session.companyId ?? '';
        this.loadListItems();
    }

    reloadListTypes() {
        this.listTypeService.getAll().subscribe((types) => {
            this.listTypes = [{ id: null, name: 'Todos' }, ...types, { id: '__deleted__', name: 'Eliminadas' }];
            this.selectedTabIndex = 0;
            this.selectedTypeId = this.listTypes[0].id;
        });
    }

    onTabChange(i: number) {
        this.selectedTabIndex = i;
        const tipo = this.listTypes[i]?.id;

        if (tipo === '__deleted__') {
            this.showDelete = true;
            this.selectedTypeId = null;
        } else {
            this.showDelete = false;
            this.selectedTypeId = tipo ?? null;
        }
        this.loadListItems();
    }

    openTypeDialog() {
        this.typeDialogVisible = true;
    }

    onTypeSaved(newType?: any) {
        this.typeDialogVisible = false;
        this.reloadListTypes();

        if (newType && newType.id) {
            this.selectedTypeId = newType.id;
        }
    }

    loadListItems() {
        const active = this.showDelete ? 'false' : 'true';
        this.listItemService.getAll(active, this.selectedTypeId ?? undefined).subscribe((items) => {
            console.log('🔍 Datos recibidos para la tabla:', items);
            this.listItems = items;
        });
    }
}
