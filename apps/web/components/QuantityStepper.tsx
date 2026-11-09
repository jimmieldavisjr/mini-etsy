'use client';

import { MinusIcon, PlusIcon } from './icons';
import styles from './QuantityStepper.module.css';

/** A Fluent NumberBox-style stepper: minus, the value, plus. */
export function QuantityStepper({
  value,
  min = 1,
  max,
  onChange,
  label,
  disabled = false,
  size = 'medium',
}: {
  value: number;
  min?: number;
  max: number;
  onChange: (next: number) => void;
  /** Names the control for screen readers, e.g. "Quantity for Mug". */
  label: string;
  disabled?: boolean;
  size?: 'medium' | 'large';
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={`${styles.stepper} ${size === 'large' ? styles.large : ''}`}
    >
      <button
        type="button"
        className={styles.button}
        onClick={() => onChange(value - 1)}
        disabled={disabled || value <= min}
        aria-label="Decrease quantity"
      >
        <MinusIcon size={16} />
      </button>
      <output className={styles.value} aria-live="polite">
        {value}
      </output>
      <button
        type="button"
        className={styles.button}
        onClick={() => onChange(value + 1)}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
      >
        <PlusIcon size={16} />
      </button>
    </div>
  );
}
