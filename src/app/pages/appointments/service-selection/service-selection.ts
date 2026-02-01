import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Service, NAIL_SERVICE_CATALOG } from '../../../models/service.model';

@Component({
  selector: 'app-service-selection',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatCheckboxModule
  ],
  templateUrl: './service-selection.html',
  styleUrl: './service-selection.scss'
})
export class ServiceSelectionComponent {
  @Output() servicesSelected = new EventEmitter<Service[]>();

  serviceForm: FormGroup;
  services = signal<Service[]>(NAIL_SERVICE_CATALOG);
  selectedServices = signal<Service[]>([]);

  constructor(private fb: FormBuilder) {
    this.serviceForm = this.fb.group({
      service: [[], Validators.required]
    });

    this.serviceForm.get('service')?.valueChanges.subscribe(serviceIds => {
      const selected = this.services().filter(s => serviceIds.includes(s.id));
      this.selectedServices.set(selected);
    });
  }

  onContinue(): void {
    if (this.serviceForm.valid && this.selectedServices().length > 0) {
      this.servicesSelected.emit(this.selectedServices());
    } else {
      this.serviceForm.get('service')?.markAsTouched();
    }
  }

  isServiceSelected(serviceId: number): boolean {
    return this.selectedServices().some(s => s.id === serviceId);
  }

  toggleService(service: Service, event: any): void {
    const isChecked = event.checked;
    const currentServices = this.selectedServices();
    
    if (isChecked) {
      const newServices = [...currentServices, service];
      this.selectedServices.set(newServices);
    } else {
      const newServices = currentServices.filter(s => s.id !== service.id);
      this.selectedServices.set(newServices);
    }
    
    // Update form control value
    const serviceIds = this.selectedServices().map(s => s.id);
    this.serviceForm.get('service')?.setValue(serviceIds);
  }

  getTotalDuration(): string {
    const services = this.selectedServices();
    if (services.length === 0) return '';
    
    let totalMinutes = 0;
    services.forEach(service => {
      const hoursMatch = service.duration.match(/(\d+)h/);
      const minutesMatch = service.duration.match(/(\d+)m/);
      const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
      const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
      totalMinutes += (hours * 60) + minutes;
    });
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  }

  getTotalPrice(): string {
    const services = this.selectedServices();
    if (services.length === 0) return '';
    
    let total = 0;
    services.forEach(service => {
      const price = parseInt(service.price.replace('$', ''));
      total += price;
    });
    
    return `$${total}`;
  }
}
