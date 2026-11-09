import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import type { OrderDto } from '@mini-etsy/shared';
import { cartIdFrom } from '../../cart/index.js';
import { Checkout } from '../application/checkout.use-case.js';
import { ChangeStatus, GetOrder } from '../application/order.use-cases.js';
import { ChangeStatusBody, CheckoutBody } from './order.dto.js';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly checkout: Checkout,
    private readonly getOrder: GetOrder,
    private readonly changeStatus: ChangeStatus,
  ) {}

  /** Checks out the cart named by the cart cookie. */
  @Post()
  create(@Req() req: Request, @Body() body: CheckoutBody): Promise<OrderDto> {
    return this.checkout.execute(cartIdFrom(req), body);
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string): Promise<OrderDto> {
    return this.getOrder.execute(id);
  }

  /**
   * Moves an order along its status flow. There are no accounts in v1, so
   * this is open; the Identity module should restrict it to staff.
   */
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ChangeStatusBody,
  ): Promise<OrderDto> {
    return this.changeStatus.execute(id, body.status);
  }
}
