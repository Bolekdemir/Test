import { ArrowRight, ArrowCounterClockwise, Check, SlidersHorizontal, X } from '@phosphor-icons/react';
import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Avatar } from '../components/Avatar';
import { TOPIC_BY_ID } from '../data/topics';
import type { Action } from '../game/logic';
import type { Game } from '../game/types';
import type { FloodTone } from '../components/Flood';
import { spring } from '../motion';

const SUSPENSE_MS = 1500;

/** A second tied vote: nobody goes out and the game moves on. */
function NoEjection({ game, dispatch }: { game: Game; dispatch: (a: Action) => void }) {
  const left = game.players.filter((p) => p.alive && p.role === 'imposter').length;
  return (
    <div className="screen--center" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div className="verdict">
        <p className="verdict__lead">Tied again.</p>
        <h1 className="display verdict__big">Nobody goes out.</h1>
        <p className="verdict__note">
          The {left === 1 ? 'imposter is' : 'imposters are'} still among you.
        </p>
        <button type="button" className="btn btn--primary btn--lg" onClick={() => dispatch({ type: 'continue', now: Date.now() })}>
          Next round <ArrowRight size={20} weight="bold" />
        </button>
      </div>
    </div>
  );
}

export function Verdict(props: { game: Game; dispatch: (a: Action) => void; setFlood: (t: FloodTone | null) => void }) {
  if (!props.game.lastEjectedId) return <NoEjection game={props.game} dispatch={props.dispatch} />;
  return <Ejection {...props} />;
}

function Ejection({ game, dispatch, setFlood }: { game: Game; dispatch: (a: Action) => void; setFlood: (t: FloodTone | null) => void }) {
  const reduce = useReducedMotion();
  const [revealed, setRevealed] = useState(false);
  const ejected = game.players.find((p) => p.id === game.lastEjectedId)!;
  const wasImposter = ejected.role === 'imposter';
  const left = game.players.filter((p) => p.alive && p.role === 'imposter').length;

  useEffect(() => {
    const id = window.setTimeout(() => {
      setRevealed(true);
      setFlood(wasImposter ? 'imposter' : 'crew');
    }, reduce ? 600 : SUSPENSE_MS);
    return () => window.clearTimeout(id);
  }, [reduce, setFlood, wasImposter]);

  const note = game.pendingGuessId
    ? 'One last chance. If they guess the word, the imposters win.'
    : game.winner
    ? 'That settles it.'
    : wasImposter
      ? `${left} more ${left === 1 ? 'imposter is' : 'imposters are'} still hiding.`
      : `The ${left === 1 ? 'imposter is' : 'imposters are'} still among you.`;

  const fg = wasImposter ? 'on-color' : 'on-sage';

  return (
    <div className="screen--center" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div className={`verdict ${revealed ? fg : ''}`} style={{ transition: 'color 500ms ease' }}>
        <p className="verdict__lead">{ejected.name} was</p>
        <motion.h1
          className="display verdict__big"
          initial={false}
          animate={revealed ? { opacity: 1, filter: 'blur(0px)' } : { opacity: 0.35, filter: 'blur(14px)' }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          aria-live="polite"
        >
          {revealed ? (wasImposter ? 'an imposter.' : 'not an imposter.') : 'an imposter?'}
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, transform: 'translateY(12px)' }}
          animate={revealed ? { opacity: 1, transform: 'translateY(0px)' } : {}}
          transition={{ ...spring, delay: 0.45 }}
        >
          <p className="verdict__note">{note}</p>
          <button
            type="button"
            className="btn btn--on-color btn--lg"
            disabled={!revealed}
            onClick={() => dispatch({ type: 'continue', now: Date.now() })}
          >
            {game.pendingGuessId ? 'Last chance' : game.winner ? 'See who won' : 'Next round'}{' '}
            <ArrowRight size={20} weight="bold" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}

export function LastChance({ game, dispatch }: { game: Game; dispatch: (a: Action) => void }) {
  const reduce = useReducedMotion();
  const guesser = game.players.find((p) => p.id === game.pendingGuessId);
  if (!guesser) return null;
  const item = (i: number) => ({
    initial: reduce ? { opacity: 0 } : { opacity: 0, transform: 'translateY(16px)' },
    animate: { opacity: 1, transform: 'translateY(0px)' },
    transition: { ...spring, delay: 0.1 + i * 0.08 },
  });
  const answer = (correct: boolean) => dispatch({ type: 'lastGuess', correct, now: Date.now() });

  return (
    <div className="screen--center" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div className="verdict on-color">
        <motion.p className="verdict__lead" {...item(0)}>
          Last chance
        </motion.p>
        <motion.h1 className="display verdict__big" {...item(1)}>
          {guesser.name}, guess the word.
        </motion.h1>
        <motion.div {...item(2)}>
          <p className="verdict__note">Say it out loud, once. Everyone else, did they get it?</p>
          <div className="over__actions">
            <button type="button" className="btn btn--on-color btn--lg" onClick={() => answer(true)}>
              <Check size={20} weight="bold" /> They got it
            </button>
            <button type="button" className="btn btn--ghost-on-color btn--lg" onClick={() => answer(false)}>
              <X size={20} weight="bold" /> Wrong
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function Over({ game, dispatch, setFlood }: { game: Game; dispatch: (a: Action) => void; setFlood: (t: FloodTone | null) => void }) {
  const reduce = useReducedMotion();
  const imposters = game.players.filter((p) => p.role === 'imposter');
  const crewWon = game.winner === 'crew';
  const topic = TOPIC_BY_ID[game.topicId];
  const stealer = game.players.find((p) => p.id === game.stolenById);
  useEffect(() => setFlood(crewWon ? 'forest' : 'imposter'), [crewWon, setFlood]);
  const item = (i: number) => ({
    initial: reduce ? { opacity: 0 } : { opacity: 0, transform: 'translateY(16px)' },
    animate: { opacity: 1, transform: 'translateY(0px)' },
    transition: { ...spring, delay: 0.25 + i * 0.08 },
  });

  return (
    <div className="screen--center" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div className="over on-color">
        <motion.h1 className="display" style={{ fontSize: 'clamp(56px, 9vw, 104px)' }} {...item(0)}>
          {crewWon ? 'Crew wins.' : imposters.length === 1 ? 'Imposter wins.' : 'Imposters win.'}
        </motion.h1>
        {stealer && (
          <motion.p className="verdict__note" style={{ margin: '16px 0 0' }} {...item(0)}>
            Caught, but {stealer.name} guessed the word.
          </motion.p>
        )}
        <motion.div {...item(1)}>
          <p className="verdict__lead" style={{ marginTop: 36, fontSize: 22 }}>
            The word was
          </p>
          <p className="display over__word">{game.word}</p>
        </motion.div>
        <motion.div {...item(2)}>
          <p style={{ margin: 0 }}>
            {topic?.name}. {imposters.length === 1 ? 'The imposter was' : 'The imposters were'}
          </p>
          <div className="chips">
            {imposters.map((p) => (
              <span key={p.id} className="chip">
                <Avatar id={p.id} name={p.name} /> {p.name}
              </span>
            ))}
          </div>
        </motion.div>
        <motion.div className="over__actions" {...item(3)}>
          <button type="button" className="btn btn--on-color btn--lg" onClick={() => dispatch({ type: 'playAgain', now: Date.now() })}>
            <ArrowCounterClockwise size={20} weight="bold" /> Play again
          </button>
          <button type="button" className="btn btn--ghost-on-color btn--lg" onClick={() => dispatch({ type: 'endGame' })}>
            <SlidersHorizontal size={20} /> Change setup
          </button>
        </motion.div>
      </div>
    </div>
  );
}
