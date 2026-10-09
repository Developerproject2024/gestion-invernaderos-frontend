import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import {
  provideCharts,
  withDefaultRegisterables,
} from 'ng2-charts';

import { routes } from './app.routes';

import { GreenhouseRepository } from './domain/repositories/greenhouse.repository';
import { MockGreenhouseRepository } from './infrastructure/repositories/mock-greenhouse.repository';

import { ExpenseRepository } from './domain/repositories/expense.repository';
import { MockExpenseRepository } from './infrastructure/repositories/mock-expense.repository';

import { ProductRepository } from './domain/repositories/product.repository';
import { MockProductRepository } from './infrastructure/repositories/mock-product.repository';
import { ProductionCycleRepository } from './domain/repositories/production-cycle.repository';
import { MockProductionCycleRepository } from './infrastructure/repositories/mock-production-cycle.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    provideCharts(
      withDefaultRegisterables(),
    ),

    {
      provide: GreenhouseRepository,
      useClass: MockGreenhouseRepository,
    },

    {
      provide: ExpenseRepository,
      useClass: MockExpenseRepository,
    },

    {
      provide: ProductRepository,
      useClass: MockProductRepository,
    },

    {
      provide: ProductionCycleRepository,
      useClass: MockProductionCycleRepository,
    },
  ],
};