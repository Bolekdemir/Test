import { motion } from 'motion/react';
import { useId } from 'react';
import { spring } from '../motion';

interface Option<T> {
  value: T;
  label: string;
}

interface Props<T> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}

export function Segmented<T extends string | number | null>({ options, value, onChange, label }: Props<T>) {
  const id = useId();
  return (
    <div className="segmented" role="radiogroup" aria-label={label}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            role="radio"
            aria-checked={active}
            className="segmented__opt"
            onClick={() => onChange(opt.value)}
          >
            {active && <motion.span layoutId={`thumb-${id}`} className="segmented__thumb" transition={spring} />}
            <span className="segmented__label">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
