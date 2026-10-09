import {
  Component,
  inject,
} from '@angular/core';

import { AuthStore } from '../../../core/auth/auth.store';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css',
})
export class TopbarComponent {
  private readonly authStore =
    inject(AuthStore);

  readonly currentUser =
    this.authStore.currentUser;
}
