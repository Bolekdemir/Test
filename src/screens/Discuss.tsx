import { Pause, Play } from '@phosphor-icons/react';
import { GameMenu } from '../components/GameMenu';
import { timeLeft, turnOrder, type Action } from '../game/logic';
import type { Game } from '../game/types';
import { useNow } from '../hooks/useNow';

function fmt(ms: number) {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function Discuss({ game, dispatch, onEnd }: { game: Game; dispatch: (a: Action) => void; onEnd: () => void }) {
  const { timer } = game;
  const running = !!timer && timer.endsAt !== null;
  const now = useNow(running, 200);
  const left = timer ? timeLeft(timer, now) : 0;
  const up = !!timer && left <= 0;
  const low = !!timer && !up && left <= 30000;
  const order = turnOrder(game);

  return (
    <>
      <header className="topbar">
        <span className="topbar__title num">Round {game.round}</span>
        <GameMenu onEnd={onEnd} />
      </header>

      <div className="discuss">
        <section aria-label="Discussion">
          {timer ? (
            <>
              <h1 className="clock" data-low={low || up} role="timer" aria-live="off">
                {fmt(left)}
              </h1>
              <div className="drain" aria-hidden>
                <div
                  className="drain__fill"
                  style={{
                    transform: `scaleX(${left / timer.durationMs})`,
                    transition: running ? 'transform 220ms linear' : 'none',
                  }}
                />
              </div>
              <p className="muted" style={{ fontSize: 19, margin: '0 0 28px', minHeight: 28 }} aria-live="polite">
                {up
                  ? 'Time’s up. Time to vote.'
                  : running
                    ? 'One word each, in order. Vote whenever you’re ready.'
                    : 'Paused.'}
              </p>
            </>
          ) : (
            <>
              <h1 className="title" style={{ fontSize: 'clamp(48px, 8vw, 88px)' }}>
                Talk it out.
              </h1>
              <p className="muted" style={{ fontSize: 19, margin: '16px 0 32px' }}>
                One word each, in order. No time limit, vote whenever you’re ready.
              </p>
            </>
          )}

          <div className="discuss__actions">
            <button type="button" className="btn btn--primary btn--lg" onClick={() => dispatch({ type: 'openVote' })}>
              Vote now
            </button>
            {timer && !up && (
              <button
                type="button"
                className="btn btn--secondary btn--lg"
                onClick={() => dispatch({ type: running ? 'pauseTimer' : 'resumeTimer', now: Date.now() })}
              >
                {running ? <Pause size={20} weight="fill" /> : <Play size={20} weight="fill" />}
                {running ? 'Pause' : 'Resume'}
              </button>
            )}
          </div>
        </section>

        <section className="surface" aria-labelledby="order-h">
          <h2 className="heading" id="order-h">
            {order[0]?.name} goes first
          </h2>
          <ol className="order">
            {order.map((p, i) => (
              <li key={p.id}>
                <span className="order__n">{i + 1}</span>
                {p.name}
              </li>
            ))}
          </ol>
        </section>
      </div>
    </>
  );
}
