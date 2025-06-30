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

    ngOnInit(): void {
        this.loadListTypes();
    }

    loadListTypes() {
        this.listTypeService.getAll().subscribe({
            next: (types) => (this.listTypes = types),
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar los tipos de lista' })
        });
    }

    openNew() {
        this.listTypeForm.reset();
        this.isEdit = false;
        this.selectedListType = null;
        this.displayDialog = true;
    }

    openTypeDialog() {
        this.listTypeForm.reset();
        this.isEdit = false;
        this.selectedListType = null;
        this.displayDialog = true;
    }

    openEdit(listType: ListType) {
        this.isEdit = true;
        this.selectedListType = listType;
        this.listTypeForm.patchValue(listType);
        this.displayDialog = true;
    }

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
