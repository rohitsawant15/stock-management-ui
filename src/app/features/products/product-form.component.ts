import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {

  productForm: FormGroup;
  isEditMode = false;
  productId: number | null = null;
  isLoading = false;
  isFetching = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.productForm = this.fb.group({
      productCode: ['', [Validators.required]],
      productName: ['', [Validators.required]],
      productType: [''],
      rate:        [null, [Validators.required, Validators.min(0)]],
      volume:      [null],
      quantity:    [null, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.productId = +id;
      this.loadProductForEdit(this.productId);
    }
  }

  get f() { return this.productForm.controls; }

  loadProductForEdit(id: number): void {
    this.isFetching = true;
    this.productService.getProductById(id).subscribe({
      next: (res) => {
        this.productForm.patchValue({
          productCode: res.data.productCode,
          productName: res.data.productName,
          productType: res.data.productType,
          rate:        res.data.rate,
          volume:      res.data.volume,
          quantity:    res.data.quantity
        });
        this.isFetching = false;
        this.cdr.detectChanges();   // ← force view to update after data arrives
      },
      error: () => {
        this.errorMessage = 'Failed to load product details';
        this.isFetching = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const payload = this.productForm.value;

    const request$ = this.isEditMode && this.productId
      ? this.productService.updateProduct(this.productId, payload)
      : this.productService.createProduct(payload);

    request$.subscribe({
      next: () => {
        this.router.navigate(['/products']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Operation failed';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}