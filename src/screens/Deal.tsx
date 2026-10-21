import { Check, DeviceMobile, Eye } from '@phosphor-icons/react';
import { Avatar } from '../components/Avatar';
import { GameMenu } from '../components/GameMenu';
import type { Action } from '../game/logic';
import type { Game } from '../game/types';

interface Props {
  game: Game;
  dispatch: (a: Action) => void;
  onEnd: () => void;
  online: Set<string>;
}

/** Phone games: everyone checks their card, on their phone or on the iPad. */
export function Deal({ game, dispatch, onEnd, online }: Props) {
  const peeked = new Set(game.peeked ?? []);
  const ready = game.players.filter((p) => peeked.has(p.id)).length;
  const all = ready === game.players.length;

  return (
    <>
      <header className="topbar">
        <span className="topbar__title num">
          {ready} of {game.players.length} ready
        </span>
        <GameMenu onEnd={onEnd} />
      </header>
      <div className="vote">
        <div style={{ textAlign: 'center' }}>
          <h1 className="title">Check your cards</h1>
          <p className="muted" style={{ fontSize: 18, margin: '12px 0 0' }}>
            Slide your card up on your phone. No phone? Tap your name to peek here.
          </p>
        </div>
        <div className="vote-grid">
          {game.players.map((p) => {
            const seen = peeked.has(p.id);
            if (!p.deviceId && !seen) {
              return (
                <button
                  key={p.id}
                  type="button"
                  className="voter"
                  onClick={() => dispatch({ type: 'peekOnIpad', playerId: p.id })}
                >
                  <Avatar id={p.id} name={p.name} />
                  {p.name}
                  <span className="voter__status">
                    <Eye size={16} weight="bold" /> Peek on iPad
                  </span>
                </button>
              );
            }
            const offline = p.deviceId && !online.has(p.deviceId);
            return (
              <div key={p.id} className="voter" data-done={seen}>
                <Avatar id={p.id} name={p.name} />
                {p.name}
                <span className="voter__status" data-tone={seen ? 'done' : offline ? 'warn' : undefined}>
                  {seen ? (
                    <>
                      <Check size={16} weight="bold" /> Seen
                    </>
                  ) : offline ? (
                    'Phone offline'
                  ) : (
                    <>
                      <DeviceMobile size={16} /> On their phone
                    </>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="dock">
        <div className="dock__inner" style={{ justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          {!all && (
            <button type="button" className="btn btn--ghost btn--lg" onClick={() => dispatch({ type: 'startDiscussion', now: Date.now() })}>
              Start anyway
            </button>
          )}
          <button
            type="button"
            className="btn btn--primary btn--lg"
            disabled={!all}
            onClick={() => dispatch({ type: 'startDiscussion', now: Date.now() })}
          >
            {all ? 'Start discussion' : 'Waiting for everyone'}
          </button>
        </div>
      </div>
    </>
  );
}
