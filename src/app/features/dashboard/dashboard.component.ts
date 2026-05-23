import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardSummary } from '../../shared/models/api-response.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  username = '';
  userRole = '';
  currentDate = new Date();
  summary: DashboardSummary | null = null;
  isLoading = false;
  errorMessage = '';
  canAddStock    = false;
  canViewHistory = false;
  canManageUsers = false;

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef   // ← forces Angular to re-render
  ) {}

  ngOnInit(): void {
    this.initUser();
    this.loadSummary();
  }

  initUser(): void {
    const user = this.authService.getUser();
    this.username = user?.sub || user?.username || 'User';
    this.userRole = this.authService.getUserRole() || '';
    this.canAddStock    = this.authService.hasAnyRole(['SUPER_ADMIN', 'ADMIN', 'INVENTORY_OPERATOR']);
    this.canViewHistory = this.authService.hasAnyRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER']);
    this.canManageUsers = this.authService.hasAnyRole(['SUPER_ADMIN', 'ADMIN']);
  }

  loadSummary(): void {
    this.isLoading = true;
    this.dashboardService.getSummary().subscribe({
      next: (res) => {
        this.summary = res.data;
        this.isLoading = false;
        // Force Angular to detect changes after async HTTP response
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Failed to load dashboard data';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}