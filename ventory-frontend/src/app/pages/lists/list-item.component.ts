import { Component, OnChanges, OnInit, SimpleChanges, input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ListItemService } from './list-item.service';
import { ListItem } from './list-item.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToolbarModule } from 'primeng/toolbar';
import { DropdownModule } from 'primeng/dropdown';
import { ListTypeService } from './list-type.service';
// import { ListTypeComponent } from './list-type.component';
import { ListType } from './list-type.model';
import { IconFieldModule } from 'primeng/iconfield';
import { TagModule } from 'primeng/tag';
import { forkJoin } from 'rxjs';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
    selector: 'app-list-item',
    templateUrl: './list-item.component.html',
    standalone: true,
    imports: [TableModule, ConfirmDialogModule, DialogModule, InputTextModule, ButtonModule, ToastModule, FormsModule, ReactiveFormsModule, FormsModule, CommonModule, ToolbarModule, DropdownModule, IconFieldModule, TagModule, InputIconModule],
    providers: [MessageService, ConfirmationService]
})
export class ListItemComponent implements OnInit, OnChanges {
    readonly listTypeId = input<number | null>(null);
    listItems: ListItem[] = [];
    listTypes: any[] = [];
    typeDialogVisible = false;
    displayDialog = false;
    isEdit = false;
    listItemForm: FormGroup;
    typeForm: FormGroup;
    selectedListItem: ListItem | null = null;
    selectedItems: ListItem[] = [];
    cols = [
        { field: 'name', header: 'Nombre' },
        { field: 'description', header: 'Descripción' },
        { field: 'listType', header: 'Tipo de Lista' }
    ];

    constructor(
        private listItemService: ListItemService,
        private listTypeServices: ListTypeService,
        private fb: FormBuilder,
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) {
        this.listItemForm = this.fb.group({
            listTypeId: [null, Validators.required],
            name: ['', Validators.required],
            description: ['']
        });

        this.typeForm = this.fb.group({
            code: ['', Validators.required],
            name: ['', Validators.required],
            description: ['']
        });
    }

    ngOnInit(): void {
        this.listTypeServices.getAll().subscribe((types) => (this.listTypes = types));
        const listTypeId = this.listTypeId();
        if (listTypeId == null) {
            this.loadAllItems();
        } else {
            this.loadListItemsByType(listTypeId);
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['listTypeId']) {
            const listTypeId = this.listTypeId();
            if (listTypeId == null) {
                this.loadAllItems();
            } else {
                this.loadListItemsByType(listTypeId);
            }
        }
    }

    loadListItemsByType(typeId: number) {
        this.listItemService.getByTypeId(typeId).subscribe({
            next: (items) => (this.listItems = items),
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los ítems' })
        });
    }

    loadAllItems() {
        this.listItemService.getAll().subscribe({
            next: (items) => (this.listItems = items),
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los ítems' })
        });
    }

    openNew() {
        this.listItemForm.reset();
        this.isEdit = false;
        this.selectedListItem = null;
        this.displayDialog = true;
    }

    openEdit(item: ListItem) {
        this.isEdit = true;
        this.selectedListItem = item;
        this.listItemForm.patchValue(item);
        this.displayDialog = true;
    }

    save() {
        if (this.listItemForm.invalid) return;
        const itemData = { ...this.listItemForm.value, listTypeId: this.listTypeId() };

        if (this.isEdit && this.selectedListItem) {
            this.listItemService.update(this.selectedListItem.id, itemData).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'Ítem actualizado' });
                    this.displayDialog = false;
                    const listTypeId = this.listTypeId();
                    if (listTypeId == null) {
                        this.loadAllItems();
                    } else {
                        this.loadListItemsByType(listTypeId);
                    }
                },
                error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar' })
            });
        } else {
            this.listItemService.create(itemData).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Creado', detail: 'Ítem creado' });
                    this.displayDialog = false;
                    const listTypeId = this.listTypeId();
                    if (listTypeId == null) {
                        this.loadAllItems();
                    } else {
                        this.loadListItemsByType(listTypeId);
                    }
                },
                error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear' })
            });
        }
    }

    delete(item: ListItem) {
        console.log('Eliminando item:', item);
        this.confirmationService.confirm({
            message: `¿Seguro que deseas eliminar "${item.name}"?`,
            header: 'Eliminar Lista',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'Cancelar',
            accept: () => {
                this.listItemService.delete(item.id).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Eliminado',
                            detail: 'Lista eliminada correctamente'
                        });
                        this.loadAllItems(); // O el método que recarga tu lista
                    },
                    error: () => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'No se pudo eliminar la lista'
                        });
                    }
                });
            }
        });
    }

    openTypeDialog() {
        this.typeForm.reset();
        this.typeDialogVisible = true;
    }

    saveType() {
        if (this.typeForm.invalid) return;
        this.listTypeServices.create(this.typeForm.value).subscribe({
            next: (type) => {
                this.typeDialogVisible = false;
                this.loadListTypes(); // refresca el dropdown y la tabla
            }
        });
    }

    editType(type: any) {
        this.typeForm.patchValue(type);
        this.typeDialogVisible = true;
    }

    loadListTypes() {
        this.listTypeServices.getAll().subscribe((types) => {
            this.listTypes = types;
        });
    }

    deleteType(type: ListType) {
        this.confirmationService.confirm({
            message: `¿Seguro que deseas eliminar "${type.name}"?`,
            header: 'Eliminar Tipo de Lista',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'Cancelar',
            accept: () => {
                this.listTypeServices.delete(type.id).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Tipo de lista eliminado' });
                        this.loadListTypes(); // recarga la lista después de borrar
                    },
                    error: () => {
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el tipo de lista' });
                    }
                });
            }
        });
    }

    deleteSelectedItems() {
        if (!this.selectedItems || this.selectedItems.length === 0) {
            this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Selecciona al menos un elemento.' });
            return;
        }

        this.confirmationService.confirm({
            message: `¿Seguro que deseas eliminar los ${this.selectedItems.length} ítems seleccionados?`,
            header: 'Eliminar Ítems',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'Cancelar',
            accept: () => {
                // Reemplaza esto con tu lógica de borrado en lote (puede ser una petición batch al backend)
                const deleteObservables = this.selectedItems.map((item) => this.listItemService.delete(item.id));
                // Ejecutar todas las peticiones y esperar a que terminen
                forkJoin(deleteObservables).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Ítems eliminados correctamente' });
                        this.loadAllItems(); // O recarga la lista de la forma que corresponda
                        this.selectedItems = [];
                    },
                    error: () => {
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Ocurrió un error al eliminar' });
                    }
                });
            }
        });
    }
    onGlobalFilter(table: any, event: Event) {
        const input = (event.target as HTMLInputElement).value;
        table.filterGlobal(input, 'contains');
    }
}
