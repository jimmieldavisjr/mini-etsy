import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import type { CartDto } from '@mini-etsy/shared';
import {
  AddItem,
  GetCart,
  RemoveItem,
  UpdateQuantity,
} from '../application/cart.use-cases.js';
import {
  CART_COOKIE,
  CART_COOKIE_OPTIONS,
  cartIdFrom,
} from './cart-cookie.js';
import { AddCartItemBody, UpdateCartItemBody } from './cart.dto.js';

@Controller('cart')
export class CartController {
  constructor(
    private readonly getCart: GetCart,
    private readonly addItem: AddItem,
    private readonly updateQuantity: UpdateQuantity,
    private readonly removeItem: RemoveItem,
  ) {}

  @Get()
  get(@Req() req: Request): Promise<CartDto> {
    return this.getCart.execute(cartIdFrom(req));
  }

  @Post('items')
  async add(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: AddCartItemBody,
  ): Promise<CartDto> {
    const cart = await this.addItem.execute(
      cartIdFrom(req),
      body.productId,
      body.quantity,
    );
    if (cart.id && cart.id !== cartIdFrom(req)) {
      res.cookie(CART_COOKIE, cart.id, CART_COOKIE_OPTIONS);
    }
    return cart;
  }

  @Patch('items/:productId')
  update(
    @Req() req: Request,
    @Param('productId') productId: string,
    @Body() body: UpdateCartItemBody,
  ): Promise<CartDto> {
    return this.updateQuantity.execute(
      cartIdFrom(req),
      productId,
      body.quantity,
    );
  }

  @Delete('items/:productId')
  remove(
    @Req() req: Request,
    @Param('productId') productId: string,
  ): Promise<CartDto> {
    return this.removeItem.execute(cartIdFrom(req), productId);
  }
}
