import Link from 'next/link';
import { Suspense } from 'react';
import { ArrowRightIcon, GiftIcon, HandIcon, LeafIcon } from '@/components/icons';
import { Photo } from '@/components/Photo';
import { ProductGrid, ProductGridSkeleton } from '@/components/ProductGrid';
import ui from '@/components/ui.module.css';
import { api } from '@/lib/api';
import { SITE_IMAGES } from '@/lib/site-images';
import styles from './home.module.css';

async function Collections() {
  const categories = await api.listCategories();
  return (
    <ul className={styles.collections}>
      {categories.map((category, i) => (
        <li key={category.id} className={i === 0 ? styles.featured : undefined}>
          <Link href={`/c/${category.slug}`} className={styles.collection}>
            <Photo
              src={category.imageUrl}
              alt=""
              sizes={i === 0 ? '(max-width: 760px) 100vw, 480px' : '(max-width: 760px) 50vw, 240px'}
              className={styles.collectionPhoto}
              zoomOnHover
            />
            <span className={styles.collectionText}>
              <span className={styles.collectionName}>{category.name}</span>
              <span className={styles.collectionCount}>
                {category.productCount} pieces <ArrowRightIcon size={14} />
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

async function NewArrivals() {
  const products = await api.listProducts({ sort: 'new', limit: 8 });
  return <ProductGrid products={products} />;
}

const PROMISES = [
  {
    icon: HandIcon,
    title: 'Made by hand',
    text: 'Every piece is shaped, stitched or printed by an independent maker.',
  },
  {
    icon: LeafIcon,
    title: 'Small batches',
    text: 'Short runs and honest materials, so stock is limited and nothing is wasted.',
  },
  {
    icon: GiftIcon,
    title: 'Ready to give',
    text: 'Packed with care in recycled paper, ready to hand to someone you love.',
  },
];

export default function HomePage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <span className={ui.eyebrow}>
            <span className={styles.eyebrowDot} aria-hidden="true" />
            The autumn edit
          </span>
          <h1 className={styles.heroTitle}>
            Objects made <em>slowly</em>, and by hand.
          </h1>
          <p className={styles.heroLead}>
            Stoneware, silver, linen and letterpress from small independent
            studios, chosen to be used every day and kept for years.
          </p>
          <div className={styles.heroActions}>
            <a href="#new" className={`${ui.buttonAccent} ${ui.large}`}>
              Shop new arrivals
            </a>
            <a href="#collections" className={`${ui.buttonStandard} ${ui.large}`}>
              Explore collections
            </a>
          </div>
        </div>

        <div className={styles.heroArt}>
          <Photo
            src={SITE_IMAGES.studio.src}
            alt={SITE_IMAGES.studio.alt}
            sizes="(max-width: 960px) 100vw, 560px"
            className={styles.heroMain}
            priority
          />
          <Photo
            src={SITE_IMAGES.mugs.src}
            alt={SITE_IMAGES.mugs.alt}
            sizes="(max-width: 960px) 50vw, 260px"
            className={styles.heroSide}
            priority
          />
          <Photo
            src={SITE_IMAGES.wrapping.src}
            alt={SITE_IMAGES.wrapping.alt}
            sizes="(max-width: 960px) 50vw, 260px"
            className={styles.heroSide}
          />
          <Link href="/p/speckled-stoneware-mug" className={styles.heroChip}>
            <span className={styles.heroChipLabel}>Maker of the week</span>
            <span className={styles.heroChipTitle}>Kiln Street Pottery</span>
            <span className={styles.heroChipMeta}>
              Speckled stoneware, from $28 <ArrowRightIcon size={14} />
            </span>
          </Link>
        </div>
      </section>

      <section id="collections" className={ui.section} aria-labelledby="collections-heading">
        <div className={ui.sectionHeader}>
          <div>
            <span className={ui.eyebrow}>Browse</span>
            <h2 id="collections-heading">Shop by collection</h2>
          </div>
        </div>
        <Suspense fallback={<div className={styles.collectionsSkeleton} />}>
          <Collections />
        </Suspense>
      </section>

      <section id="new" className={ui.section} aria-labelledby="new-heading">
        <div className={ui.sectionHeader}>
          <div>
            <span className={ui.eyebrow}>Just in</span>
            <h2 id="new-heading">Fresh from the workshop</h2>
          </div>
          <Link href="/search" className={ui.textLink}>
            Search everything
          </Link>
        </div>
        <Suspense fallback={<ProductGridSkeleton />}>
          <NewArrivals />
        </Suspense>
      </section>

      <section className={`${ui.section} ${styles.editorial}`} aria-labelledby="prints-heading">
        <Photo
          src={SITE_IMAGES.prints.src}
          alt={SITE_IMAGES.prints.alt}
          sizes="(max-width: 960px) 100vw, 640px"
          className={styles.editorialPhoto}
        />
        <div className={styles.editorialText}>
          <span className={ui.eyebrow}>The print room</span>
          <h2 id="prints-heading">Original art for walls that tell a story</h2>
          <p className={ui.lead}>
            Watercolors, hand-pulled linocuts and one-of-a-kind paintings,
            signed and numbered by the artists who made them.
          </p>
          <Link href="/c/art-and-prints" className={`${ui.buttonAccent} ${ui.large}`}>
            Visit the print room <ArrowRightIcon size={16} />
          </Link>
        </div>
      </section>

      <section className={`${ui.section} ${styles.promises}`} aria-label="Our promises">
        {PROMISES.map(({ icon: Icon, title, text }) => (
          <div key={title} className={styles.promise}>
            <span className={styles.promiseIcon}>
              <Icon size={22} />
            </span>
            <h3>{title}</h3>
            <p className={ui.muted}>{text}</p>
          </div>
        ))}
      </section>
    </>
  );
}
