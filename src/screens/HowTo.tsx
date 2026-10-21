import { CaretLeft } from '@phosphor-icons/react';
import type { Action } from '../game/logic';

export function HowTo({ dispatch }: { dispatch: (a: Action) => void }) {
  return (
    <>
      <header className="topbar">
        <button type="button" className="icon-btn" aria-label="Back" onClick={() => dispatch({ type: 'go', phase: 'home' })}>
          <CaretLeft size={22} weight="bold" />
        </button>
      </header>
      <article className="howto">
        <h1 className="title">How to play</h1>
        <ol>
          <li>
            <span>
              <strong>Set up.</strong> Add everyone playing, pick some topics and choose how many imposters there are.
              Choose <strong>With phones</strong> and everyone can scan the code to get their card and vote on their own
              phone.
            </span>
          </li>
          <li>
            <span>
              <strong>Pass the iPad.</strong> Each player slides the card up to see the secret word. Imposters see
              nothing but the word imposter.
            </span>
          </li>
          <li>
            <span>
              <strong>Say one word.</strong> Going around in order, everyone says one word linked to the secret word.
              Too obvious and the imposter catches on. Too vague and you look guilty.
            </span>
          </li>
          <li>
            <span>
              <strong>Vote.</strong> When time runs out, or whenever you agree, vote someone out together.
            </span>
          </li>
          <li>
            <span>
              <strong>Last chance.</strong> A caught imposter gets one guess at the word, out loud. Guess it and the
              imposters win.
            </span>
          </li>
          <li>
            <span>
              <strong>Win.</strong> The crew wins by catching every imposter. Imposters win once they match the crew in
              number.
            </span>
          </li>
        </ol>
        <button type="button" className="btn btn--primary btn--lg" onClick={() => dispatch({ type: 'go', phase: 'setup' })}>
          Start a game
        </button>
      </article>
    </>
  );
}
