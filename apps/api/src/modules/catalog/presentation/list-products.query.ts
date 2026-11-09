import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import type { ProductListQuery, ProductSort } from '@mini-etsy/shared';
import { MAX_PRODUCT_LIMIT } from '../application/list-products.use-case.js';

const SORTS: ProductSort[] = ['new', 'price_asc', 'price_desc'];

export class ListProductsQuery implements ProductListQuery {
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'category must be a category slug' })
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;

  @IsOptional()
  @IsIn(SORTS)
  sort?: ProductSort;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PRODUCT_LIMIT)
  limit?: number;
}
