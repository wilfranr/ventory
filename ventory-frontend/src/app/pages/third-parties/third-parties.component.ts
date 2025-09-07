import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TabViewModule } from 'primeng/tabview';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ThirdPartyService } from '../../services/third-party.service';
import { ThirdParty, Client, Provider } from '../../models/third-party.model';

@Component({
  selector: 'app-third-parties',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    TagModule,
    ConfirmDialogModule,
    ToastModule,
    TabViewModule,
    TooltipModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './third-parties.component.html',
  styleUrls: ['./third-parties.component.scss']
})
export class ThirdPartiesComponent implements OnInit {
  thirdParties: ThirdParty[] = [];
  clients: Client[] = [];
  providers: Provider[] = [];
  
  selectedTab: number = 0;
  displayDialog: boolean = false;
  displayClientDialog: boolean = false;
  displayProviderDialog: boolean = false;
  
  selectedThirdParty: ThirdParty | null = null;
  isEditMode: boolean = false;
  
  // Form data
  formData: any = {
    name: '',
    nit: '',
    address: '',
    phones: '',
    email: '',
    website: '',
    creditLimit: 0,
    paymentTerms: '',
    bankAccount: ''
  };

  // Tab options
  tabOptions = [
    { label: 'Todos', value: 0 },
    { label: 'Clientes', value: 1 },
    { label: 'Proveedores', value: 2 }
  ];

  constructor(
    private thirdPartyService: ThirdPartyService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loadAllThirdParties();
    this.loadClients();
    this.loadProviders();
  }

  loadAllThirdParties() {
    this.thirdPartyService.getAll().subscribe({
      next: (data) => {
        this.thirdParties = data;
      },
      error: (error) => {
        console.error('Error loading third parties:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los terceros'
        });
      }
    });
  }

  loadClients() {
    this.thirdPartyService.getClients().subscribe({
      next: (data) => {
        this.clients = data;
      },
      error: (error) => {
        console.error('Error loading clients:', error);
      }
    });
  }

  loadProviders() {
    this.thirdPartyService.getProviders().subscribe({
      next: (data) => {
        this.providers = data;
      },
      error: (error) => {
        console.error('Error loading providers:', error);
      }
    });
  }

  onTabChange(event: any) {
    this.selectedTab = event.index;
  }

  getCurrentData(): ThirdParty[] {
    switch (this.selectedTab) {
      case 1:
        return this.clients.map(client => ({
          ...client.thirdParty!,
          client: client,
          provider: undefined
        }));
      case 2:
        return this.providers.map(provider => ({
          ...provider.thirdParty!,
          client: undefined,
          provider: provider
        }));
      default:
        return this.thirdParties;
    }
  }

  showAddDialog() {
    this.resetForm();
    this.isEditMode = false;
    this.displayDialog = true;
  }

  showAddClientDialog() {
    this.resetForm();
    this.isEditMode = false;
    this.displayClientDialog = true;
  }

  showAddProviderDialog() {
    this.resetForm();
    this.isEditMode = false;
    this.displayProviderDialog = true;
  }

  showEditDialog(thirdParty: ThirdParty) {
    this.selectedThirdParty = thirdParty;
    this.isEditMode = true;
    this.formData = {
      name: thirdParty.name,
      nit: thirdParty.nit,
      address: thirdParty.address || '',
      phones: thirdParty.phones || '',
      email: thirdParty.email || '',
      website: thirdParty.website || ''
    };
    this.displayDialog = true;
  }

  resetForm() {
    this.formData = {
      name: '',
      nit: '',
      address: '',
      phones: '',
      email: '',
      website: '',
      creditLimit: 0,
      paymentTerms: '',
      bankAccount: ''
    };
    this.selectedThirdParty = null;
  }

  saveThirdParty() {
    if (this.isEditMode && this.selectedThirdParty) {
      this.updateThirdParty();
    } else {
      this.createThirdParty();
    }
  }

  createThirdParty() {
    const data = {
      name: this.formData.name,
      nit: this.formData.nit,
      address: this.formData.address || undefined,
      phones: this.formData.phones || undefined,
      email: this.formData.email || undefined,
      website: this.formData.website || undefined
    };

    this.thirdPartyService.createClient(data).subscribe({
      next: (result) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Tercero creado correctamente'
        });
        this.displayDialog = false;
        this.loadData();
      },
      error: (error) => {
        console.error('Error creating third party:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al crear el tercero'
        });
      }
    });
  }

  createClient() {
    const data = {
      name: this.formData.name,
      nit: this.formData.nit,
      address: this.formData.address || undefined,
      phones: this.formData.phones || undefined,
      email: this.formData.email || undefined,
      website: this.formData.website || undefined,
      creditLimit: this.formData.creditLimit || 0
    };

    this.thirdPartyService.createClient(data).subscribe({
      next: (result) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Cliente creado correctamente'
        });
        this.displayClientDialog = false;
        this.loadData();
      },
      error: (error) => {
        console.error('Error creating client:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al crear el cliente'
        });
      }
    });
  }

  createProvider() {
    const data = {
      name: this.formData.name,
      nit: this.formData.nit,
      address: this.formData.address || undefined,
      phones: this.formData.phones || undefined,
      email: this.formData.email || undefined,
      website: this.formData.website || undefined,
      paymentTerms: this.formData.paymentTerms || undefined,
      bankAccount: this.formData.bankAccount || undefined
    };

    this.thirdPartyService.createProvider(data).subscribe({
      next: (result) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Proveedor creado correctamente'
        });
        this.displayProviderDialog = false;
        this.loadData();
      },
      error: (error) => {
        console.error('Error creating provider:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al crear el proveedor'
        });
      }
    });
  }

  updateThirdParty() {
    if (!this.selectedThirdParty) return;

    const data = {
      name: this.formData.name,
      nit: this.formData.nit,
      address: this.formData.address || undefined,
      phones: this.formData.phones || undefined,
      email: this.formData.email || undefined,
      website: this.formData.website || undefined
    };

    this.thirdPartyService.update(this.selectedThirdParty.id, data).subscribe({
      next: (result) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Tercero actualizado correctamente'
        });
        this.displayDialog = false;
        this.loadData();
      },
      error: (error) => {
        console.error('Error updating third party:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al actualizar el tercero'
        });
      }
    });
  }

  confirmDelete(thirdParty: ThirdParty) {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar "${thirdParty.name}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteThirdParty(thirdParty.id);
      }
    });
  }

  deleteThirdParty(id: string) {
    this.thirdPartyService.delete(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Tercero eliminado correctamente'
        });
        this.loadData();
      },
      error: (error) => {
        console.error('Error deleting third party:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al eliminar el tercero'
        });
      }
    });
  }

  getRoleTag(thirdParty: ThirdParty) {
    if (thirdParty.client && thirdParty.provider) {
      return { label: 'Cliente/Proveedor', severity: 'info' };
    } else if (thirdParty.client) {
      return { label: 'Cliente', severity: 'success' };
    } else if (thirdParty.provider) {
      return { label: 'Proveedor', severity: 'help' };
    }
    return { label: 'Sin rol', severity: 'secondary' };
  }

  getCreditLimit(thirdParty: ThirdParty): number {
    return thirdParty.client?.creditLimit || 0;
  }

  getPaymentTerms(thirdParty: ThirdParty): string {
    return thirdParty.provider?.paymentTerms || 'No definido';
  }
}
