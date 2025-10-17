import { Injectable, computed, inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';

/**
 * Servicio singleton para gestionar breakpoints responsive con Signals
 */
@Injectable({
  providedIn: 'root'
})
export class BreakpointService {
  private breakpointObserver = inject(BreakpointObserver);

  // Observables convertidos a signals
  private readonly breakpointState = toSignal(
    this.breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small,
      Breakpoints.Medium,
      Breakpoints.Large,
      Breakpoints.XLarge
    ])
  );

  // Signals computados para cada breakpoint
  readonly isXSmall = computed(
    () => this.breakpointState()?.breakpoints[Breakpoints.XSmall] ?? false
  );

  readonly isSmall = computed(
    () => this.breakpointState()?.breakpoints[Breakpoints.Small] ?? false
  );

  readonly isMedium = computed(
    () => this.breakpointState()?.breakpoints[Breakpoints.Medium] ?? false
  );

  readonly isLarge = computed(
    () => this.breakpointState()?.breakpoints[Breakpoints.Large] ?? false
  );

  readonly isXLarge = computed(
    () => this.breakpointState()?.breakpoints[Breakpoints.XLarge] ?? false
  );

  // Signal computado para determinar si es móvil
  readonly isMobile = computed(() => this.isXSmall() || this.isSmall());

  // Signal computado para determinar si es tablet o mayor
  readonly isTabletOrDesktop = computed(() => !this.isMobile());
}
