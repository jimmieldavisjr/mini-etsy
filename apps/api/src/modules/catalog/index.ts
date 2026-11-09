// Catalog's public API. Other modules import from this file only.
export { CatalogModule } from './catalog.module.js';
export {
  CatalogQueryService,
  type ProductSnapshot,
} from './application/catalog-query.service.js';
