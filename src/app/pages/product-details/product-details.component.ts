import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ProductState } from '../../store/product.reducer';
import { selectProductById } from '../../store/product.selectors';
import * as ProductActions from '../../store/product.actions';
import { Product } from '../../models/product.model';
import { Subject, takeUntil, filter, take } from 'rxjs';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit, OnDestroy {
  cake: Product | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<ProductState>
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.store.select(selectProductById(Number(id)))
        .pipe(
          take(1),
          takeUntil(this.destroy$)
        )
        .subscribe(product => {
          if (!product) {
            this.store.dispatch(ProductActions.loadProducts());
          } else {
            this.cake = product;
          }
        });

      this.store.select(selectProductById(Number(id)))
        .pipe(
          filter(product => !!product),
          takeUntil(this.destroy$)
        )
        .subscribe(product => {
          if (product) {
            this.cake = product;
          } else {
            this.router.navigate(['/products']);
          }
        });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goBack() {
    this.router.navigate(['/products']);
  }
}
