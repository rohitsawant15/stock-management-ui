import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
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
  isLoadingHistory = false;
  errorMessage = '';
  filterType: 'ALL' | 'ADD' | 'REDUCE' = 'ALL';

  constructor(
    private stockService: StockService,
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
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
      },
      error: () => {
        this.errorMessage = 'Failed to load products';
        this.isLoadingProducts = false;
        this.cdr.detectChanges();
      }
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
    if (this.filterType === 'ALL') return this.historyList;
    return this.historyList.filter(h => h.operationType === this.filterType);
  }

  get addCount(): number {
    return this.historyList.filter(h => h.operationType === 'ADD').length;
  }

  get reduceCount(): number {
    return this.historyList.filter(h => h.operationType === 'REDUCE').length;
  }
}