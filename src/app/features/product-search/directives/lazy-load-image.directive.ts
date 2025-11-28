import { Directive, ElementRef, OnInit, inject } from '@angular/core';

@Directive({
  selector: 'img[appLazyLoadImage]',
  standalone: true
})
export class LazyLoadImageDirective implements OnInit {
  private el = inject(ElementRef);

  ngOnInit(): void {
    if ('IntersectionObserver' in window) {
      this.setupIntersectionObserver();
    } else {
      this.loadImage();
    }
  }

  private setupIntersectionObserver(): void {
    const options = {
      root: null,
      rootMargin: '50px',
      threshold: 0.01
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.loadImage();
          observer.unobserve(this.el.nativeElement);
        }
      });
    }, options);

    observer.observe(this.el.nativeElement);
  }

  private loadImage(): void {
    const img = this.el.nativeElement as HTMLImageElement;
    const src = img.getAttribute('data-src') || img.src;

    img.src = src;
    img.classList.add('loaded');
  }
}
