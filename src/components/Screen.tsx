import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';
import { spring } from '../motion';

interface Props {
  children: ReactNode;
  className?: string;
  /** 1 = moving forward (enter from the right), -1 = going back. */
  dir: number;
  label: string;
}

export function Screen({ children, className = '', dir, label }: Props) {
  const reduce = useReducedMotion();
  const shift = reduce ? 0 : 40;
  return (
    <motion.main
      className={`screen ${className}`}
      aria-label={label}
      custom={dir}
      variants={{
        enter: (d: number) => ({ opacity: 0, transform: `translateX(${d * shift}px)` }),
        center: { opacity: 1, transform: 'translateX(0px)' },
        exit: (d: number) => ({ opacity: 0, transform: `translateX(${-d * shift}px)` }),
      }}
      initial="enter"
      animate="center"
      exit="exit"
      transition={spring}
    >
      {children}
    </motion.main>
  );
}
