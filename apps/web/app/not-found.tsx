import Link from 'next/link';
import ui from '@/components/ui.module.css';

export default function NotFound() {
  return (
    <div className={ui.page}>
      <h1>We couldn&apos;t find that</h1>
      <p className={ui.lead}>It may have sold out, moved, or never existed.</p>
      <Link href="/" className={ui.button}>
        Back to the shop
      </Link>
    </div>
  );
}
