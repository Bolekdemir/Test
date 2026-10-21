import { CaretLeft, Check, DeviceMobile, Plus, X } from '@phosphor-icons/react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useState, type FormEvent } from 'react';
import { Avatar } from '../components/Avatar';
import { RoomCard } from '../components/RoomCard';
import { Segmented } from '../components/Segmented';
import { Stepper } from '../components/Stepper';
import { TopicIcon } from '../components/TopicIcon';
import { ALL_TOPIC_IDS, TOPICS } from '../data/topics';
import { MAX_NAME_LENGTH, MAX_PLAYERS, MIN_PLAYERS, canStart, maxImposters, type Action } from '../game/logic';
import type { Player, Settings } from '../game/types';
import { spring } from '../motion';
import type { HostStatus } from '../net/useRoomHost';

const TIMER_OPTIONS: { value: number | null; label: string }[] = [
  { value: null, label: 'Off' },
  { value: 60, label: '1 min' },
  { value: 120, label: '2 min' },
  { value: 180, label: '3 min' },
  { value: 300, label: '5 min' },
  { value: 600, label: '10 min' },
];

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

function PlayerRow({ player, dispatch, online }: { player: Player; dispatch: (a: Action) => void; online: boolean }) {
  const [draft, setDraft] = useState(player.name);
  useEffect(() => setDraft(player.name), [player.name]);
  const commit = () => {
    if (draft.trim()) dispatch({ type: 'renamePlayer', id: player.id, name: draft });
    else setDraft(player.name);
  };
  return (
    <>
      <Avatar id={player.id} name={draft || player.name} />
      <input
        className="player__name"
        value={draft}
        maxLength={MAX_NAME_LENGTH}
        aria-label={`Rename ${player.name}`}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
        enterKeyHint="done"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
      />
      {player.deviceId && (
        <span
          className="player__phone"
          data-online={online}
          title={online ? 'Connected phone' : 'Phone offline'}
          aria-label={online ? 'Connected phone' : 'Phone offline'}
        >
          <DeviceMobile size={20} weight={online ? 'fill' : 'regular'} />
        </span>
      )}
      <button
        type="button"
        className="icon-btn icon-btn--plain"
        aria-label={`Remove ${player.name}`}
        onClick={() => dispatch({ type: 'removePlayer', id: player.id })}
      >
        <X size={20} />
      </button>
    </>
  );
}

const MODE_OPTIONS: { value: 'ipad' | 'phones'; label: string }[] = [
  { value: 'ipad', label: 'One iPad' },
  { value: 'phones', label: 'With phones' },
];

interface Props {
  settings: Settings;
  dispatch: (a: Action) => void;
  online: Set<string>;
  hostStatus: HostStatus;
}

export function Setup({ settings, dispatch, online, hostStatus }: Props) {
  const [name, setName] = useState('');
  const reduce = useReducedMotion();
  const { players, topicIds, imposters, timerSec } = settings;
  const full = players.length >= MAX_PLAYERS;
  const allOn = topicIds.length === ALL_TOPIC_IDS.length;
  const cap = maxImposters(Math.max(players.length, MIN_PLAYERS));

  const add = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || full) return;
    dispatch({ type: 'addPlayer', id: newId(), name });
    setName('');
  };

  const missing =
    players.length < MIN_PLAYERS
      ? `Add ${MIN_PLAYERS - players.length} more ${MIN_PLAYERS - players.length === 1 ? 'player' : 'players'}`
      : topicIds.length === 0
        ? 'Pick at least one topic'
        : null;

  const timerLabel = TIMER_OPTIONS.find((o) => o.value === timerSec)?.label ?? 'Off';
  const summary = `${players.length} players, ${imposters} ${imposters === 1 ? 'imposter' : 'imposters'}, ${
    timerSec === null ? 'no timer' : timerLabel
  }`;

  const rowMotion = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, transform: 'scale(0.96)' },
        animate: { opacity: 1, transform: 'scale(1)' },
        exit: { opacity: 0, transform: 'scale(0.96)', transition: { duration: 0.18 } },
      };

  return (
    <>
      <header className="topbar">
        <button type="button" className="icon-btn" aria-label="Back to home" onClick={() => dispatch({ type: 'go', phase: 'home' })}>
          <CaretLeft size={22} weight="bold" />
        </button>
        <span className="topbar__title">New game</span>
        <span style={{ width: 48 }} />
      </header>

      <div className="setup">
        <div className="setup__side">
        <section className="surface" aria-labelledby="mode-h">
          <div className="panel__head">
            <h2 className="heading" id="mode-h">
              How you’re playing
            </h2>
          </div>
          <Segmented
            label="How you’re playing"
            options={MODE_OPTIONS}
            value={settings.phones ? 'phones' : 'ipad'}
            onChange={(v) => dispatch({ type: 'setPhones', on: v === 'phones' })}
          />
          <p className="panel__hint" style={{ margin: '14px 4px 0' }}>
            {settings.phones
              ? 'Everyone sees their card and votes on their own phone. No phone? Add their name below.'
              : 'Pass the iPad around to see your card. Vote together out loud.'}
          </p>
          {settings.phones && settings.room && (
            <RoomCard room={settings.room} status={hostStatus} count={online.size} />
          )}
        </section>

        <section className="surface setup__players" aria-labelledby="players-h">
          <div className="panel__head">
            <h2 className="heading" id="players-h">
              Players
            </h2>
            <span className="panel__hint num">
              {players.length} of {MAX_PLAYERS}
            </span>
          </div>
          <form className="add-row" onSubmit={add}>
            <input
              className="field"
              placeholder={full ? 'That’s everyone' : settings.phones ? 'Add someone without a phone' : 'Add a name'}
              value={name}
              maxLength={MAX_NAME_LENGTH}
              disabled={full}
              onChange={(e) => setName(e.target.value)}
              aria-label="Player name"
              enterKeyHint="done"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="words"
              spellCheck={false}
            />
            <button type="submit" className="icon-btn" style={{ width: 52, height: 52 }} aria-label="Add player" disabled={!name.trim() || full}>
              <Plus size={22} weight="bold" />
            </button>
          </form>
          {players.length === 0 ? (
            <p className="empty">
              {settings.phones
                ? `Waiting for phones to join. You need at least ${MIN_PLAYERS} players.`
                : `Add at least ${MIN_PLAYERS} players. Tap a name later to fix a typo.`}
            </p>
          ) : (
            <motion.ul className="players" layout transition={spring}>
              <AnimatePresence initial={false} mode="popLayout">
                {players.map((p) => (
                  <motion.li key={p.id} className="player" layout {...rowMotion} transition={spring}>
                    <PlayerRow player={p} dispatch={dispatch} online={!!p.deviceId && online.has(p.deviceId)} />
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          )}
        </section>

        <section className="surface setup__imposters" aria-labelledby="imp-h">
          <div className="setting-row">
            <div>
              <h2 className="heading" id="imp-h">
                Imposters
              </h2>
              <p className="panel__hint" style={{ margin: '4px 0 0' }}>
                {players.length < MIN_PLAYERS ? 'Add players to allow more' : `Up to ${cap} with ${players.length} players`}
              </p>
            </div>
            <Stepper
              label="Imposters"
              value={imposters}
              min={1}
              max={cap}
              onChange={(count) => dispatch({ type: 'setImposters', count })}
            />
          </div>
        </section>

        <section className="surface setup__timer" aria-labelledby="timer-h">
          <div className="panel__head">
            <h2 className="heading" id="timer-h">
              Time limit
            </h2>
            <span className="panel__hint">For the whole discussion</span>
          </div>
          <Segmented
            label="Time limit"
            options={TIMER_OPTIONS}
            value={timerSec}
            onChange={(sec) => dispatch({ type: 'setTimer', sec })}
          />
        </section>
        </div>

        <section className="surface setup__topics" aria-labelledby="topics-h">
          <div className="panel__head">
            <h2 className="heading" id="topics-h">
              Topics
            </h2>
            <span className="panel__hint num">{topicIds.length} picked</span>
          </div>
          <div className="topics">
            <button
              type="button"
              className="topic topic--all"
              aria-pressed={allOn}
              onClick={() => dispatch({ type: 'setTopics', ids: allOn ? [] : ALL_TOPIC_IDS })}
            >
              <TopicIcon id="all" />
              <span className="topic__name">{allOn ? 'Everything is in' : 'Mix everything'}</span>
              {allOn && (
                <span className="topic__check">
                  <Check size={14} weight="bold" />
                </span>
              )}
            </button>
            {TOPICS.map((t) => {
              const on = topicIds.includes(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  className="topic"
                  aria-pressed={on}
                  onClick={() => dispatch({ type: 'toggleTopic', id: t.id })}
                >
                  <TopicIcon id={t.id} />
                  <span className="topic__name">{t.name}</span>
                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.span
                        className="topic__check"
                        initial={{ opacity: 0, transform: 'scale(0.6)' }}
                        animate={{ opacity: 1, transform: 'scale(1)' }}
                        exit={{ opacity: 0, transform: 'scale(0.6)', transition: { duration: 0.12 } }}
                        transition={{ type: 'spring', bounce: 0, duration: 0.25 }}
                      >
                        <Check size={14} weight="bold" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <div className="dock">
        <div className="dock__inner">
          <span className="dock__summary num" aria-live="polite">
            {missing ?? summary}
          </span>
          <button
            type="button"
            className="btn btn--primary btn--lg"
            disabled={!canStart(settings)}
            onClick={() => dispatch({ type: 'start', now: Date.now() })}
          >
            Start game
          </button>
        </div>
      </div>
    </>
  );
}
