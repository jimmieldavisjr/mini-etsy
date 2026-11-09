import type { OrderDto } from '@mini-etsy/shared';
import type { Order } from '../domain/order.js';

export function toOrderDto(order: Order): OrderDto {
  return {
    id: order.id,
    status: order.status,
    totalCents: order.total.cents,
    email: order.shipping.email,
    shippingName: order.shipping.shippingName,
    shippingAddress: order.shipping.shippingAddress,
    createdAt: order.createdAt.toISOString(),
    lines: order.lines.map((line) => ({
      productId: line.productId,
      title: line.titleSnapshot,
      unitPriceCents: line.unitPrice.cents,
      quantity: line.quantity.value,
      lineTotalCents: line.lineTotal.cents,
    })),
  };
}
