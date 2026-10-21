import { ArrowRight, CaretLeft, CircleNotch, Crown, LockSimple, WifiSlash } from '@phosphor-icons/react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Avatar } from '../components/Avatar';
import { SecretCard } from '../components/SecretCard';
import { MAX_NAME_LENGTH } from '../game/logic';
import type { PhoneView } from '../game/view';
import { useWakeLock } from '../hooks/useWakeLock';
import { spring } from '../motion';
import type { ClientStatus, RoomClient } from '../net/client';

const SAVE_KEY = 'mert:phone';

interface Saved {
  deviceId: string;
  name: string;
  room: string;
}

function newDeviceId(): string {
  return Array.from({ length: 4 }, () => Math.random().toString(36).slice(2, 8)).join('');
}

function load(): Saved {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY) ?? '{}') as Partial<Saved>;
    return {
      deviceId: saved.deviceId || newDeviceId(),
      name: saved.name ?? '',
      room: saved.room ?? '',
    };
  } catch {
    return { deviceId: newDeviceId(), name: '', room: '' };
  }
}

function save(s: Saved) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(s));
  } catch {
    // Private mode: rejoining after a reload just asks for the name again.
  }
}

function roomFromHash(): string {
  const q = location.hash.split('?')[1] ?? '';
  return (new URLSearchParams(q).get('room') ?? '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
}

const REJECTED: Record<string, string> = {
  'in-progress': 'This game has already started. Join when the host sets up the next one.',
  full: 'This room is full.',
  removed: 'The host removed you from the game.',
};

function JoinForm({ initial, onJoin, error }: { initial: Saved; onJoin: (name: string, room: string) => void; error: string | null }) {
  const fromLink = roomFromHash();
  const [name, setName] = useState(initial.name);
  const [room, setRoom] = useState(fromLink);
  const ok = name.trim().length > 0 && room.length === 4;
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (ok) onJoin(name.trim(), room);
  };

  const codeField = (
    <>
      <label className="phone__label" htmlFor="room">
        Room code
      </label>
      <input
        id="room"
        className="field field--dark field--code num"
        value={room}
        placeholder="ABCD"
        inputMode="text"
        onChange={(e) => setRoom(e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4))}
        autoCapitalize="characters"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="next"
        autoFocus={!fromLink}
        aria-describedby="room-hint"
      />
      <span id="room-hint" className="phone__hint">
        The 4 letters on the iPad screen.
      </span>
    </>
  );

  const nameField = (
    <>
      <label className="phone__label" htmlFor="name">
        Your name
      </label>
      <input
        id="name"
        className="field field--dark"
        value={name}
        maxLength={MAX_NAME_LENGTH}
        onChange={(e) => setName(e.target.value)}
        autoComplete="nickname"
        autoCapitalize="words"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="go"
        autoFocus={!!fromLink && !initial.name}
      />
    </>
  );

  return (
    <form className="phone__join" onSubmit={submit}>
      <button type="button" className="phone__back" onClick={() => (location.hash = '')}>
        <CaretLeft size={18} weight="bold" /> Mert
      </button>
      <h1 className="title phone__heading">{fromLink ? 'Join the game' : 'Join with a code'}</h1>
      <p className="phone__lede">
        {fromLink ? `Room ${fromLink} on the iPad.` : 'Someone starts a game on the iPad with phones on. Type their room code.'}
      </p>
      {fromLink ? nameField : (
        <>
          {codeField}
          {nameField}
        </>
      )}
      {error && <p className="phone__error">{error}</p>}
      <button type="submit" className="btn btn--glass btn--lg btn--block" disabled={!ok} style={{ marginTop: 28 }}>
        Join <ArrowRight size={20} weight="bold" />
      </button>
    </form>
  );
}

function Ballot({ view, onVote }: { view: PhoneView; onVote: (id: string) => void }) {
  const [pick, setPick] = useState<string | null>(null);
  const ballot = view.ballot!;
  const chosen = ballot.candidates.find((c) => c.id === pick);
  if (ballot.voted) {
    const name = ballot.candidates.find((c) => c.id === ballot.voted)?.name;
    return (
      <div className="phone__center">
        <LockSimple size={40} weight="bold" />
        <h1 className="title">Vote locked in.</h1>
        <p className="phone__lede">You voted for {name}. Waiting for everyone else.</p>
      </div>
    );
  }
  return (
    <div className="phone__ballot">
      <h1 className="title">{ballot.revote ? 'Tie. Vote again.' : 'Who’s the imposter?'}</h1>
      <p className="phone__lede">Your vote is secret.</p>
      <div className="vote-grid" role="radiogroup" aria-label="Candidates" style={{ margin: '20px 0 0' }}>
        {ballot.candidates.map((c) => (
          <button key={c.id} type="button" role="radio" aria-checked={pick === c.id} className="voter voter--dark" onClick={() => setPick(c.id)}>
            <Avatar id={c.id} name={c.name} />
            {c.name}
          </button>
        ))}
      </div>
      <button type="button" className="btn btn--glass btn--lg btn--block" disabled={!chosen} style={{ marginTop: 20 }} onClick={() => chosen && onVote(chosen.id)}>
        <LockSimple size={20} weight="bold" /> {chosen ? `Vote for ${chosen.name}` : 'Pick someone'}
      </button>
    </div>
  );
}

function Live({ view, send }: { view: PhoneView; send: RoomClient['send'] }) {
  const sentPeek = useRef(false);
  useEffect(() => {
    if (view.status === 'lobby') sentPeek.current = false;
  }, [view.status]);

  if (view.status === 'lobby') {
    return (
      <div className="phone__center">
        <p className="phone__lede">You’re in</p>
        <h1 className="display phone__name">{view.you?.name}</h1>
        <p className="phone__lede">Waiting for the host to start.</p>
        <div className="chips" style={{ marginTop: 24 }}>
          {view.lobby.map((n, i) => (
            <span key={`${n}-${i}`} className="chip">
              {n}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (view.status === 'over' && view.result) {
    const r = view.result;
    return (
      <div className="phone__center">
        <Crown size={40} weight="fill" />
        <h1 className="display phone__name">{r.winner === 'crew' ? 'Crew wins.' : 'Imposters win.'}</h1>
        <p className="phone__lede">{r.youWon ? 'You won.' : 'You lost this one.'}</p>
        <p className="phone__label" style={{ marginTop: 20 }}>
          The word was
        </p>
        <p className="title">{r.word}</p>
        <p className="phone__lede" style={{ marginTop: 16 }}>
          {r.imposters.length === 1 ? 'Imposter' : 'Imposters'}: {r.imposters.join(', ')}
        </p>
      </div>
    );
  }

  if (view.status === 'vote' && view.alive && view.ballot) {
    return <Ballot key={view.ballot.revote ? 'revote' : 'vote'} view={view} onVote={(id) => send({ t: 'vote', targetId: id })} />;
  }

  const note = !view.alive
    ? 'You’re out. Keep quiet and enjoy the show.'
    : view.status === 'dealing'
      ? view.peeked
        ? 'Got it. Waiting for everyone else.'
        : 'Slide the card up to see it. Keep it hidden.'
      : view.status === 'discuss'
        ? 'Say one word when it’s your turn. Slide up to check again.'
        : 'Eyes on the iPad.';

  return (
    <div className="phone__center">
      {view.card && (
        <SecretCard
          key={`${view.card.imposter}-${view.card.word ?? ''}`}
          imposter={view.card.imposter}
          topic={view.card.topic}
          word={view.card.word}
          teach={!view.peeked}
          onPeek={() => {
            if (!view.peeked && !sentPeek.current) {
              sentPeek.current = true;
              send({ t: 'peeked' });
            }
          }}
        />
      )}
      <p className="phone__lede" aria-live="polite">
        {note}
      </p>
    </div>
  );
}

export default function PhoneApp() {
  const [saved, setSaved] = useState<Saved>(load);
  const [joined, setJoined] = useState(() => {
    const s = load();
    // Rejoin automatically only when opened from this room's link (a reload or the QR again).
    const hashRoom = roomFromHash();
    return !!s.name && !!hashRoom && hashRoom === s.room;
  });
  const [status, setStatus] = useState<ClientStatus>('connecting');
  const [reason, setReason] = useState<string | null>(null);
  const [view, setView] = useState<PhoneView | null>(null);
  const clientRef = useRef<RoomClient | null>(null);
  useWakeLock(joined);

  useEffect(() => {
    if (!joined) return;
    save(saved);
    let cancelled = false;
    let client: RoomClient | null = null;
    void import('../net/client').then(({ RoomClient }) => {
      if (cancelled) return;
      client = new RoomClient(saved.room, saved.deviceId, saved.name, {
        onView: setView,
        onStatus: (s, r) => {
          setStatus(s);
          setReason(r ?? null);
          if (s === 'not-found' || s === 'rejected') setJoined(false);
        },
      });
      clientRef.current = client;
    });
    return () => {
      cancelled = true;
      client?.stop();
      clientRef.current = null;
    };
  }, [joined, saved]);

  const error =
    status === 'not-found'
      ? 'No game found with that code. Check the code on the iPad.'
      : status === 'rejected'
        ? (REJECTED[reason ?? ''] ?? 'Couldn’t join.')
        : null;

  return (
    <MotionConfig reducedMotion="user">
      <main className="screen peek phone" aria-label="Mert on your phone">
        {!joined ? (
          <JoinForm
            initial={saved}
            error={error}
            onJoin={(name, room) => {
              setView(null);
              setStatus('connecting');
              setSaved((s) => ({ ...s, name, room }));
              setJoined(true);
            }}
          />
        ) : (
          <>
            <header className="topbar">
              <span className="topbar__title" style={{ color: 'rgba(238,241,234,0.72)' }}>
                Room {saved.room}
              </span>
              <button
                type="button"
                className="btn btn--ghost"
                style={{ color: 'rgba(238,241,234,0.72)', minHeight: 44, padding: '0 12px' }}
                onClick={() => {
                  setSaved((s) => ({ ...s, room: '' }));
                  setJoined(false);
                  setView(null);
                }}
              >
                Leave
              </button>
            </header>
            <AnimatePresence>
              {status !== 'connected' && (
                <motion.div
                  className="phone__banner"
                  role="status"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={spring}
                >
                  {status === 'reconnecting' ? <WifiSlash size={18} /> : <CircleNotch size={18} className="spin" />}
                  {status === 'reconnecting' ? 'Reconnecting to the iPad…' : 'Connecting…'}
                </motion.div>
              )}
            </AnimatePresence>
            {view ? (
              <Live view={view} send={(m) => clientRef.current?.send(m)} />
            ) : (
              <div className="phone__center" />
            )}
          </>
        )}
      </main>
    </MotionConfig>
  );
}
