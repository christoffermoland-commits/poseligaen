import RetroGame from '@/components/spill/RetroGame';
import Link from 'next/link';

export const metadata = {
  title: 'Spill - FS-appen',
  description: 'Spill retro FIFA mens du venter på kampene!',
};

export default function SpillPage() {
  return (
    <div className="space-y-4">
      <Link
        href="/"
        className="text-sm text-fpl-muted hover:text-fpl-green transition-colors"
      >
        &larr; Tilbake til ligatabell
      </Link>
      <RetroGame />
    </div>
  );
}
