import { CaretLeft, Check, DeviceMobile, LockSimple } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { Avatar } from '../components/Avatar';
import type { Action } from '../game/logic';
import type { Game, GamePlayer } from '../game/types';


interface Props {
  game: Game;
  dispatch: (a: Action) => void;
  online: Set<string>;
}

/** A private ballot on the iPad for a player without a phone. */
function IpadBallot({ voter, game, onDone }: { voter: GamePlayer; game: Game; onDone: (targetId: string | null) => void }) {
  const [pick, setPick] = useState<string | null>(null);
  const options = (game.candidates ?? [])
    .filter((id) => id !== voter.id)
    .map((id) => game.players.find((p) => p.id === id)!)
    .filter(Boolean);
  const chosen = options.find((p) => p.id === pick);
  return (
    <motion.div
      className="ballot"
      role="dialog"
      aria-modal="true"
      aria-label={`${voter.name}’s secret vote`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <header className="topbar">
        <button type="button" className="icon-btn icon-btn--plain" style={{ color: 'rgba(238,241,234,0.8)' }} aria-label="Cancel" onClick={() => onDone(null)}>
          <CaretLeft size={22} weight="bold" />
        </button>
        <span className="topbar__title">Everyone else, look away</span>
        <span style={{ width: 48 }} />
      </header>
      <div className="vote">
        <h1 className="title" style={{ textAlign: 'center' }}>
          {voter.name}, who’s the imposter?
        </h1>
        <div className="vote-grid" role="radiogroup" aria-label="Candidates">
          {options.map((p) => (
            <button key={p.id} type="button" role="radio" aria-checked={pick === p.id} className="voter voter--dark" onClick={() => setPick(p.id)}>
              <Avatar id={p.id} name={p.name} />
              {p.name}
            </button>
          ))}
        </div>
      </div>
      <div className="dock dock--dark">
        <div className="dock__inner" style={{ justifyContent: 'center' }}>
          <button type="button" className="btn btn--glass btn--lg" disabled={!chosen} onClick={() => chosen && onDone(chosen.id)}>
            <LockSimple size={20} weight="bold" /> {chosen ? `Vote for ${chosen.name}` : 'Pick someone'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/** Phone games: secret ballots on phones, with private iPad ballots for anyone without one. */
export function PhoneVote({ game, dispatch, online }: Props) {
  const [ballotFor, setBallotFor] = useState<string | null>(null);
  const ballots = game.ballots ?? {};
  const alive = game.players.filter((p) => p.alive);
  const cast = alive.filter((p) => ballots[p.id]).length;
  const tied = (game.candidates ?? []).map((id) => game.players.find((p) => p.id === id)?.name).filter(Boolean);
  const voter = alive.find((p) => p.id === ballotFor);

  return (
    <>
      <header className="topbar">
        <button type="button" className="icon-btn" aria-label="Back to discussion" onClick={() => dispatch({ type: 'backToDiscuss' })}>
          <CaretLeft size={22} weight="bold" />
        </button>
        <span className="topbar__title num">
          {cast} of {alive.length} votes in
        </span>
        <span style={{ width: 48 }} />
      </header>
      <div className="vote">
        <div style={{ textAlign: 'center' }}>
          <h1 className="title">{game.revote ? 'It’s a tie. Vote again.' : 'Vote on your phones'}</h1>
          <p className="muted" style={{ fontSize: 18, margin: '12px 0 0' }}>
            {game.revote
              ? `Only ${tied.join(' or ')} this time.`
              : 'Votes are secret. The iPad reveals who goes out once everyone has voted.'}
          </p>
        </div>
        <div className="vote-grid">
          {alive.map((p) => {
            const done = !!ballots[p.id];
            if (!p.deviceId && !done) {
              return (
                <button key={p.id} type="button" className="voter" onClick={() => setBallotFor(p.id)}>
                  <Avatar id={p.id} name={p.name} />
                  {p.name}
                  <span className="voter__status">
                    <LockSimple size={16} weight="bold" /> Vote here
                  </span>
                </button>
              );
            }
            const offline = p.deviceId && !online.has(p.deviceId);
            return (
              <div key={p.id} className="voter" data-done={done}>
                <Avatar id={p.id} name={p.name} />
                {p.name}
                <span className="voter__status" data-tone={done ? 'done' : offline ? 'warn' : undefined}>
                  {done ? (
                    <>
                      <Check size={16} weight="bold" /> Voted
                    </>
                  ) : offline ? (
                    'Phone offline'
                  ) : (
                    <>
                      <DeviceMobile size={16} /> Voting
                    </>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      {cast > 0 && cast < alive.length && (
        <div className="dock">
          <div className="dock__inner" style={{ justifyContent: 'center' }}>
            <button type="button" className="btn btn--secondary btn--lg" onClick={() => dispatch({ type: 'closeVoting' })}>
              Count votes now
            </button>
          </div>
        </div>
      )}
      <AnimatePresence>
        {voter && (
          <IpadBallot
            key={voter.id}
            voter={voter}
            game={game}
            onDone={(targetId) => {
              setBallotFor(null);
              if (targetId) dispatch({ type: 'castVote', voterId: voter.id, targetId });
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

