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
import { toTitleCase } from '../../utils/string-utils';
import { TextareaModule } from 'primeng/textarea';

@Component({
    selector: 'app-list-item',
    templateUrl: './list-item.component.html',
    standalone: true,
    imports: [TableModule, ConfirmDialogModule, DialogModule, InputTextModule, ButtonModule, ToastModule, FormsModule, ReactiveFormsModule, CommonModule, ToolbarModule, DropdownModule, IconFieldModule, TagModule, InputIconModule, TextareaModule],
    providers: [ConfirmationService]
})
/**
 * Componente encargado de mostrar y gestionar los
 * elementos que pertenecen a un tipo de lista.
 * Incluye formularios de creación y edición,
 * así como la eliminación simple y múltiple.
 */
export class ListItemComponent implements OnInit {
    // Inputs reactivos del padre
    readonly listTypeId = input<string | null>(null);
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
            id: [''],
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

    /**
     * Carga la información inicial del componente.
     */
    ngOnInit(): void {
        this.listTypeService.getAll().subscribe((types) => (this.listTypes = types));
        this.companyId = this.session.companyId ?? '';
        // Carga inicial solo los activos
        const filtro = this.getFiltroActual();
        this.loadAllItems(filtro.active, filtro.listTypeId);
    }

    /**
     * Obtiene los valores de filtro según la pestaña seleccionada.
     */
    private getFiltroActual(): { active: string; listTypeId?: string } {
        const eliminar = this.showDelete();
        const typeId = this.listTypeId();
        return {
            active: eliminar ? 'false' : 'true',
            listTypeId: typeId ?? undefined
        };
    }

    /**
     * Consulta y carga los ítems aplicando los filtros indicados.
     */
    loadAllItems(active: string, listTypeId?: string) {
        this.listItemService.getAll(active, listTypeId).subscribe({
            next: (items) => {
                this.listItems = items;
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
    /** Muestra el formulario para crear un nuevo ítem */
    openNew() {
        this.listItemForm.reset();
        this.isEdit = false;
        this.selectedListItem = null;
        this.displayDialog = true;
    }

    /**
     * Abre el formulario de edición para un ítem existente.
     */
    openEdit(item: ListItem) {
        this.isEdit = true;
        this.selectedListItem = item;
        this.listItemForm.patchValue(item);
        this.displayDialog = true;
    }

    /** Guarda un nuevo ítem o actualiza uno existente */
    save() {
        if (this.listItemForm.invalid) return;

        const itemData = { ...this.listItemForm.value };

        //Convierto a Title Case porque no falta el que mete todo en minúsculas
        if (itemData.name) itemData.name = toTitleCase(itemData.name);

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

    /**
     * Elimina un ítem individual tras confirmación.
     */
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

    /**
     * Restaura un ítem previamente eliminado.
     */
    restore(item: ListItem) {
        this.listItemService.restore(item.id).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Restaurado',
                    detail: 'Lista restaurada correctamente'
                });
                const filtro = this.getFiltroActual();
                this.loadAllItems(filtro.active, filtro.listTypeId);
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo restaurar la lista'
                });
            }
        });
    }

    // ---- Borrado múltiple ----
    /**
     * Elimina todos los ítems seleccionados en la tabla.
     */
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

    /**
     * Restaura todos los ítems seleccionados.
     */
    restoreSelectedItems() {
        if (!this.selectedItems || this.selectedItems.length === 0) {
            this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Selecciona al menos un elemento.' });
            return;
        }

        const restoreObservables = this.selectedItems.map((item) => this.listItemService.restore(item.id));
        forkJoin(restoreObservables).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Restaurado', detail: 'Ítems restaurados correctamente' });
                const filtro = this.getFiltroActual();
                this.loadAllItems(filtro.active, filtro.listTypeId);
                this.selectedItems = [];
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Ocurrió un error al restaurar' });
            }
        });
    }

    // ---- Filtro global (input de búsqueda de la tabla PrimeNG) ----
    /**
     * Aplica un filtro global a la tabla PrimeNG.
     */
    onGlobalFilter(table: any, event: Event) {
        const input = (event.target as HTMLInputElement).value;
        table.filterGlobal(input, 'contains');
    }

    // ----- Tipos -----
    /** Abre el formulario para crear un nuevo tipo */
    openTypeDialog() {
        this.typeForm.reset({
            id: '',
            code: '',
            name: '',
            description: ''
        });
        this.typeDialogVisible = true;
    }

    /** Guarda un nuevo tipo de lista o actualiza uno existente */
    saveType() {
        if (this.typeForm.invalid) {
            console.error('El formulario no es válido');
            return;
        }

        const formValue = this.typeForm.value;
        console.log('Datos del formulario:', formValue);
        
        // Determinar si es una edición o creación
        const isEditing = !!formValue.id;
        
        // Crear objeto con los datos a enviar
        const typeData: any = {
            name: formValue.name ? toTitleCase(formValue.name) : '',
            description: formValue.description || null,
            code: formValue.code || null
        };

        // Solo agregar companyId si estamos creando un nuevo tipo
        if (!isEditing) {
            typeData.companyId = this.companyId;
            console.log('Agregando companyId al nuevo tipo:', this.companyId);
        } else {
            console.log('Editando tipo existente con ID:', formValue.id);
        }
        
        console.log('Operación:', isEditing ? 'Actualizando' : 'Creando');
        console.log('ID del tipo:', formValue.id);
        console.log('Datos a enviar:', typeData);

        const operation = isEditing 
            ? this.listTypeService.update(formValue.id, typeData)
            : this.listTypeService.create(typeData);

        operation.subscribe({
            next: (result) => {
                console.log('Operación exitosa:', result);
                this.typeDialogVisible = false;
                this.typeForm.reset({
                    id: '',
                    code: '',
                    name: '',
                    description: ''
                });
                this.loadListTypes();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: `Tipo de lista ${isEditing ? 'actualizado' : 'creado'} correctamente`,
                    life: 3000
                });
            },
            error: (error) => {
                console.error('Error al guardar el tipo de lista:', error);
                let errorMessage = 'Error al guardar el tipo de lista';
                
                if (error.error) {
                    if (typeof error.error === 'string') {
                        errorMessage = error.error;
                    } else if (error.error.message) {
                        errorMessage = error.error.message;
                    }
                }
                
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: errorMessage,
                    life: 5000
                });
            }
        });
    }

    /**
     * Carga en el formulario el tipo seleccionado para editarlo.
     */
    editType(type: ListType) {
        console.log('Editando tipo de lista:', type);
        this.typeForm.reset();
        this.typeForm.patchValue({
            id: type.id,
            name: type.name,
            description: type.description || '',
            code: type.code || ''
        });
        this.typeDialogVisible = true;
    }

    /** Recarga la lista de tipos disponibles */
    loadListTypes() {
        this.listTypeService.getAll().subscribe((types) => {
            this.listTypes = types;
        });
    }

    /**
     * Elimina un tipo de lista específico.
     */
    deleteType(type: ListType) {
        if (!type.id) {
            console.error('No se puede eliminar: ID no proporcionado');
            this.messageService.add({ 
                severity: 'error', 
                summary: 'Error', 
                detail: 'No se pudo eliminar: ID no válido' 
            });
            return;
        }

        this.confirmationService.confirm({
            message: `¿Seguro que deseas eliminar "${type.name}"?`,
            header: 'Eliminar Tipo de Lista',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'Cancelar',
            accept: () => {
                this.listTypeService.delete(type.id as string).subscribe({
                    next: () => {
                        this.messageService.add({ 
                            severity: 'success', 
                            summary: 'Eliminado', 
                            detail: 'Tipo de lista eliminado' 
                        });
                        this.loadListTypes();
                    },
                    error: (error) => {
                        console.error('Error al eliminar tipo de lista:', error);
                        this.messageService.add({ 
                            severity: 'error', 
                            summary: 'Error', 
                            detail: error.error?.message || 'No se pudo eliminar el tipo de lista' 
                        });
                    }
                });
            }
        });
    }
}
