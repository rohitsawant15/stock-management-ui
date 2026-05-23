import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface DropdownOption {
  value: number;
  label: string;
  sublabel?: string;   // e.g. "60 in stock"
  badge?: string;      // e.g. product code
}

@Component({
  selector: 'app-searchable-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="custom-dropdown" [class.open]="isOpen" [class.disabled]="disabled">

      <!-- Trigger button -->
      <div class="dropdown-trigger" (click)="toggleDropdown()">
        <div class="trigger-content">
          <span class="trigger-placeholder" *ngIf="!selectedOption">{{ placeholder }}</span>
          <div class="trigger-selected" *ngIf="selectedOption">
            <span class="selected-badge" *ngIf="selectedOption.badge">{{ selectedOption.badge }}</span>
            <span class="selected-label">{{ selectedOption.label }}</span>
            <span class="selected-sublabel" *ngIf="selectedOption.sublabel">— {{ selectedOption.sublabel }}</span>
          </div>
        </div>
        <i class="bi bi-chevron-down dropdown-arrow"></i>
      </div>

      <!-- Dropdown panel -->
      <div class="dropdown-panel" *ngIf="isOpen">

        <!-- Search box inside dropdown -->
        <div class="dropdown-search">
          <i class="bi bi-search search-icon"></i>
          <input
            type="text"
            class="search-input"
            placeholder="Search products..."
            [(ngModel)]="searchTerm"
            (ngModelChange)="onSearch()"
            (click)="$event.stopPropagation()"
            #searchInput
          />
          <button class="clear-search" *ngIf="searchTerm" (click)="clearSearch()">
            <i class="bi bi-x"></i>
          </button>
        </div>

        <!-- Options list -->
        <div class="dropdown-options">

          <!-- Loading state -->
          <div class="dropdown-loading" *ngIf="loading">
            <span class="spinner-border spinner-border-sm text-primary me-2"></span>
            Loading products...
          </div>

          <!-- Empty state -->
          <div class="dropdown-empty" *ngIf="!loading && filteredOptions.length === 0">
            <i class="bi bi-search me-2"></i>
            No products found
          </div>

          <!-- Option items -->
          <div
            class="dropdown-option"
            *ngFor="let option of filteredOptions"
            [class.selected]="option.value === value"
            (click)="selectOption(option)"
          >
            <div class="option-left">
              <span class="option-badge" *ngIf="option.badge">{{ option.badge }}</span>
              <span class="option-label">{{ option.label }}</span>
            </div>
            <div class="option-right">
              <span class="option-sublabel" *ngIf="option.sublabel">{{ option.sublabel }}</span>
              <i class="bi bi-check-circle-fill check-icon" *ngIf="option.value === value"></i>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .custom-dropdown {
      position: relative;
      width: 100%;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

      &.disabled .dropdown-trigger {
        opacity: 0.6;
        cursor: not-allowed;
        pointer-events: none;
      }
    }

    /* ── Trigger ────────────────────────────────── */
    .dropdown-trigger {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      border: 1.5px solid #dee2e6;
      border-radius: 8px;
      background: white;
      cursor: pointer;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
      min-height: 44px;

      &:hover {
        border-color: #2d6a9f;
      }
    }

    .custom-dropdown.open .dropdown-trigger {
      border-color: #2d6a9f;
      box-shadow: 0 0 0 3px rgba(45, 106, 159, 0.15);
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }

    .trigger-content {
      flex: 1;
      overflow: hidden;
    }

    .trigger-placeholder {
      color: #adb5bd;
      font-size: 14px;
    }

    .trigger-selected {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .selected-badge {
      background: #e9ecef;
      color: #495057;
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 4px;
      letter-spacing: 0.3px;
    }

    .selected-label {
      font-size: 14px;
      font-weight: 500;
      color: #1e3a5f;
    }

    .selected-sublabel {
      font-size: 12px;
      color: #6c757d;
    }

    .dropdown-arrow {
      font-size: 12px;
      color: #2d6a9f;
      transition: transform 0.2s ease;
      flex-shrink: 0;
      margin-left: 8px;
    }

    .custom-dropdown.open .dropdown-arrow {
      transform: rotate(180deg);
    }

    /* ── Panel ──────────────────────────────────── */
    .dropdown-panel {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1.5px solid #2d6a9f;
      border-top: none;
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      z-index: 1000;
      overflow: hidden;
    }

    /* ── Search ─────────────────────────────────── */
    .dropdown-search {
      display: flex;
      align-items: center;
      padding: 8px 12px;
      border-bottom: 1px solid #f0f0f0;
      background: #f8f9fa;
      gap: 8px;

      .search-icon {
        color: #adb5bd;
        font-size: 13px;
        flex-shrink: 0;
      }

      .search-input {
        flex: 1;
        border: none;
        background: none;
        outline: none;
        font-size: 13px;
        color: #333;

        &::placeholder { color: #adb5bd; }
      }

      .clear-search {
        background: none;
        border: none;
        color: #adb5bd;
        cursor: pointer;
        padding: 0;
        font-size: 14px;
        line-height: 1;

        &:hover { color: #dc3545; }
      }
    }

    /* ── Options ────────────────────────────────── */
    .dropdown-options {
      max-height: 240px;
      overflow-y: auto;

      &::-webkit-scrollbar { width: 4px; }
      &::-webkit-scrollbar-track { background: #f8f9fa; }
      &::-webkit-scrollbar-thumb { background: #dee2e6; border-radius: 4px; }
    }

    .dropdown-loading,
    .dropdown-empty {
      padding: 16px;
      text-align: center;
      font-size: 13px;
      color: #6c757d;
    }

    .dropdown-option {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      cursor: pointer;
      transition: background 0.15s ease;
      border-bottom: 1px solid #f8f9fa;

      &:last-child { border-bottom: none; }

      &:hover {
        background: #f0f7ff;
      }

      &.selected {
        background: #e8f0fe;

        .option-label { color: #1e3a5f; font-weight: 600; }
      }

      .option-left {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
        overflow: hidden;
      }

      .option-badge {
        background: #1e3a5f;
        color: white;
        font-size: 10px;
        font-weight: 600;
        padding: 2px 7px;
        border-radius: 4px;
        white-space: nowrap;
        letter-spacing: 0.3px;
        flex-shrink: 0;
      }

      .option-label {
        font-size: 14px;
        color: #333;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .option-right {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
        margin-left: 12px;
      }

      .option-sublabel {
        font-size: 12px;
        color: #6c757d;
        white-space: nowrap;
      }

      .check-icon {
        color: #2d6a9f;
        font-size: 14px;
      }
    }
  `]
})
export class SearchableDropdownComponent implements OnChanges {

  @Input() options: DropdownOption[] = [];
  @Input() value: number | null = null;
  @Input() placeholder = '-- Select a product --';
  @Input() loading = false;
  @Input() disabled = false;
  @Output() valueChange = new EventEmitter<number | null>();

  isOpen = false;
  searchTerm = '';
  filteredOptions: DropdownOption[] = [];
  selectedOption: DropdownOption | null = null;

  constructor(private elementRef: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options']) {
      this.filteredOptions = [...this.options];
    }
    if (changes['value'] || changes['options']) {
      this.selectedOption = this.options.find(o => o.value === this.value) || null;
    }
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  toggleDropdown(): void {
    if (this.disabled) return;
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.searchTerm = '';
      this.filteredOptions = [...this.options];
    }
  }

  onSearch(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredOptions = this.options.filter(o =>
      o.label.toLowerCase().includes(term) ||
      (o.badge?.toLowerCase().includes(term)) ||
      (o.sublabel?.toLowerCase().includes(term))
    );
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filteredOptions = [...this.options];
  }

  selectOption(option: DropdownOption): void {
    this.selectedOption = option;
    this.valueChange.emit(option.value);
    this.isOpen = false;
    this.searchTerm = '';
  }
}