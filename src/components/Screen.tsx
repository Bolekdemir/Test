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
        // Motion's x clears to `transform: none` at rest. A leftover transform would turn the
        // screen into the containing block for fixed children, so docks would scroll away.
        enter: (d: number) => ({ opacity: 0, x: d * shift }),
        center: { opacity: 1, x: 0 },
        exit: (d: number) => ({ opacity: 0, x: -d * shift }),
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
