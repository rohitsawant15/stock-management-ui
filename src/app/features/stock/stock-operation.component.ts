import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { StockService } from '../../core/services/stock.service';
import { ProductService } from '../../core/services/product.service';
import { ProductResponse } from '../../shared/models/product.model';
import { StockOperationType } from '../../shared/models/stock.model';
import { SearchableDropdownComponent, DropdownOption } from '../../shared/components/searchable-dropdown.component';

@Component({
  selector: 'app-stock-operation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, SearchableDropdownComponent],
  templateUrl: './stock-operation.component.html',
  styleUrls: ['./stock-operation.component.scss']
})
export class StockOperationComponent implements OnInit {

  stockForm: FormGroup;
  activeOperation: StockOperationType = 'ADD';
  products: ProductResponse[] = [];
  // Mapped options for the dropdown component
  productOptions: DropdownOption[] = [];
  isLoadingProducts = false;
  selectedProduct: ProductResponse | null = null;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  updatedProduct: ProductResponse | null = null;

  constructor(
    private fb: FormBuilder,
    private stockService: StockService,
    private productService: ProductService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {
    this.stockForm = this.fb.group({
      productId: [null, [Validators.required]],
      quantity:  [null, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['type'] === 'ADD' || params['type'] === 'REDUCE') {
        this.activeOperation = params['type'] as StockOperationType;
      }
    });
    this.loadAllProducts();
  }

  loadAllProducts(): void {
    this.isLoadingProducts = true;
    this.productService.getAllProductsForDropdown().subscribe({
      next: (products) => {
        this.products = products;
        // Map to DropdownOption shape
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

  // Called when dropdown emits a new value
  onProductSelected(productId: number | null): void {
    this.stockForm.patchValue({ productId });
    this.selectedProduct = productId
      ? this.products.find(p => p.id === productId) || null
      : null;
    this.cdr.detectChanges();
  }

  setOperation(op: StockOperationType): void {
    this.activeOperation = op;
    this.successMessage = '';
    this.errorMessage = '';
    this.updatedProduct = null;
    this.stockForm.reset();
    this.selectedProduct = null;
  }

  get f() { return this.stockForm.controls; }

  onSubmit(): void {
    if (this.stockForm.invalid) {
      this.stockForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.updatedProduct = null;

    const request = {
      productId: +this.stockForm.value.productId,
      quantity:  +this.stockForm.value.quantity
    };

    const operation$ = this.activeOperation === 'ADD'
      ? this.stockService.addStock(request)
      : this.stockService.reduceStock(request);

    operation$.subscribe({
      next: (res) => {
        this.updatedProduct = res.data;
        this.productService.clearCache();
        this.successMessage = this.activeOperation === 'ADD'
          ? `Successfully added ${request.quantity} units to ${res.data.productName}`
          : `Successfully reduced ${request.quantity} units from ${res.data.productName}`;
        this.stockForm.reset();
        this.selectedProduct = null;
        this.isSubmitting = false;
        this.loadAllProducts();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Operation failed. Please try again.';
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }
}