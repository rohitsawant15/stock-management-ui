import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { UserResponse } from '../../shared/models/user.model';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss']
})
export class UserDetailComponent implements OnInit {

  user: UserResponse | null = null;
  isLoading = false;
  errorMessage = '';

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadUser(+id);
    }
  }

  loadUser(id: number): void {
    this.isLoading = true;
    this.userService.getUserById(id).subscribe({
      next: (res) => {
        this.user = res.data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load user';
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