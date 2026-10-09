import { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';

import { MainLayoutComponent } from './shared/layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import(
        './features/auth/login/login.component'
      ).then((m) => m.LoginComponent),
  },

  {
    path: '',
    canActivate: [authGuard],
    component: MainLayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import(
            './features/dashboard/dashboard.component'
          ).then((m) => m.DashboardComponent),
      },

      {
        path: 'greenhouses',
        canActivate: [
          roleGuard(['ADMIN']),
        ],
        loadComponent: () =>
          import(
            './features/greenhouses/greenhouse-list/greenhouse-list.component'
          ).then(
            (m) => m.GreenhouseListComponent,
          ),
      },

      {
        path: 'production-cycles',
        canActivate: [roleGuard(['ADMIN'])],
        loadComponent: () =>
          import(
            './features/production-cycles/production-cycle-list/production-cycle-list.component'
          ).then((m) => m.ProductionCycleListComponent),
      },

      {
        path: 'expenses',
        loadComponent: () =>
          import(
            './features/expenses/expense-list/expense-list.component'
          ).then(
            (m) => m.ExpenseListComponent,
          ),
      },

      {
        path: 'products',
        loadComponent: () =>
          import(
            './features/products/product-list/product-list.component'
          ).then(
            (m) => m.ProductListComponent,
          ),
      },

      {
        path: 'products/movements',
        loadComponent: () =>
          import(
            './features/products/product-movement-list/product-movement-list.component'
          ).then(
            (m) => m.ProductMovementListComponent,
          ),
      },

      {
          path: 'portfolio',
          loadComponent: () =>
            import(
              './features/portfolio/portfolio-list/portfolio-list.component'
            ).then((m) => m.PortfolioListComponent),
      },

      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
    ],
  },

  {
    path: '**',
    redirectTo: 'dashboard',
  },
];