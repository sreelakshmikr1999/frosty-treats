import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ProductState } from '../../store/product.reducer';
import {
  selectProductById,
  selectAllProducts,
  selectLoading,
} from '../../store/product.selectors';
import * as ProductActions from '../../store/product.actions';
import { Product } from '../../models/product.model';
import { Subject, takeUntil, filter, switchMap, of } from 'rxjs';

@Component({
  selector: 'app-create-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-product.component.html',
  styleUrl: './create-product.component.scss',
})
export class CreateProductComponent implements OnInit, OnDestroy {
  productForm: FormGroup;
  isEditMode = false;
  productId: number | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private store: Store<ProductState>,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      description: [''],
      imageUrl: [''],
      ingredients: [''],
      rating: [0, [Validators.min(0), Validators.max(5)]],
    });
  }

  ngOnInit() {
    this.store.dispatch(ProductActions.loadProducts());

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.productId = Number(id);

      this.store
        .select(selectLoading)
        .pipe(
          takeUntil(this.destroy$),
          filter((loading) => !loading),
          switchMap(() => {
            if (this.productId !== null) {
              return this.store.select(selectProductById(this.productId));
            }
            return of(null);
          })
        )
        .subscribe((product) => {
          if (product) {
            this.productForm.patchValue({
              name: product.name,
              price: product.price,
              description: product.description,
              imageUrl: product.imageUrl,
              ingredients: Array.isArray(product.ingredients)
                ? product.ingredients.join(', ')
                : product.ingredients,
              rating: product.rating,
            });
          } else {
            this.router.navigate(['/products']);
          }
        });

      this.store
        .select(selectAllProducts)
        .pipe(
          takeUntil(this.destroy$),
          filter((products) => products.length > 0)
        )
        .subscribe((products) => {
          console.log('Available products:', products);
          console.log('Looking for product with ID:', this.productId);
        });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit() {
    if (this.productForm.valid) {
      const formValue = this.productForm.value;
      const product: Product = {
        ...formValue,
        ingredients: formValue.ingredients
          .split(',')
          .map((i: string) => i.trim()),
        id: this.isEditMode ? this.productId! : Math.floor(Date.now() / 1000),
      };

      if (this.isEditMode) {
        this.store.dispatch(ProductActions.updateProduct({ product }));
      } else {
        this.store.dispatch(ProductActions.addProduct({ product }));
      }

      this.router.navigate(['/products']);
    }
  }

  onCancel() {
    this.router.navigate(['/products']);
  }

  getErrorMessage(): string {
    if (this.productForm.valid) {
      return '';
    }

    const errors: string[] = [];

    if (this.productForm.get('name')?.errors?.['required']) {
      errors.push('Name is required');
    }
    if (this.productForm.get('price')?.errors?.['required']) {
      errors.push('Price is required');
    } else if (this.productForm.get('price')?.errors?.['min']) {
      errors.push('Price must be greater than 0');
    }
    return errors.length > 0
      ? 'Please fix the following errors:\n' + errors.join('\n')
      : '';
  }
}
