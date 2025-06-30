import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ListTypeService } from './list-type.service';
import { ListType } from './list-type.model';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';

@Component({
    selector: 'app-list-type',
    templateUrl: './list-type.component.html',
    standalone: true,
    imports: [TableModule, DialogModule, InputTextModule, ButtonModule, ToastModule, FormsModule, ReactiveFormsModule],
    providers: [MessageService]
})
/**
 * Componente para la gestión de los tipos de lista.
 * Permite crear, editar y eliminar diferentes categorías
 * a las que luego se asocian los elementos (ListItem).
 */
export class ListTypeComponent implements OnInit {
    @Input() visible: boolean = false;
    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() saved = new EventEmitter<void>();
    listTypes: ListType[] = [];
    listTypeForm: FormGroup;
    selectedListType: ListType | null = null;
    displayDialog = false;
    isEdit = false;

    constructor(
        private listTypeService: ListTypeService,
        private fb: FormBuilder,
        private messageService: MessageService
    ) {
        this.listTypeForm = this.fb.group({
            code: [''],
            name: ['', Validators.required],
            description: ['']
        });
    }

    /** Inicializa la carga de tipos de lista */
    ngOnInit(): void {
        this.loadListTypes();
    }

    /** Obtiene los tipos de lista desde el backend */
    loadListTypes() {
        this.listTypeService.getAll().subscribe({
            next: (types) => (this.listTypes = types),
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar los tipos de lista' })
        });
    }

    /** Abre el diálogo para crear un nuevo tipo */
    openNew() {
        this.listTypeForm.reset();
        this.isEdit = false;
        this.selectedListType = null;
        this.displayDialog = true;
    }

    /** Muestra el formulario de creación de tipo */
    openTypeDialog() {
        this.listTypeForm.reset();
        this.isEdit = false;
        this.selectedListType = null;
        this.displayDialog = true;
    }

    /**
     * Abre el formulario para editar un tipo existente
     * @param listType tipo seleccionado
     */
    openEdit(listType: ListType) {
        this.isEdit = true;
        this.selectedListType = listType;
        this.listTypeForm.patchValue(listType);
        this.displayDialog = true;
    }

    /** Guarda los cambios del formulario de tipo */
    save() {
        if (this.listTypeForm.invalid) return;

        if (this.isEdit && this.selectedListType) {
            this.listTypeService.update(this.selectedListType.id, this.listTypeForm.value).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'Tipo de lista actualizado' });
                    this.displayDialog = false;
                    this.loadListTypes();
                },
                error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar' })
            });
        } else {
            this.listTypeService.create(this.listTypeForm.value).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Creado', detail: 'Tipo de lista creado' });
                    this.displayDialog = false;
                    this.loadListTypes();
                },
                error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear' })
            });
        }
    }

    /**
     * Elimina un tipo de lista tras confirmación
     * @param listType tipo a eliminar
     */
    delete(listType: ListType) {
        if (!confirm(`¿Seguro que deseas eliminar "${listType.name}"?`)) return;

        this.listTypeService.delete(listType.id).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Tipo de lista eliminado' });
                this.loadListTypes();
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar' })
        });
    }
}
