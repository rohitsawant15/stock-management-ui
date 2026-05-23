import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';



interface NavItem {
  label: string;
  icon: string;
  route: string;
  allowedRoles: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  isCollapsed = false;
  userRole = '';
  username = '';

  allNavItems: NavItem[] = [
  {
    label: 'Dashboard',
    icon: 'bi-speedometer2',
    route: '/dashboard',
    allowedRoles: []  // everyone
  },
  {
    label: 'Products',
    icon: 'bi-box-seam',
    route: '/products',
    allowedRoles: []  // everyone — but buttons inside are role-filtered
  },
  {
    label: 'Stock Operations',
    icon: 'bi-arrow-left-right',
    route: '/stock',
    allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'INVENTORY_OPERATOR']
    // MANAGER cannot do stock operations per backend @PreAuthorize
  },
  {
    label: 'Users',
    icon: 'bi-people',
    route: '/users',
    allowedRoles: ['SUPER_ADMIN', 'ADMIN']
    // Only ADMIN and SUPER_ADMIN manage users
  },
  {
    label: 'Tenants',
    icon: 'bi-building',
    route: '/tenants',
    allowedRoles: ['SUPER_ADMIN']
  }
];

  visibleNavItems: NavItem[] = [];

  constructor(private authService: AuthService) {}

  @Output() collapsedChange = new EventEmitter<boolean>();

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole() || '';
    const user = this.authService.getUser();
    this.username = user?.sub || user?.username || 'User';

    this.visibleNavItems = this.allNavItems.filter(item => {
      if (item.allowedRoles.length === 0) return true;
      return item.allowedRoles.includes(this.userRole);
    });
  }

  // Returns the full CSS class string for the icon
  // e.g. 'bi bi-speedometer2' — used in template as [class]
  getIconClass(icon: string): string {
    return 'bi ' + icon;
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    this.collapsedChange.emit(this.isCollapsed);
  }

  logout(): void {
    this.authService.logout();
  }

  
}