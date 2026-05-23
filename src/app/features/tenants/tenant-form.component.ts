import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { TenantService } from '../../core/services/tenant.service';

@Component({
  selector: 'app-tenant-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './tenant-form.component.html',
  styleUrls: ['./tenant-form.component.scss']
})
export class TenantFormComponent {

  tenantForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private tenantService: TenantService,
    private router: Router
  ) {
    this.tenantForm = this.fb.group({
      tenantCode: ['', [Validators.required]],
      tenantName: ['', [Validators.required]]
    });
  }

  get f() { return this.tenantForm.controls; }

  onSubmit(): void {
    if (this.tenantForm.invalid) {
      this.tenantForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.tenantService.createTenant(this.tenantForm.value).subscribe({
      next: () => { this.router.navigate(['/tenants']); },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to create tenant';
        this.isLoading = false;
      }
    });
  }
}