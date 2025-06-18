import { Component } from '@angular/core';
import { ListTypeService } from './list-type.service';
import { DropdownModule } from 'primeng/dropdown';
import { ListItemComponent } from './list-item.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// import { ListTypeComponent } from './list-type.component';

@Component({
    selector: 'app-list-page',
    imports: [DropdownModule, ListItemComponent, CommonModule, FormsModule],
    templateUrl: './list-page.component.html',
    styleUrl: './list-page.component.scss',
    standalone: true
})
export class ListPageComponent {
    listTypes: any[] = [];
    selectedTypeId: number | null = null;
    typeDialogVisible = false;

    constructor(private listTypeService: ListTypeService) {}

    ngOnInit() {
        this.reloadListTypes();
    }

    reloadListTypes() {
        this.listTypeService.getAll().subscribe((types) => {
            // Agrega la opción "Todos" al inicio
            this.listTypes = [{ id: null, name: 'Todos' }, ...types];
        });
    }

    openTypeDialog() {
        this.typeDialogVisible = true;
    }

    onTypeSaved(newType?: any) {
        this.typeDialogVisible = false;
        this.reloadListTypes();

        // Si el modal retorna el nuevo tipo creado, puedes hacer:
        if (newType && newType.id) {
            this.selectedTypeId = newType.id;
        }
    }
}
