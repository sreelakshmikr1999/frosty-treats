import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../service/product.service';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Observable, Subject, takeUntil, filter, take } from 'rxjs';
import { Store } from '@ngrx/store';
import * as ProductActions from '../../store/product.actions';
import { ProductState } from '../../store/product.reducer';
import {
  selectAllProducts,
  selectError,
  selectLoading,
} from '../../store/product.selectors';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  imports: [CommonModule, MatDialogModule],
  standalone: true,
})
export class ProductListComponent implements OnInit, OnDestroy {
  private store = inject(Store<ProductState>);

  products: Product[] = [];
  loading$ = this.store.select(selectLoading);
  error$ = this.store.select(selectError);
  products$ = this.store.select(selectAllProducts);
  private destroy$ = new Subject<void>();

  private productsLoaded = false;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.products$
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe((products) => {
        if (products.length === 0 && !this.productsLoaded) {
          this.store.dispatch(ProductActions.loadProducts());
          this.productsLoaded = true;
        }
      });

    this.products$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (products) => {
        this.products = products;
        this.currentPage = 1;
      },
      error: (error) => {
        console.error('Error loading products:', error);
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  hoveredProduct: number | null = null;

  currentPage = 1;
  itemsPerPage = 4;

  get totalPages(): number {
    return Math.ceil(this.products.length / this.itemsPerPage);
  }

  get paginatedProducts(): Product[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.products.slice(startIndex, endIndex);
  }

  viewDetails(productId: number) {
    this.router.navigate(['/product-details', productId]);
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  createProduct() {
    this.router.navigate(['/create']);
  }

  editProduct(id: number) {
    this.router.navigate(['/create', id]);
  }

  deleteProduct(product: Product) {
    console.log('Deleting product:', product);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      hasBackdrop: true,
      disableClose: true,
      data: {
        title: 'Delete Product',
        message: `Are you sure you want to delete ${product.name}?`,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.store.dispatch(ProductActions.deleteProduct({ id: product.id }));
      }
    });
  }
}
