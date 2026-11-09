import { IsInt, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import type {
  AddCartItemRequest,
  UpdateCartItemRequest,
} from '@mini-etsy/shared';

export class AddCartItemBody implements AddCartItemRequest {
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  productId: string;

  @IsInt()
  @Min(1)
  @Max(99)
  quantity: number;
}

export class UpdateCartItemBody implements UpdateCartItemRequest {
  @IsInt()
  @Min(1)
  @Max(99)
  quantity: number;
}
