import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { StockService } from '../../core/services/stock.service';
import { ProductService } from '../../core/services/product.service';
import { StockHistoryResponse } from '../../shared/models/stock.model';
import { ProductResponse } from '../../shared/models/product.model';
import { SearchableDropdownComponent, DropdownOption } from '../../shared/components/searchable-dropdown.component';

@Component({
  selector: 'app-stock-history',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SearchableDropdownComponent],
  templateUrl: './stock-history.component.html',
  styleUrls: ['./stock-history.component.scss']
})
export class StockHistoryComponent implements OnInit {

  products: ProductResponse[] = [];
  productOptions: DropdownOption[] = [];
  isLoadingProducts = false;
  selectedProductId: number | null = null;
  selectedProduct: ProductResponse | null = null;
  historyList: StockHistoryResponse[] = [];
  allProductsHistory: StockHistoryResponse[] = [];
  isLoadingHistory = false;
  errorMessage = '';
  filterType: 'ALL' | 'ADD' | 'REDUCE' = 'ALL';

  // dashboard mode = show all products history filtered by type
  isDashboardMode = false;

  constructor(
    private stockService: StockService,
    private productService: ProductService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['type'] === 'ADD' || params['type'] === 'REDUCE') {
        this.isDashboardMode = true;
        this.filterType = params['type'] as 'ADD' | 'REDUCE';
        this.loadProducts(() => this.loadAllProductsHistory());
      } else {
        this.isDashboardMode = false;
        this.filterType = 'ALL';
        this.loadProducts();
      }
    });
  }

  loadProducts(callback?: () => void): void {
    this.isLoadingProducts = true;
    this.productService.getAllProductsForDropdown().subscribe({
      next: (products) => {
        this.products = products;
        this.productOptions = products.map(p => ({
          value: p.id,
          label: p.productName,
          badge: p.productCode,
          sublabel: `${p.quantity} in stock`
        }));
        this.isLoadingProducts = false;
        this.cdr.detectChanges();
        if (callback) callback();
      },
      error: () => {
        this.errorMessage = 'Failed to load products';
        this.isLoadingProducts = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Loads history for ALL products and merges into one list
  loadAllProductsHistory(): void {
    if (!this.products.length) return;
    this.isLoadingHistory = true;
    this.errorMessage = '';
    this.allProductsHistory = [];

    let completed = 0;
    const total = this.products.length;
    const merged: StockHistoryResponse[] = [];

    this.products.forEach(product => {
      this.stockService.getStockHistory(product.id).subscribe({
        next: (res) => {
          // Tag each record with product name for display
          const tagged = res.data.map(h => ({
            ...h,
            productName: product.productName,
            productCode: product.productCode
          }));
          merged.push(...tagged);
          completed++;
          if (completed === total) {
            this.allProductsHistory = merged.sort((a, b) =>
              new Date(b.operationTime).getTime() - new Date(a.operationTime).getTime()
            );
            this.isLoadingHistory = false;
            this.cdr.detectChanges();
          }
        },
        error: () => {
          completed++;
          if (completed === total) {
            this.allProductsHistory = merged.sort((a, b) =>
              new Date(b.operationTime).getTime() - new Date(a.operationTime).getTime()
            );
            this.isLoadingHistory = false;
            this.cdr.detectChanges();
          }
        }
      });
    });
  }

  onProductSelected(productId: number | null): void {
    this.selectedProductId = productId;
    if (!productId) {
      this.historyList = [];
      this.selectedProduct = null;
      return;
    }
    this.selectedProduct = this.products.find(p => p.id === productId) || null;
    this.loadHistory();
  }

  loadHistory(): void {
    if (!this.selectedProductId) return;
    this.isLoadingHistory = true;
    this.errorMessage = '';
    this.historyList = [];

    this.stockService.getStockHistory(this.selectedProductId).subscribe({
      next: (res) => {
        this.historyList = res.data.sort((a, b) =>
          new Date(b.operationTime).getTime() - new Date(a.operationTime).getTime()
        );
        this.isLoadingHistory = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load stock history';
        this.isLoadingHistory = false;
        this.cdr.detectChanges();
      }
    });
  }

  get filteredHistory(): StockHistoryResponse[] {
    if (this.isDashboardMode) {
      return this.allProductsHistory.filter(h => h.operationType === this.filterType);
    }
    if (this.filterType === 'ALL') return this.historyList;
    return this.historyList.filter(h => h.operationType === this.filterType);
  }

  get addCount(): number {
    const list = this.isDashboardMode ? this.allProductsHistory : this.historyList;
    return list.filter(h => h.operationType === 'ADD').length;
  }

  get reduceCount(): number {
    const list = this.isDashboardMode ? this.allProductsHistory : this.historyList;
    return list.filter(h => h.operationType === 'REDUCE').length;
  }
  
  getProductRate(productId: number): number {
  const product = this.products.find(p => p.id === productId);
  return product?.rate ?? 0;
}
}