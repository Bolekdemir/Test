import { ArrowUp, Eye } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { GameMenu } from '../components/GameMenu';
import { SecretCard } from '../components/SecretCard';
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
  const [peeked, setPeeked] = useState(false);

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
        <SecretCard
          imposter={imposter}
          topic={TOPIC_BY_ID[game.topicId]?.name}
          word={game.word}
          onPeek={() => setPeeked(true)}
        />

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
