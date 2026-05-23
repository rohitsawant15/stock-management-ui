import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { UserResponse } from '../../shared/models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {

  users: UserResponse[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  canRegister = false;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const role = this.authService.getUserRole() || '';
    this.canRegister = ['SUPER_ADMIN', 'ADMIN'].includes(role);
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.userService.getAllUsers().subscribe({
      next: (res) => {
        this.users = res.data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load users';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getRoleBadgeClass(role: string): string {
    const map: Record<string, string> = {
      'SUPER_ADMIN':        'bg-danger',
      'ADMIN':              'bg-primary',
      'MANAGER':            'bg-warning text-dark',
      'INVENTORY_OPERATOR': 'bg-info text-dark',
      'VIEWER':             'bg-secondary'
    };
    return map[role] || 'bg-secondary';
  }
}