import { Component, OnInit, effect, input } from '@angular/core';
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
import { ListType } from './list-type.model';
import { IconFieldModule } from 'primeng/iconfield';
import { TagModule } from 'primeng/tag';
import { forkJoin } from 'rxjs';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SessionService } from '../../services/session.service';

@Component({
    selector: 'app-list-item',
    templateUrl: './list-item.component.html',
    standalone: true,
    imports: [TableModule, ConfirmDialogModule, DialogModule, InputTextModule, ButtonModule, ToastModule, FormsModule, ReactiveFormsModule, CommonModule, ToolbarModule, DropdownModule, IconFieldModule, TagModule, InputIconModule],
    providers: [MessageService, ConfirmationService]
})
export class ListItemComponent implements OnInit {
    // Inputs reactivos del padre
    readonly listTypeId = input<number | null>(null);
    readonly showDelete = input<boolean>(false);

    listItems: ListItem[] = [];
    listTypes: ListType[] = [];
    selectedItems: ListItem[] = [];
    companyId: string = '';

    // UI y formularios
    displayDialog = false;
    typeDialogVisible = false;
    isEdit = false;
    listItemForm: FormGroup;
    typeForm: FormGroup;
    selectedListItem: ListItem | null = null;

    constructor(
        private listItemService: ListItemService,
        private listTypeService: ListTypeService,
        private fb: FormBuilder,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private session: SessionService
    ) {
        // Formularios
        this.listItemForm = this.fb.group({
            listTypeId: [null, Validators.required],
            name: ['', Validators.required],
            description: ['']
        });

        this.typeForm = this.fb.group({
            code: [''],
            name: ['', Validators.required],
            description: ['']
        });

        // Recarga automática cada vez que cambian los filtros
        effect(() => {
            const filtro = this.getFiltroActual();
            this.loadAllItems(filtro.active, filtro.listTypeId);
        });
    }

    ngOnInit(): void {
        this.listTypeService.getAll().subscribe((types) => (this.listTypes = types));
        this.companyId = this.session.companyId ?? '';
        // Carga inicial solo los activos
        const filtro = this.getFiltroActual();
        this.loadAllItems(filtro.active, filtro.listTypeId);
    }

    /** Centraliza el filtro actual según tabs */
    private getFiltroActual(): { active: string; listTypeId?: number } {
        const eliminar = this.showDelete();
        const typeId = this.listTypeId();
        return {
            active: eliminar ? 'false' : 'true',
            listTypeId: typeId ?? undefined
        };
    }

    /** Carga los ítems según el filtro actual */
    loadAllItems(active: string, listTypeId?: number) {
        this.listItemService.getAll(active, listTypeId).subscribe({
            next: (items) => {
                this.listItems = items;
                // console.log('Datos recibidos para la tabla:', items);
            },
            error: () =>
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudieron cargar los ítems'
                })
        });
    }

    // 🎨 CRUD UI
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
        const itemData = this.listItemForm.value;

        const reload = () => {
            const filtro = this.getFiltroActual();
            this.loadAllItems(filtro.active, filtro.listTypeId);
        };

        if (this.isEdit && this.selectedListItem) {
            this.listItemService.update(this.selectedListItem.id, itemData).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'Ítem actualizado' });
                    this.displayDialog = false;
                    reload();
                },
                error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar' })
            });
        } else {
            this.listItemService.create(itemData).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Creado', detail: 'Ítem creado' });
                    this.displayDialog = false;
                    reload();
                },
                error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear' })
            });
        }
    }

    delete(item: ListItem) {
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
                        // Recarga según filtro activo
                        const filtro = this.getFiltroActual();
                        this.loadAllItems(filtro.active, filtro.listTypeId);
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

    // ---- Borrado múltiple ----
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
                const deleteObservables = this.selectedItems.map((item) => this.listItemService.delete(item.id));
                forkJoin(deleteObservables).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Ítems eliminados correctamente' });
                        const filtro = this.getFiltroActual();
                        this.loadAllItems(filtro.active, filtro.listTypeId);
                        this.selectedItems = [];
                    },
                    error: () => {
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Ocurrió un error al eliminar' });
                    }
                });
            }
        });
    }

    // ---- Filtro global (input de búsqueda de la tabla PrimeNG) ----
    onGlobalFilter(table: any, event: Event) {
        const input = (event.target as HTMLInputElement).value;
        table.filterGlobal(input, 'contains');
    }

    // ----- Tipos -----
    openTypeDialog() {
        this.typeForm.reset();
        this.typeDialogVisible = true;
    }

    saveType() {
        if (this.typeForm.invalid) return;
        this.listTypeService.create(this.typeForm.value).subscribe({
            next: () => {
                this.typeDialogVisible = false;
                this.loadListTypes();
            }
        });
    }

    editType(type: ListType) {
        this.typeForm.patchValue(type);
        this.typeDialogVisible = true;
    }

    loadListTypes() {
        this.listTypeService.getAll().subscribe((types) => {
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
                this.listTypeService.delete(type.id).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Tipo de lista eliminado' });
                        this.loadListTypes();
                    },
                    error: () => {
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el tipo de lista' });
                    }
                });
            }
        });
    }
}
