import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ListTypeService } from './list-type.service';
import { ListType } from './list-type.model';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { toTitleCase } from '../../utils/string-utils';
import { HttpErrorResponse } from '@angular/common/http';

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
        console.log('=== ListTypeComponent.constructor ===');
        console.log('Inicializando formulario...');
        
        this.listTypeForm = this.fb.group({
            code: [''],
            name: ['', Validators.required],
            description: ['']
        });

        console.log('Formulario inicializado:', this.listTypeForm);
        console.log('ListTypeService:', this.listTypeService);
    }

    /** Inicializa la carga de tipos de lista */
    ngOnInit(): void {
        console.log('=== ListTypeComponent.ngOnInit ===');
        console.log('Componente inicializado, cargando tipos de lista...');
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
        this.listTypeForm.reset();
        this.displayDialog = true;
        
        console.log('Estado después de openNew:', {
            isEdit: this.isEdit,
            selectedListType: this.selectedListType,
            formValues: this.listTypeForm.value
        });
    }

    /**
     * Abre el formulario para editar un tipo existente
     * @param listType tipo seleccionado
     */
    openEdit(listType: ListType) {
        console.log('=== openEdit ===');
        console.log('Datos del tipo de lista recibidos:', JSON.parse(JSON.stringify(listType)));
        
        // Validar que el objeto listType tenga un ID
        if (!listType || !listType.id) {
            console.error('Error: No se recibió un ID válido para editar');
            return;
        }
        
        // Asegurarse de que estamos en modo edición
        this.isEdit = true;
        
        // Crear una copia profunda del objeto para evitar referencias
        this.selectedListType = { ...listType };
        
        // Resetear el formulario antes de establecer los nuevos valores
        this.listTypeForm.reset();
        
        // Establecer los valores del formulario
        this.listTypeForm.patchValue({
            name: listType.name,
            description: listType.description || '',
            code: listType.code || ''
        });
        
        console.log('Modo edición activado:', this.isEdit);
        console.log('Tipo de lista seleccionado para edición:', this.selectedListType);
        
        // Mostrar el diálogo
        this.displayDialog = true;
        
        // Verificar el estado después de abrir la edición
        console.log('Estado después de abrir edición:', {
            isEdit: this.isEdit,
            formValues: this.listTypeForm.value,
            selectedListType: this.selectedListType,
            formValue: this.listTypeForm.value,
            formValidity: this.listTypeForm.valid
        });
    }

    /** Guarda los cambios del formulario de tipo */
    save() {
        if (this.listTypeForm.invalid) {
            console.error('El formulario no es válido');
            return;
        }
        
        console.log('=== Iniciando guardado ===');
        console.log('Modo edición (isEdit):', this.isEdit);
        console.log('Tipo de lista seleccionada (selectedListType):', this.selectedListType);
        console.log('Valores del formulario:', this.listTypeForm.value);
        
        // Obtener valores del formulario
        const formValue = { ...this.listTypeForm.value };
        if (formValue.name) {
            formValue.name = toTitleCase(formValue.name);
        }

        // Verificar si estamos en modo edición
        const isEditing = this.isEdit && this.selectedListType?.id !== undefined;
        console.log('Validación de modo edición:', {
            isEdit: this.isEdit,
            hasId: this.selectedListType?.id !== undefined,
            id: this.selectedListType?.id,
            isEditing
        });
        
        if (isEditing && this.selectedListType?.id) {
            // Modo edición
            const listTypeId = this.selectedListType.id;
            console.log('Editando tipo de lista existente con ID:', listTypeId);
            
            // Crear objeto con los datos a actualizar
            const updateData = {
                name: formValue.name,
                description: formValue.description || null,
                code: formValue.code || null
            };
            
            console.log('Enviando solicitud de actualización:', {
                id: listTypeId,
                ...updateData
            });
            
            // Llamar al servicio de actualización
            const operation = this.listTypeService.update(listTypeId, updateData);
            this.handleOperation(operation, true);
        } else {
            // Modo creación
            console.log('Creando nuevo tipo de lista');
            console.log('Datos del nuevo tipo:', formValue);
            
            // Llamar al servicio de creación
            const operation = this.listTypeService.create(formValue);
            this.handleOperation(operation, false);
        }
    }

    /** Maneja la operación de guardado */
    private handleOperation(operation: Observable<ListType>, isUpdate: boolean) {
        const summary = isUpdate ? 'Actualizado' : 'Creado';
        const detail = `Tipo de lista ${summary.toLowerCase()}`;
        
        console.log('=== handleOperation ===');
        console.log('Tipo de operación:', summary);
        console.log('isUpdate:', isUpdate);
        console.log('Estado actual:', {
            isEdit: this.isEdit,
            selectedListType: this.selectedListType,
            displayDialog: this.displayDialog
        });

        operation.subscribe({
            next: (result) => {
                console.log('Operación exitosa:', result);
                this.messageService.add({ 
                    severity: 'success', 
                    summary, 
                    detail,
                    life: 3000
                });
                
                // Resetear el estado
                this.displayDialog = false;
                this.isEdit = false;
                this.selectedListType = null;
                this.listTypeForm.reset();
                
                // Recargar la lista
                this.loadListTypes();
                this.saved.emit();
                
                console.log('Estado después de la operación:', {
                    isEdit: this.isEdit,
                    selectedListType: this.selectedListType,
                    displayDialog: this.displayDialog
                });
            },
            error: (err) => {
                console.error('Error en la operación:', err);
                const error = err as HttpErrorResponse;
                const errorDetail = error.error?.message || `No se pudo ${summary.toLowerCase()}`;
                this.messageService.add({ 
                    severity: 'error', 
                    summary: 'Error', 
                    detail: errorDetail,
                    life: 5000
                });
            }
        });
    }

    /**
     * Elimina un tipo de lista tras confirmación
     * @param listType tipo a eliminar
     */
    delete(listType: ListType) {
        if (!listType.id) {
            console.error('No se puede eliminar: ID no proporcionado');
            this.messageService.add({ 
                severity: 'error', 
                summary: 'Error', 
                detail: 'No se pudo eliminar: ID no válido' 
            });
            return;
        }

        if (!confirm(`¿Seguro que deseas eliminar "${listType.name}"?`)) return;

        this.listTypeService.delete(listType.id).subscribe({
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
}
