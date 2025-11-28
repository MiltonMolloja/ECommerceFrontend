import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  currency?: string;
}

interface ShippingAddress {
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  zipCode: string;
  country: string;
}

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatCardModule, MatDividerModule],
  templateUrl: './order-confirmation.html',
  styleUrls: ['./order-confirmation.scss']
})
export class OrderConfirmationComponent implements OnInit {
  private router = inject(Router);

  orderNumber = '';
  total = 0;
  items: OrderItem[] = [];
  shippingAddress: ShippingAddress | null = null;
  orderDate = new Date();

  ngOnInit(): void {
    // Obtener datos de la navegación
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state || history.state;

    if (state && state.orderNumber) {
      this.orderNumber = state.orderNumber;
      this.total = state.total;
      this.items = state.items || [];
      this.shippingAddress = state.shippingAddress;
    } else {
      // Si no hay datos, redirigir al home
      this.router.navigate(['/']);
    }
  }

  continueShopping(): void {
    this.router.navigate(['/']);
  }
}
