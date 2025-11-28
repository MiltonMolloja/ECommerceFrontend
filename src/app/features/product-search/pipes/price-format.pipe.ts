import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'priceFormat',
  standalone: true
})
export class PriceFormatPipe implements PipeTransform {
  transform(value: number): string {
    const [integer, decimal] = value.toFixed(2).split('.');

    return `${integer}.${decimal}`;
  }
}
