import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'app-table',
  standalone: true,
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent {
  readonly title =
    input('');

  readonly description =
    input('');

  readonly totalItems =
    input(0);

  readonly currentPage =
    input(1);

  readonly totalPages =
    input(1);

  readonly previousPage =
    output<void>();

  readonly nextPage =
    output<void>();

  readonly hasData =
    input(true);

  readonly emptyMessage =
    input('No hay registros disponibles.');

  readonly showPagination =
    input(true);

  onPreviousPage(): void {
    if (this.currentPage() <= 1) {
      return;
    }

    this.previousPage.emit();
  }

  onNextPage(): void {
    if (
      this.currentPage() >=
      this.totalPages()
    ) {
      return;
    }

    this.nextPage.emit();
  }
}