import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { spring } from '../motion';

interface Props {
  imposter: boolean;
  topic?: string;
  word?: string;
  /** Called the first time the card is lifted far enough to read. */
  onPeek: () => void;
  /** Nudge the card once to teach the gesture. */
  teach?: boolean;
}

/** The smoked-glass card you slide up to read; it always snaps back to hide the secret. */
export function SecretCard({ imposter, topic, word, onPeek, teach = true }: Props) {
  const reduce = useReducedMotion();
  const slot = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(400);
  const [peeked, setPeeked] = useState(false);
  const [touched, setTouched] = useState(false);
  const y = useMotionValue(0);
  // The secret stays fully hidden until the card is clearly lifted.
  const faceOpacity = useTransform(y, [-40, -height * 0.32], [0, 1], { clamp: true });
  const lift = -height * 0.82;
  const onPeekRef = useRef(onPeek);
  onPeekRef.current = onPeek;

  useEffect(() => {
    const el = slot.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setHeight(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    return y.on('change', (v) => {
      if (v < -height * 0.3) setPeeked(true);
    });
  }, [y, height]);

  useEffect(() => {
    if (peeked) onPeekRef.current();
  }, [peeked]);

  // A small lift that teaches the gesture, once, if nobody has touched the card yet.
  useEffect(() => {
    if (reduce || touched || !teach) return;
    const id = window.setTimeout(() => {
      animate(y, [0, -26, 0], { duration: 0.9, ease: [0.23, 1, 0.32, 1], times: [0, 0.35, 1] });
    }, 1100);
    return () => window.clearTimeout(id);
  }, [reduce, touched, teach, y]);

  const onKey = (e: KeyboardEvent, down: boolean) => {
    if (e.key !== ' ' && e.key !== 'Enter') return;
    e.preventDefault();
    if (e.repeat) return;
    setTouched(true);
    animate(y, down ? lift * 0.85 : 0, spring);
  };

  return (
    <div className="peek__slot" ref={slot}>
      <motion.div
        className={`peek__face ${imposter ? 'peek__face--imposter' : ''}`}
        style={{ opacity: faceOpacity }}
        aria-hidden={!peeked}
      >
        {imposter ? (
          <>
            <span className="peek__label">You are the</span>
            <span className="peek__word">Imposter</span>
            <span className="peek__label" style={{ marginTop: 10 }}>
              Blend in. You don’t know the word.
            </span>
          </>
        ) : (
          <>
            <span className="peek__label">{topic}</span>
            <span className="peek__word">{word}</span>
          </>
        )}
      </motion.div>
      <motion.div
        className="peek__cover"
        role="button"
        tabIndex={0}
        aria-label="Secret card. Slide up, or hold Space, to peek."
        drag="y"
        dragConstraints={{ top: lift, bottom: 0 }}
        dragElastic={{ top: 0.06, bottom: 0 }}
        dragMomentum={false}
        dragSnapToOrigin
        dragTransition={{ bounceStiffness: 420, bounceDamping: 38 }}
        onPointerDown={() => setTouched(true)}
        onKeyDown={(e) => onKey(e, true)}
        onKeyUp={(e) => onKey(e, false)}
        style={{ y }}
      >
        <div className="glass-card">
          <span className="glass-card__mark">M</span>
        </div>
      </motion.div>
    </div>
  );
}
