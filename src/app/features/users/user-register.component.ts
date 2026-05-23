import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { TenantService } from '../../core/services/tenant.service';
import { AuthService } from '../../core/services/auth.service';
import { TenantResponse } from '../../shared/models/tenant.model';
import { RoleType } from '../../shared/models/user.model';

@Component({
  selector: 'app-user-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './user-register.component.html',
  styleUrls: ['./user-register.component.scss']
})
export class UserRegisterComponent implements OnInit {

  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Tenant list for dropdown — loaded if SUPER_ADMIN
  tenants: TenantResponse[] = [];
  isSuperAdmin = false;

  // All available roles — filtered based on who is registering
  availableRoles: RoleType[] = [
    'ADMIN', 'MANAGER', 'INVENTORY_OPERATOR', 'VIEWER'
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private tenantService: TenantService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.registerForm = this.fb.group({
      fullName:  ['', [Validators.required]],
      email:     ['', [Validators.required, Validators.email]],
      username:  ['', [Validators.required]],
      password:  ['', [Validators.required, Validators.minLength(6)]],
      role:      ['', [Validators.required]],
      tenantId:  [null, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.isSuperAdmin = this.authService.isSuperAdmin();

    if (this.isSuperAdmin) {
      // SUPER_ADMIN can assign any role including SUPER_ADMIN
      this.availableRoles = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'INVENTORY_OPERATOR', 'VIEWER'];
      this.loadTenants();
    } else {
      // ADMIN registers users for their own tenant
      const user = this.authService.getUser();
      // Pre-fill tenantId from JWT and disable the field
      const tenantId = user?.tenantId ? Number(user.tenantId) : null;
      this.registerForm.patchValue({ tenantId });
    }
  }

  loadTenants(): void {
    this.tenantService.getAllTenants().subscribe({
      next: (res) => { this.tenants = res.data; this.cdr.detectChanges(); },
      error: () => { this.errorMessage = 'Failed to load tenants'; this.cdr.detectChanges(); }
    });
  }

  get f() { return this.registerForm.controls; }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.userService.registerUser(this.registerForm.value).subscribe({
      next: (res) => {
        this.successMessage = `User "${res.data.username}" registered successfully!`;
        this.registerForm.reset();
        this.isLoading = false;
        this.cdr.detectChanges();
        // Navigate back to users list after 1.5 seconds
        setTimeout(() => this.router.navigate(['/users']), 1500);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Registration failed';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}