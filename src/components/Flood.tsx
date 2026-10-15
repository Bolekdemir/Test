import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

export type FloodTone = 'imposter' | 'crew' | 'forest';

/**
 * A full-screen color that floods outward from the centre, like ink into water.
 * A newer flood covers the old one; leaving the verdict screens fades it away.
 */
export function Flood({ tone }: { tone: FloodTone | null }) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence custom={tone !== null}>
      {tone && (
        <motion.div
          key={tone}
          className={`drench drench--${tone}`}
          aria-hidden
          custom={tone !== null}
          variants={{
            hidden: reduce ? { opacity: 0, zIndex: 1 } : { clipPath: 'circle(0% at 50% 50%)', zIndex: 1 },
            shown: reduce
              ? { opacity: 1, zIndex: 1 }
              : { clipPath: 'circle(75% at 50% 50%)', opacity: 1, zIndex: 1 },
            gone: (replaced: boolean) =>
              replaced
                ? { zIndex: 0, opacity: 0, transition: { opacity: { delay: 0.85, duration: 0 } } }
                : { zIndex: 0, opacity: 0, transition: { duration: 0.35 } },
          }}
          initial="hidden"
          animate="shown"
          exit="gone"
          transition={{ duration: reduce ? 0.3 : 0.8, ease: [0.77, 0, 0.175, 1] }}
        />
      )}
    </AnimatePresence>
  );
}
