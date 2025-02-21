import { ActionReducerMap } from '@ngrx/store';
import { ProductState, productReducer } from './product.reducer';

export interface AppState {
  products: ProductState;
}

export const appReducer: ActionReducerMap<AppState> = {
  products: productReducer
}; 