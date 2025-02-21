import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProductState } from './product.reducer';

export const selectProductState =
  createFeatureSelector<ProductState>('products');

export const selectProducts = createSelector(
  selectProductState,
  (state) => state.products
);

export const selectAllProducts = createSelector(
  selectProductState,
  (state: ProductState) => state?.products ?? []
);

export const selectLoading = createSelector(
  selectProductState,
  (state: ProductState) => state?.loading ?? false
);

export const selectError = createSelector(
  selectProductState,
  (state: ProductState) => state?.error ?? null
);

export const selectProductById = (productId: number) =>
  createSelector(selectProductState, (state: ProductState) => {
    console.log('State in selector:', state);
    console.log('Looking for product ID:', productId);
    console.log(
      'Available product IDs:',
      state?.products.map((p) => p.id)
    );
    const product = state?.products.find(
      (p) => Number(p.id) === Number(productId)
    );
    console.log('Found product:', product);
    return product ?? null;
  });
