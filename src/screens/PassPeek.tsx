import { ArrowUp, Eye } from '@phosphor-icons/react';
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { GameMenu } from '../components/GameMenu';
import { TOPIC_BY_ID } from '../data/topics';
import type { Action } from '../game/logic';
import type { Game } from '../game/types';
import { spring } from '../motion';

interface Props {
  game: Game;
  dispatch: (a: Action) => void;
  onEnd: () => void;
}

function Progress({ game }: { game: Game }) {
  return (
    <div className="pass__progress" aria-label={`Player ${game.revealIndex + 1} of ${game.players.length}`}>
      {game.players.map((p, i) => (
        <span
          key={p.id}
          className="pass__tick"
          data-state={i < game.revealIndex ? 'done' : i === game.revealIndex ? 'now' : 'next'}
        />
      ))}
    </div>
  );
}

export function Pass({ game, dispatch, onEnd }: Props) {
  const player = game.players[game.revealIndex];
  return (
    <>
      <header className="topbar">
        <span style={{ width: 48 }} />
        <Progress game={game} />
        <GameMenu onEnd={onEnd} />
      </header>
      <div className="screen--center" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <p className="verdict__lead muted">Pass the iPad to</p>
        <h1 className="display pass__name">{player.name}</h1>
        <button type="button" className="btn btn--primary btn--lg" onClick={() => dispatch({ type: 'ready' })}>
          I’m {player.name}
        </button>
        <p className="faint" style={{ marginTop: 20, fontSize: 15 }}>
          Everyone else, look away.
        </p>
      </div>
    </>
  );
}

export function Peek({ game, dispatch, onEnd }: Props) {
  const player = game.players[game.revealIndex];
  const imposter = player.role === 'imposter';
  const reduce = useReducedMotion();
  const slot = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(400);
  const [peeked, setPeeked] = useState(false);
  const [touched, setTouched] = useState(false);
  const y = useMotionValue(0);
  // The secret stays fully hidden until the card is clearly lifted.
  const faceOpacity = useTransform(y, [-40, -height * 0.32], [0, 1], { clamp: true });
  const lift = -height * 0.82;

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

  // A small lift that teaches the gesture, once, if nobody has touched the card yet.
  useEffect(() => {
    if (reduce || touched) return;
    const id = window.setTimeout(() => {
      animate(y, [0, -26, 0], { duration: 0.9, ease: [0.23, 1, 0.32, 1], times: [0, 0.35, 1] });
    }, 1100);
    return () => window.clearTimeout(id);
  }, [reduce, touched, y]);

  const onKey = (e: KeyboardEvent, down: boolean) => {
    if (e.key !== ' ' && e.key !== 'Enter') return;
    e.preventDefault();
    if (e.repeat) return;
    setTouched(true);
    animate(y, down ? lift * 0.85 : 0, spring);
  };

  const topic = TOPIC_BY_ID[game.topicId];

  return (
    <>
      <header className="topbar">
        <span style={{ width: 48 }} />
        <span className="topbar__title" style={{ color: 'rgba(238,241,234,0.72)' }}>
          {player.name}, only you look
        </span>
        <GameMenu onEnd={onEnd} dark />
      </header>
      <div className="screen--center" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
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
                <span className="peek__label">{topic?.name}</span>
                <span className="peek__word">{game.word}</span>
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

        <div style={{ minHeight: 64, display: 'grid', placeItems: 'center' }}>
          <AnimatePresence mode="wait" initial={false}>
            {peeked ? (
              <motion.button
                key="done"
                type="button"
                className="btn btn--glass btn--lg peek__done"
                initial={{ opacity: 0, transform: 'translateY(8px)' }}
                animate={{ opacity: 1, transform: 'translateY(0px)' }}
                transition={spring}
                onClick={() => dispatch({ type: 'donePeeking', now: Date.now() })}
              >
                <Eye size={22} /> Got it, pass it on
              </motion.button>
            ) : (
              <motion.p key="hint" className="peek__hint" exit={{ opacity: 0, transition: { duration: 0.12 } }}>
                <ArrowUp size={18} weight="bold" /> Slide the card up to peek
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
