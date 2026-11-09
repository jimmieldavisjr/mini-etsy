import { IsEmail, IsIn, IsString, MaxLength, MinLength } from 'class-validator';
import type {
  ChangeOrderStatusRequest,
  CheckoutRequest,
} from '@mini-etsy/shared';
import { ORDER_STATUSES, type OrderStatus } from '../domain/order-status.js';

export class CheckoutBody implements CheckoutRequest {
  @IsEmail()
  @MaxLength(254)
  email: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  shippingName: string;

  @IsString()
  @MinLength(5)
  @MaxLength(500)
  shippingAddress: string;
}

export class ChangeStatusBody implements ChangeOrderStatusRequest {
  @IsIn(ORDER_STATUSES)
  status: OrderStatus;
}
