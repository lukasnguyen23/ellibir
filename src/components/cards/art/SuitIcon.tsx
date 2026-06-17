import type { Suit } from '@/engine/types';
import { SUIT_COLORS } from './constants';

interface Props {
  suit: Suit;
  size?: number;
  className?: string;
}

export function SuitIcon({ suit, size = 24, className }: Props) {
  const fill = SUIT_COLORS[suit];
  const s = size;

  if (suit === 'hearts') {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" className={className} aria-hidden>
        <path
          fill={fill}
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        />
      </svg>
    );
  }

  if (suit === 'diamonds') {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" className={className} aria-hidden>
        <path fill={fill} d="M12 2l9 10-9 10-9-10 9-10z" />
      </svg>
    );
  }

  if (suit === 'clubs') {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" className={className} aria-hidden>
        <path
          fill={fill}
          d="M12 2c-1.8 0-3.2 1.3-3.5 3C6.8 5.5 5 7.6 5 10c0 2.4 1.6 4.4 3.8 5-.6 1.1-1 2.3-1 3.5h2.2c0-1 .3-1.9.8-2.7 1 .3 2 .5 3.2.5s2.2-.2 3.2-.5c.5.8.8 1.7.8 2.7H17c0-1.2-.4-2.4-1-3.5 2.2-.6 3.8-2.6 3.8-5 0-2.4-1.8-4.5-3.5-4.5C15.2 3.3 13.8 2 12 2z"
        />
      </svg>
    );
  }

  return (
    <svg width={s} height={s} viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill={fill}
        d="M12 2c-2 0-3.5 1.5-3.8 3.5C5.5 6.5 3 8.8 3 12c0 3.6 2.8 6.5 6.3 6.8v2.2h5.4v-2.2c3.5-.3 6.3-3.2 6.3-6.8 0-3.2-2.5-5.5-5.2-6.5C15.5 3.5 14 2 12 2zm0 3c.5 0 .9.3 1.1.7-.1 0-.2 0-.3 0-2.5.2-4.5 2.2-4.5 4.8 0 .8.2 1.5.5 2.2 1.2-.4 2.5-.7 3.9-.7 1.4 0 2.7.3 3.9.7.3-.7.5-1.4.5-2.2 0-2.6-2-4.6-4.5-4.8-.1 0-.2 0-.3 0 .2-.4.6-.7 1.1-.7z"
      />
    </svg>
  );
}
