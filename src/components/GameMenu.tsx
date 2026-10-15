import { DotsThree, SignOut, X } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { springSnappy } from '../motion';

/** Quiet escape hatch for ending a game, with a confirm step. */
export function GameMenu({ onEnd, dark = false }: { onEnd: () => void; dark?: boolean }) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  useEffect(() => {
    if (!open) setConfirm(false);
  }, [open]);

  return (
    <div className="menu" ref={ref}>
      <button
        type="button"
        className="icon-btn icon-btn--plain"
        style={dark ? { color: 'rgba(238,241,234,0.8)' } : undefined}
        aria-label="Game menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <X size={24} /> : <DotsThree size={28} weight="bold" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="menu__panel"
            initial={{ opacity: 0, transform: 'scale(0.95)' }}
            animate={{ opacity: 1, transform: 'scale(1)' }}
            exit={{ opacity: 0, transform: 'scale(0.95)', transition: { duration: 0.15 } }}
            transition={springSnappy}
          >
            {confirm ? (
              <>
                <p className="menu__note" style={{ margin: 0 }}>
                  End this game? Roles and votes will be lost.
                </p>
                <button type="button" className="menu__item menu__item--danger" onClick={onEnd}>
                  <SignOut size={20} /> End game
                </button>
                <button type="button" className="menu__item" onClick={() => setOpen(false)}>
                  Keep playing
                </button>
              </>
            ) : (
              <button type="button" className="menu__item menu__item--danger" onClick={() => setConfirm(true)}>
                <SignOut size={20} /> End game
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
