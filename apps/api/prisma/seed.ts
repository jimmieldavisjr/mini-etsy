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
      { title: 'Speckled Stoneware Mug', priceCents: 2800, stock: 15, shopName: 'Kiln Street Pottery', description: 'Wheel-thrown 12 oz tumbler-mug in a sage-green speckle glaze over raw stoneware. Dishwasher and microwave safe.' },
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
      { title: 'Hand-Pulled Abstract Linocut Print', priceCents: 3000, stock: 10, shopName: 'Inkwell & Owl', description: 'A carved-block linocut in umber and bone ink, pulled by hand on Japanese paper. Signed and numbered, edition of 50.' },
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

/**
 * Free-licence photos on Unsplash, linked rather than copied: [photo id, page
 * slug]. The id builds the CDN URL; the page slug credits the photographer.
 */
type Photo = readonly [id: string, pageSlug: string];

export const CATEGORY_PHOTOS: Record<string, Photo> = {
  jewelry: ['1624588057318-5f1b2eb81012', 'silver-ring-on-persons-finger-e_vZmriImrE'],
  'home-and-living': ['1610206349499-c932c3b3aacb', 'white-ceramic-teacup-on-brown-wooden-shelf-ZOeyUJB6t_Y'],
  'art-and-prints': ['1513519245088-0e12902e5a38', 'assorted-color-framed-paintings-on-the-wall-KuudDjBHIlA'],
  clothing: ['1632649027900-389e810204e6', 'a-woman-is-knitting-a-piece-of-fabric-WddCult7llk'],
  'paper-goods': ['1514809606235-a56fe6d553b4', 'flowers-on-card-near-pencil-0MQ2uRbHsi0'],
};

export const PRODUCT_PHOTOS: Record<string, Photo> = {
  'Hammered Silver Stacking Rings (Set of 3)': ['1620968867360-5cda83d2bffd', 'silver-ring-on-brown-wooden-table-UDrb3Bud44Y'],
  'Tiny Moon Phase Necklace': ['1739383601339-e233a1e8b74d', 'a-crescent-with-a-heart-hanging-from-it-GRo64TgvuYA'],
  'Sea Glass Drop Earrings': ['1635303519804-14ed22e49267', 'a-pair-of-earrings-hanging-from-a-hook-08BqGY4bNxg'],
  'Pressed Flower Resin Pendant': ['1783509097964-3a1123132492', 'many-handmade-resin-pendants-with-dried-flowers-and-illustrations-Cgp-CkpTJ_o'],
  'Beaded Friendship Bracelet': ['1766560360281-d3c264734a1f', 'a-collection-of-colorful-beaded-bracelets-arranged-in-a-row-qoYrGkW07ME'],
  'Speckled Stoneware Mug': ['1782351076283-73aa35f76058', 'a-speckled-green-ceramic-cup-on-a-wooden-table-BGEqCc-bQHg'],
  'Hand-Poured Soy Candle, Cedar & Fig': ['1612293905607-b003de9e54fb', 'hand-lighting-candle-in-glass-jar-OAW0OCLn52I'],
  'Macrame Plant Hanger': ['1746450912857-60bdc3b5d8df', 'macrame-plant-hanger-holds-two-potted-plants-rL64Me0_2CU'],
  'Woven Wool Throw Blanket': ['1734553529922-bc020a21643b', 'a-stack-of-blankets-sitting-on-top-of-each-other-WB7wXI8S0SE'],
  'Olive Wood Serving Board': ['1765120828282-63dc950b6f90', 'wooden-cutting-boards-with-natural-grain-patterns-o6FqxW6IAUI'],
  'Linen Napkins (Set of 4)': ['1596433904500-97b901c5d274', 'white-textile-on-brown-wooden-table-HbiRi1Owk9k'],
  'Mountain Lake Watercolor Print': ['1776870241545-f5c878fea373', 'watercolor-landscape-of-mountains-and-a-lake-cYd73bvnJxo'],
  'Hand-Pulled Abstract Linocut Print': ['1772463110548-9db0822b7dc4', 'abstract-linocut-print-with-dark-brown-and-white-elements-WpLghXFfwto'],
  'Botanical Line Drawing Set': ['1726924244606-5013bc85bde5', 'detailed-botanical-drawing-of-a-flowering-plant-k4AR2yvZpEA'],
  'Original Abstract Acrylic on Canvas': ['1541961017774-22349e4a1262', 'abstract-painting-e5LdlAMpkEw'],
  'Hand-Knit Wool Beanie': ['1544967919-44c1ef2f9e7a', 'gray-knitted-beanie-hat-y7NBxZuL-_w'],
  'Block-Printed Cotton Scarf': ['1693382288218-2ce85aa26974', 'a-bunch-of-scarves-hanging-on-a-clothes-line-iVpQhB0Hm5o'],
  'Embroidered Denim Jacket': ['1790430591906-7eea1bc85026', 'denim-jacket-with-crocheted-doily-zojXQ3WcxnI'],
  'Plant-Dyed Linen Apron': ['1729774092032-31b9e3a4e368', 'a-woman-wearing-a-brown-apron-and-white-shirt-FWlNleVmkbw'],
  'Chunky Knit Wool Socks': ['1632944968588-3ec2870641ce', 'a-pair-of-socks-and-a-hat-on-a-wooden-table-xERcZRbf42E'],
  'Letterpress Thank You Cards (Set of 6)': ['1760720962365-6ae03435c02a', 'hands-writing-on-a-blank-card-with-greenery-tA1N5B8O-nI'],
  'Hand-Bound Leather Journal': ['1654542645651-5196f4931cd6', 'a-green-notebook-sitting-on-top-of-a-wooden-table-KAnmK-kavKM'],
  'Watercolor Botanical Sticker Sheet': ['1654363529505-028513de9c2d', 'a-bunch-of-stickers-on-a-white-surface-Cld3FpncH6U'],
  'Recycled Paper Weekly Planner': ['1591195852468-03a01d1375d6', 'notebook-and-pen-on-white-IZj7vckPGiw'],
  'Washi Tape Bundle (Set of 5)': ['1785668709724-52ddd2f2c086', 'decorative-washi-tapes-with-various-patterns-on-a-white-background-TimXQ65-98c'],
};

const photoUrl = ([id]: Photo) => `https://images.unsplash.com/photo-${id}`;
const photoPage = ([, pageSlug]: Photo) => `https://unsplash.com/photos/${pageSlug}`;

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
    const categoryPhoto = CATEGORY_PHOTOS[category.slug];
    const created = await prisma.category.create({
      data: {
        name: category.name,
        slug: category.slug,
        imageUrl: categoryPhoto ? photoUrl(categoryPhoto) : null,
      },
    });
    for (const product of category.products) {
      const photo = PRODUCT_PHOTOS[product.title];
      await prisma.product.create({
        data: {
          ...product,
          slug: slugify(product.title),
          imageUrl: photo ? photoUrl(photo) : null,
          imageSourceUrl: photo ? photoPage(photo) : null,
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
