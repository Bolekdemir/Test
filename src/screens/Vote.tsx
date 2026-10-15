import { CaretLeft } from '@phosphor-icons/react';
import { useState } from 'react';
import { Avatar } from '../components/Avatar';
import type { Action } from '../game/logic';
import type { Game } from '../game/types';

export function Vote({ game, dispatch }: { game: Game; dispatch: (a: Action) => void }) {
  const [pick, setPick] = useState<string | null>(null);
  const alive = game.players.filter((p) => p.alive);
  const chosen = alive.find((p) => p.id === pick);

  return (
    <>
      <header className="topbar">
        <button type="button" className="icon-btn" aria-label="Back to discussion" onClick={() => dispatch({ type: 'backToDiscuss' })}>
          <CaretLeft size={22} weight="bold" />
        </button>
      </header>
      <div className="vote">
      <div style={{ textAlign: 'center' }}>
        <h1 className="title">Who’s the imposter?</h1>
        <p className="muted" style={{ fontSize: 18, margin: '12px 0 0' }}>
          Agree out loud, then tap one name.
        </p>
      </div>
      <div className="vote-grid" role="radiogroup" aria-label="Players">
        {alive.map((p) => (
          <button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={pick === p.id}
            className="voter"
            onClick={() => setPick(p.id)}
          >
            <Avatar id={p.id} name={p.name} />
            {p.name}
          </button>
        ))}
      </div>
      </div>
      <div className="dock">
        <div className="dock__inner" style={{ justifyContent: 'center' }}>
          <button
            type="button"
            className="btn btn--primary btn--lg"
            style={{ minWidth: 'min(100%, 320px)' }}
            disabled={!chosen}
            onClick={() => chosen && dispatch({ type: 'vote', id: chosen.id })}
          >
            {chosen ? `Vote out ${chosen.name}` : 'Pick someone'}
          </button>
        </div>
      </div>
    </>
  );
}
