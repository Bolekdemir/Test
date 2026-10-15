import type { Transition } from 'motion/react';

/** Critically damped default: no overshoot, Apple-style response. */
export const spring: Transition = { type: 'spring', bounce: 0, duration: 0.45 };
export const springSnappy: Transition = { type: 'spring', bounce: 0, duration: 0.3 };
/** Only for motion that carries momentum from a gesture. */
export const springMomentum: Transition = { type: 'spring', bounce: 0.18, duration: 0.5 };
export const easeOut = [0.23, 1, 0.32, 1] as const;
