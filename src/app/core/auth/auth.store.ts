import { Injectable, computed, signal } from '@angular/core';

import { User } from '../models/user.model';

const AUTH_STORAGE_KEY = 'invernadero_current_user';

@Injectable({
  providedIn: 'root',
})
export class AuthStore {
  private readonly currentUserSignal = signal<User | null>(
    this.loadUser(),
  );

  readonly currentUser = this.currentUserSignal.asReadonly();

  readonly isAuthenticated = computed(
    () => this.currentUserSignal() !== null,
  );

  readonly isAdmin = computed(
    () => this.currentUserSignal()?.role === 'ADMIN',
  );

  readonly isGeneral = computed(
    () => this.currentUserSignal()?.role === 'GENERAL',
  );

  setUser(user: User): void {
    this.currentUserSignal.set(user);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  }

  clearUser(): void {
    this.currentUserSignal.set(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  private loadUser(): User | null {
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as User;
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
  }
}