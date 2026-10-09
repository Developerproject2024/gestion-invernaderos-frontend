import { Injectable, inject } from '@angular/core';

import { Greenhouse } from '../models/greenhouse.model';
import { AuthStore } from './auth.store';

@Injectable({
  providedIn: 'root',
})
export class GreenhouseAccessService {
  private readonly authStore = inject(AuthStore);

  filterForCurrentUser(
    greenhouses: Greenhouse[],
  ): Greenhouse[] {
    if (this.authStore.isAdmin()) {
      return [...greenhouses];
    }

    const userId = this.authStore.currentUser()?.id;

    if (!userId) {
      return [];
    }

    return greenhouses.filter((greenhouse) =>
      greenhouse.assignedUserIds.includes(userId),
    );
  }
}
