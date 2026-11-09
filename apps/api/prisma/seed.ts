/**
 * Seeds the catalog with made-up shops and products. Wipes all data first, so
 * it can be run any number of times. Run with `npm run seed` from the root.
 */
import { pathToFileURL } from 'node:url';
import { existsSync } from 'node:fs';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../src/generated/prisma/client.js';

interface SeedProduct {
  title: string;
  description: string;
  priceCents: number;
  stock: number;
  shopName: string;
}

interface SeedCategory {
  name: string;
  slug: string;
  products: SeedProduct[];
}

// Every shop name below is invented for this demo.
export const SEED_CATEGORIES: SeedCategory[] = [
  {
    name: 'Jewelry',
    slug: 'jewelry',
    products: [
      { title: 'Hammered Silver Stacking Rings (Set of 3)', priceCents: 4200, stock: 12, shopName: 'Driftwood & Wire', description: 'Three thin sterling silver bands with a hand-hammered finish. Wear them together or apart.' },
      { title: 'Tiny Moon Phase Necklace', priceCents: 3600, stock: 8, shopName: 'Little Orbit Studio', description: 'A delicate chain carrying the eight phases of the moon, cut from recycled brass.' },
      { title: 'Sea Glass Drop Earrings', priceCents: 2800, stock: 5, shopName: 'Tidepool Trinkets', description: 'Frosted sea glass gathered on the shore, wrapped in copper wire on gold-filled hooks.' },
      { title: 'Pressed Flower Resin Pendant', priceCents: 3100, stock: 0, shopName: 'Meadow Keepsakes', description: 'Real forget-me-nots set in clear resin on an 18 inch chain. Currently sold out.' },
      { title: 'Beaded Friendship Bracelet', priceCents: 1400, stock: 30, shopName: 'Knot & Bead Co.', description: 'Glass seed beads on stretch cord in a rainbow gradient. One size fits most.' },
    ],
  },
  {
    name: 'Home & Living',
    slug: 'home-and-living',
    products: [
      { title: 'Speckled Stoneware Mug', priceCents: 2800, stock: 15, shopName: 'Kiln Street Pottery', description: 'Wheel-thrown 12 oz mug with an oatmeal speckle glaze. Dishwasher and microwave safe.' },
      { title: 'Hand-Poured Soy Candle, Cedar & Fig', priceCents: 2200, stock: 20, shopName: 'Ember Hollow', description: 'An 8 oz soy wax candle with a cotton wick and about 45 hours of burn time.' },
      { title: 'Macrame Plant Hanger', priceCents: 2600, stock: 9, shopName: 'Knot & Bead Co.', description: 'Knotted from soft cotton cord with a wooden ring. Holds pots up to 8 inches wide.' },
      { title: 'Woven Wool Throw Blanket', priceCents: 12800, stock: 3, shopName: 'Hearth Loom', description: 'A heavy herringbone throw woven on a floor loom from undyed wool.' },
      { title: 'Olive Wood Serving Board', priceCents: 4800, stock: 7, shopName: 'Grain & Grove', description: 'Cut from a single piece of olive wood and finished with food-safe oil.' },
      { title: 'Linen Napkins (Set of 4)', priceCents: 3400, stock: 14, shopName: 'Flax & Thread', description: 'Stonewashed linen napkins with mitered corners, in a soft sage green.' },
    ],
  },
  {
    name: 'Art & Prints',
    slug: 'art-and-prints',
    products: [
      { title: 'Mountain Lake Watercolor Print', priceCents: 2400, stock: 25, shopName: 'Paper Lantern Prints', description: 'An 8 x 10 inch giclee print of an original watercolor, on cotton rag paper.' },
      { title: 'Linocut Fox Art Print', priceCents: 3000, stock: 10, shopName: 'Inkwell & Owl', description: 'Hand-pulled linocut in rust and charcoal ink. Signed and numbered, edition of 50.' },
      { title: 'Botanical Line Drawing Set', priceCents: 3800, stock: 18, shopName: 'Little Orbit Studio', description: 'Three minimalist botanical prints in 5 x 7 inch size, ready for small frames.' },
      { title: 'Original Abstract Acrylic on Canvas', priceCents: 18500, stock: 1, shopName: 'Studio Marigold', description: 'A one-of-a-kind 16 x 20 inch painting in warm ochre and teal.' },
    ],
  },
  {
    name: 'Clothing',
    slug: 'clothing',
    products: [
      { title: 'Hand-Knit Wool Beanie', priceCents: 3200, stock: 11, shopName: 'Purl & Pine', description: 'A ribbed beanie knit from soft merino. Fits most adults.' },
      { title: 'Block-Printed Cotton Scarf', priceCents: 2900, stock: 6, shopName: 'Indigo Hand Press', description: 'Lightweight cotton voile hand stamped with carved wooden blocks.' },
      { title: 'Embroidered Denim Jacket', priceCents: 14500, stock: 2, shopName: 'Stitch Society', description: 'A vintage denim jacket with hand-embroidered wildflowers across the back.' },
      { title: 'Plant-Dyed Linen Apron', priceCents: 5600, stock: 8, shopName: 'Flax & Thread', description: 'A cross-back apron in linen dyed with avocado pits, with two deep pockets.' },
      { title: 'Chunky Knit Wool Socks', priceCents: 2400, stock: 0, shopName: 'Purl & Pine', description: 'Thick house socks for cold floors. Currently sold out.' },
    ],
  },
  {
    name: 'Paper Goods',
    slug: 'paper-goods',
    products: [
      { title: 'Letterpress Thank You Cards (Set of 6)', priceCents: 1800, stock: 22, shopName: 'Inkwell & Owl', description: 'Six folded cards printed on a hand-fed letterpress, with kraft envelopes.' },
      { title: 'Hand-Bound Leather Journal', priceCents: 4400, stock: 6, shopName: 'Quire & Quill', description: 'Coptic-stitched journal with 192 pages of unlined cotton paper.' },
      { title: 'Watercolor Botanical Sticker Sheet', priceCents: 600, stock: 40, shopName: 'Paper Lantern Prints', description: 'Twelve matte vinyl stickers of painted leaves and flowers.' },
      { title: 'Recycled Paper Weekly Planner', priceCents: 2600, stock: 13, shopName: 'Quire & Quill', description: 'An undated weekly planner on 100 percent recycled paper.' },
      { title: 'Washi Tape Bundle (Set of 5)', priceCents: 1200, stock: 0, shopName: 'Meadow Keepsakes', description: 'Five rolls of patterned paper tape in spring colors. Currently sold out.' },
    ],
  },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function seed(prisma: PrismaClient): Promise<void> {
  // Children first, so foreign keys never block a delete.
  await prisma.orderLine.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // Spread creation times so "newest first" has a stable order.
  const now = Date.now();
  let index = 0;

  for (const category of SEED_CATEGORIES) {
    const created = await prisma.category.create({
      data: { name: category.name, slug: category.slug },
    });
    for (const product of category.products) {
      await prisma.product.create({
        data: {
          ...product,
          slug: slugify(product.title),
          categoryId: created.id,
          createdAt: new Date(now - index * 60 * 60 * 1000),
        },
      });
      index += 1;
    }
  }
}

export function createSeedClient(url?: string): PrismaClient {
  return new PrismaClient({
    adapter: new PrismaBetterSqlite3({
      url: url ?? process.env.DATABASE_URL ?? 'file:./dev.db',
    }),
  });
}

async function main(): Promise<void> {
  if (existsSync('.env')) process.loadEnvFile('.env');
  const prisma = createSeedClient();
  try {
    await seed(prisma);
    const products = await prisma.product.count();
    const categories = await prisma.category.count();
    console.log(`Seeded ${categories} categories and ${products} products.`);
  } finally {
    await prisma.$disconnect();
  }
}

const runDirectly =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (runDirectly) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
}
