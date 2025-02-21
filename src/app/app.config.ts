import { ApplicationConfig, provideZoneChangeDetection, isDevMode, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools, StoreDevtoolsModule } from '@ngrx/store-devtools';
import { productReducer } from './store/product.reducer';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ProductEffects } from './store/product.effects';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(),
    provideRouter(routes),
    provideStore({
      products: productReducer  // Register the products feature
    }),
    provideEffects([ProductEffects]),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
    provideAnimationsAsync(),
    importProvidersFrom(
      StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: false })  // Configure DevTools here
    ),
  ],
};

