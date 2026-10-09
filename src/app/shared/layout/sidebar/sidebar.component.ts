import {
  Component,
  inject,
} from '@angular/core';

import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';
import { AuthStore } from '../../../core/auth/auth.store';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  private readonly router = inject(Router);

  private readonly authService =
    inject(AuthService);

  private readonly authStore =
    inject(AuthStore);

  readonly currentUser =
    this.authStore.currentUser;

  readonly isAdmin =
    this.authStore.isAdmin;

  logout(): void {
    this.authService.logout();

    this.router.navigate(['/login']);
  }
}