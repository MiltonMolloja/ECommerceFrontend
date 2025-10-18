import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OrderService } from '../../../core/services/order.service';
import { CustomerService } from '../../../core/services/customer.service';
import { CatalogService } from '../../catalog/services/catalog.service';
import {
  Client,
  Product,
  OrderPayment,
  OrderCreateItem,
  OrderCreateCommand
} from '../../../core/models';

interface OrderItem extends OrderCreateItem {
  product?: Product;
}

@Component({
  selector: 'app-orders-create',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatInputModule,
    MatTableModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './orders-create.html',
  styleUrl: './orders-create.scss'
})
export class OrdersCreate implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private orderService = inject(OrderService);
  private customerService = inject(CustomerService);
  private catalogService = inject(CatalogService);

  orderForm!: FormGroup;
  clients = signal<Client[]>([]);
  products = signal<Product[]>([]);
  orderItems = signal<OrderItem[]>([]);
  loading = signal(false);
  processing = signal(false);

  paymentTypes = [
    { value: OrderPayment.CreditCard, label: 'Tarjeta de crédito' },
    { value: OrderPayment.PayPal, label: 'PayPal' },
    { value: OrderPayment.BankTransfer, label: 'Transferencia bancaria' }
  ];

  displayedColumns: string[] = ['item', 'price', 'quantity', 'total', 'actions'];

  ngOnInit(): void {
    this.initForm();
    this.loadClients();
    this.loadProducts();
  }

  initForm(): void {
    this.orderForm = this.fb.group({
      paymentType: [OrderPayment.CreditCard, Validators.required],
      clientId: [null, Validators.required],
      productId: [null],
      quantity: [1, [Validators.required, Validators.min(1)]]
    });
  }

  loadClients(): void {
    this.customerService.getClients(1, 100).subscribe({
      next: (response) => {
        this.clients.set(response.items);
      },
      error: (error) => {
        console.error('Error loading clients:', error);
      }
    });
  }

  loadProducts(): void {
    this.catalogService.getProducts(1, 100).subscribe({
      next: (response) => {
        this.products.set(response.items);
      },
      error: (error) => {
        console.error('Error loading products:', error);
      }
    });
  }

  addProduct(): void {
    const productId = this.orderForm.get('productId')?.value;
    const quantity = this.orderForm.get('quantity')?.value;

    if (!productId || !quantity) {
      return;
    }

    const product = this.products().find((p) => p.productId === productId);
    if (!product) {
      return;
    }

    const existingItem = this.orderItems().find((item) => item.productId === productId);
    if (existingItem) {
      // Update quantity if item already exists
      existingItem.quantity += quantity;
      this.orderItems.set([...this.orderItems()]);
    } else {
      // Add new item
      const newItem: OrderItem = {
        productId: product.productId,
        quantity,
        price: product.price,
        product
      };
      this.orderItems.set([...this.orderItems(), newItem]);
    }

    // Reset product selection
    this.orderForm.patchValue({ productId: null, quantity: 1 });
  }

  removeItem(productId: number): void {
    this.orderItems.set(this.orderItems().filter((item) => item.productId !== productId));
  }

  getItemTotal(item: OrderItem): number {
    return item.price * item.quantity;
  }

  getTotal(): number {
    return this.orderItems().reduce((sum, item) => sum + this.getItemTotal(item), 0);
  }

  createOrder(): void {
    if (this.orderForm.invalid || this.orderItems().length === 0) {
      return;
    }

    this.processing.set(true);

    const command: OrderCreateCommand = {
      clientId: this.orderForm.get('clientId')?.value,
      paymentType: this.orderForm.get('paymentType')?.value,
      items: this.orderItems().map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      }))
    };

    this.orderService.createOrder(command).subscribe({
      next: (response) => {
        if (response.success) {
          // Simulate processing delay
          setTimeout(() => {
            this.processing.set(false);
            this.router.navigate(['/orders']);
          }, 2000);
        } else {
          this.processing.set(false);
          console.error('Error creating order:', response.message);
        }
      },
      error: (error) => {
        this.processing.set(false);
        console.error('Error creating order:', error);
      }
    });
  }
}
