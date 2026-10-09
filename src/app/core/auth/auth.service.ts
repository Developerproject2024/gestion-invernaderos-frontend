import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

import { User } from '../models/user.model';
import { AuthStore } from './auth.store';
import { MOCK_USERS } from '../../infrastructure/data/mock-users';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly authStore = inject(AuthStore);

  login(email: string, password: string): Observable<User> {
    const user = MOCK_USERS.find(
      (item) =>
        item.email.toLowerCase() === email.trim().toLowerCase() &&
        item.password === password,
    );

    if (!user) {
      return throwError(() => new Error('Credenciales inválidas'));
    }

    this.authStore.setUser(user);

    return of(user).pipe(delay(300));
  }

  logout(): void {
    this.authStore.clearUser();
  }

  getCurrentUser(): User | null {
    return this.authStore.currentUser();
  }

  isAuthenticated(): boolean {
    return this.authStore.isAuthenticated();
  }
}