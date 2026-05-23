import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TenantService } from '../../core/services/tenant.service';
import { TenantResponse } from '../../shared/models/tenant.model';


@Component({
  selector: 'app-tenant-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './tenant-list.component.html',
  styleUrls: ['./tenant-list.component.scss']
})
export class TenantListComponent implements OnInit {

  tenants: TenantResponse[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private tenantService: TenantService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadTenants();
  }

  loadTenants(): void {
    this.isLoading = true;
    this.tenantService.getAllTenants().subscribe({
      next: (res) => {
        this.tenants = res.data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load tenants';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}