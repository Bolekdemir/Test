import { ArrowRight, DeviceMobile, Question } from '@phosphor-icons/react';
import { motion, useReducedMotion } from 'motion/react';
import type { Action } from '../game/logic';
import { springMomentum } from '../motion';

const FAN = [-14, -3, 9];

export function Home({ dispatch, hasGame, onResume }: { dispatch: (a: Action) => void; hasGame: boolean; onResume: () => void }) {
  const reduce = useReducedMotion();
  return (
    <div className="home">
      <div className="home__copy">
        <h1 className="display wordmark">Mert</h1>
        <p className="home__lede">Everyone gets the secret word. Almost everyone.</p>
        <div className="home__actions">
          {hasGame ? (
            <>
              <button type="button" className="btn btn--primary btn--lg" onClick={onResume}>
                Resume game <ArrowRight size={20} weight="bold" />
              </button>
              <button type="button" className="btn btn--secondary btn--lg" onClick={() => dispatch({ type: 'go', phase: 'setup' })}>
                New game
              </button>
            </>
          ) : (
            <button type="button" className="btn btn--primary btn--lg" onClick={() => dispatch({ type: 'go', phase: 'setup' })}>
              New game <ArrowRight size={20} weight="bold" />
            </button>
          )}
          <button type="button" className="btn btn--ghost btn--lg" onClick={() => dispatch({ type: 'go', phase: 'howto' })}>
            <Question size={22} /> How to play
          </button>
        </div>
        <div className="home__join">
          <button type="button" className="btn btn--ghost" onClick={() => (location.hash = '#/join')}>
            <DeviceMobile size={20} /> Join a game with a code
          </button>
        </div>
      </div>
      <div className="home__cards" aria-hidden>
        {FAN.map((deg, i) => (
          <motion.div
            key={deg}
            className="glass-card"
            initial={reduce ? { opacity: 0 } : { opacity: 0, transform: 'translateY(60px) rotate(0deg)' }}
            animate={{ opacity: 1, transform: `translateY(0px) rotate(${deg}deg)` }}
            transition={{ ...springMomentum, delay: 0.15 + i * 0.07 }}
          >
            {i === FAN.length - 1 && <span className="glass-card__mark">M</span>}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
