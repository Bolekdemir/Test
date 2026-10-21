import { AnimatePresence, MotionConfig } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Flood, type FloodTone } from './components/Flood';
import { Screen } from './components/Screen';
import { reducer, type Action } from './game/logic';
import type { AppState, Phase } from './game/types';
import { useWakeLock } from './hooks/useWakeLock';
import { isPhoneGame } from './game/logic';
import { useRoomHost } from './net/useRoomHost';
import { Deal } from './screens/Deal';
import { PhoneVote } from './screens/PhoneVote';
import { Discuss } from './screens/Discuss';
import { Home } from './screens/Home';
import { HowTo } from './screens/HowTo';
import { Pass, Peek } from './screens/PassPeek';
import { Setup } from './screens/Setup';
import { LastChance, Over, Verdict } from './screens/Verdict';
import { Vote } from './screens/Vote';
import { loadState, saveState } from './storage';

const IN_GAME: Phase[] = ['pass', 'peek', 'deal', 'discuss', 'vote', 'verdict', 'guess', 'over'];
/** Transitions that read as going back, so the screen slides the other way. */
const BACKWARD = new Set(['setup>home', 'howto>home', 'vote>discuss', 'over>setup', 'pass>setup', 'peek>setup', 'discuss>setup', 'vote>setup', 'verdict>setup', 'guess>setup', 'deal>setup', 'vote>discuss']);

const LABELS: Record<Phase, string> = {
  home: 'Home',
  howto: 'How to play',
  setup: 'New game',
  pass: 'Pass the iPad',
  peek: 'Your secret',
  deal: 'Check your cards',
  discuss: 'Discussion',
  vote: 'Vote',
  verdict: 'Verdict',
  guess: 'Last chance',
  over: 'Game over',
};

export function App() {
  const [state, setState] = useState<AppState>(loadState);
  const [flood, setFlood] = useState<FloodTone | null>(null);
  const prevPhase = useRef(state.phase);
  const dirRef = useRef(1);

  const dispatch = useCallback((a: Action) => setState((s) => reducer(s, a)), []);

  if (prevPhase.current !== state.phase) {
    dirRef.current = BACKWARD.has(`${prevPhase.current}>${state.phase}`) ? -1 : 1;
    prevPhase.current = state.phase;
  }
  const dir = dirRef.current;

  useEffect(() => saveState(state), [state]);

  const { phase, game, settings } = state;
  const { online, status: hostStatus } = useRoomHost(state, dispatch);
  useWakeLock(IN_GAME.includes(phase));

  useEffect(() => {
    if (phase !== 'verdict' && phase !== 'guess' && phase !== 'over') setFlood(null);
  }, [phase]);

  const endGame = useCallback(() => dispatch({ type: 'endGame' }), [dispatch]);
  const resume = useCallback(() => {
    setState((s) => {
      if (!s.game) return s;
      const phase: Phase = s.game.pendingGuessId ? 'guess' : s.game.winner ? 'over' : s.game.revealIndex < s.game.players.length
            ? isPhoneGame(s.game)
              ? 'deal'
              : 'pass'
            : 'discuss';
      return { ...s, phase };
    });
  }, []);

  const key = `${phase}-${game?.revealIndex ?? 0}-${game?.round ?? 0}`;

  let content: JSX.Element | null = null;
  let className = '';
  if (phase === 'home') content = <Home dispatch={dispatch} hasGame={!!game} onResume={resume} />;
  else if (phase === 'howto') content = <HowTo dispatch={dispatch} />;
  else if (phase === 'setup') content = <Setup settings={settings} dispatch={dispatch} online={online} hostStatus={hostStatus} />;
  else if (game) {
    if (phase === 'pass') content = <Pass game={game} dispatch={dispatch} onEnd={endGame} />;
    else if (phase === 'peek') {
      className = 'peek';
      content = <Peek game={game} dispatch={dispatch} onEnd={endGame} />;
    } else if (phase === 'discuss') content = <Discuss game={game} dispatch={dispatch} onEnd={endGame} />;
    else if (phase === 'deal') content = <Deal game={game} dispatch={dispatch} onEnd={endGame} online={online} />;
    else if (phase === 'vote')
      content = isPhoneGame(game) ? (
        <PhoneVote game={game} dispatch={dispatch} online={online} />
      ) : (
        <Vote game={game} dispatch={dispatch} />
      );
    else if (phase === 'verdict') content = <Verdict game={game} dispatch={dispatch} setFlood={setFlood} />;
    else if (phase === 'guess') content = <LastChance game={game} dispatch={dispatch} />;
    else if (phase === 'over') content = <Over game={game} dispatch={dispatch} setFlood={setFlood} />;
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="stage">
        <Flood tone={flood} />
        <div className="stage__screens">
          <AnimatePresence initial={false} custom={dir}>
            {content && (
              <Screen key={key} dir={dir} label={LABELS[phase]} className={className}>
                {content}
              </Screen>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MotionConfig>
  );
}
