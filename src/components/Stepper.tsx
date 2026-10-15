import { Minus, Plus } from '@phosphor-icons/react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useRef } from 'react';
import { springSnappy } from '../motion';

interface Props {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  label: string;
}

/** Number changes roll vertically inside a fixed cell, never reflowing. */
export function Stepper({ value, min, max, onChange, label }: Props) {
  const prev = useRef(value);
  const dir = value >= prev.current ? 1 : -1;
  prev.current = value;
  const reduce = useReducedMotion();
  const offset = reduce ? 0 : 100;

  return (
    <div className="stepper" role="group" aria-label={label}>
      <button
        type="button"
        className="icon-btn"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label={`Fewer ${label.toLowerCase()}`}
      >
        <Minus size={20} weight="bold" />
      </button>
      <div className="stepper__value num" aria-live="polite">
        <AnimatePresence initial={false} custom={dir}>
          <motion.span
            key={value}
            className="roll"
            custom={dir}
            initial={{ transform: `translateY(${dir * offset}%)`, opacity: 0 }}
            animate={{ transform: 'translateY(0%)', opacity: 1 }}
            exit={{ transform: `translateY(${-dir * offset}%)`, opacity: 0 }}
            transition={springSnappy}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </div>
      <button
        type="button"
        className="icon-btn"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={`More ${label.toLowerCase()}`}
      >
        <Plus size={20} weight="bold" />
      </button>
    </div>
  );
}
