import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  pageTitle = 'Dashboard';
  username = '';
  userRole = '';

  // Map routes to human-readable titles
  private titleMap: Record<string, string> = {
    '/dashboard':      'Dashboard',
    '/products':       'Products',
    '/products/new':   'Add Product',
    '/stock':          'Stock Operations',
    '/stock/history':  'Stock History',
    '/users':          'Users',
    '/users/register': 'Register User',
    '/tenants':        'Tenants',
    '/tenants/new':    'Add Tenant'
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    this.username = user?.sub || user?.username || 'User';
    this.userRole = this.authService.getUserRole() || '';

    // Set title on first load
    this.setTitle(this.router.url);

    // Update title on every navigation
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.setTitle(e.urlAfterRedirects);
      });
  }

  private setTitle(url: string): void {
    // Strip query params
    const path = url.split('?')[0];

    // Check exact match first
    if (this.titleMap[path]) {
      this.pageTitle = this.titleMap[path];
      return;
    }

    // Check for dynamic routes like /products/edit/5 or /users/3
    if (path.startsWith('/products/edit/')) { this.pageTitle = 'Edit Product'; return; }
    if (path.startsWith('/users/') && path !== '/users/register') { this.pageTitle = 'User Details'; return; }

    this.pageTitle = 'Stock Manager';
  }

  logout(): void {
    this.authService.logout();
  }
}