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
/**
 * Página principal para la administración de listas.
 * Permite filtrar los ítems por tipo y gestionar
 * la visualización de elementos activos o eliminados.
 */
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

    /**
     * Inicializa la página cargando tipos e ítems.
     */
    ngOnInit() {
        this.reloadListTypes();
        this.companyId = this.session.companyId ?? '';
        this.loadListItems();
    }

    /**
     * Obtiene nuevamente todos los tipos de lista y
     * establece el tab y tipo seleccionado por defecto.
     */
    reloadListTypes() {
        this.listTypeService.getAll().subscribe((types) => {
            this.listTypes = [{ id: null, name: 'Todos' }, ...types, { id: '__deleted__', name: 'Eliminadas' }];
            this.selectedTabIndex = 0;
            this.selectedTypeId = this.listTypes[0].id;
        });
    }

    /**
     * Maneja el cambio de pestaña para filtrar ítems.
     * @param i índice de la pestaña seleccionada
     */
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

    /** Abre el diálogo para crear un nuevo tipo de lista */
    openTypeDialog() {
        this.typeDialogVisible = true;
    }

    /**
     * Callback luego de guardar un tipo.
     * @param newType tipo creado opcionalmente
     */
    onTypeSaved(newType?: any) {
        this.typeDialogVisible = false;
        this.reloadListTypes();

        if (newType && newType.id) {
            this.selectedTypeId = newType.id;
        }
    }

    /** Carga los ítems según el filtro actual */
    loadListItems() {
        const active = this.showDelete ? 'false' : 'true';
        this.listItemService.getAll(active, this.selectedTypeId ?? undefined).subscribe((items) => {
            console.log('🔍 Datos recibidos para la tabla:', items);
            this.listItems = items;
        });
    }
}
