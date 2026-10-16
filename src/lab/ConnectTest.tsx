import { ArrowRight, DeviceMobile, DeviceTablet, Lightning } from '@phosphor-icons/react';
import Peer, { type DataConnection } from 'peerjs';
import QRCode from 'qrcode';
import { useEffect, useRef, useState } from 'react';

/**
 * Milestone 0 for multiplayer: proves whether an iPad and phones can talk directly
 * on a given network before any real multiplayer is built on top.
 * Opened at #/connect (host) or #/connect?join=CODE (phone).
 */

const PREFIX = 'mert-test-';
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const CONNECT_TIMEOUT_MS = 15000;

type Msg = { type: 'hello'; device: string } | { type: 'ping'; t: number } | { type: 'pong'; t: number } | { type: 'buzz'; from: string };

interface Link {
  conn: DataConnection;
  device: string;
  rtt: number | null;
  route: string;
}

function makeCode() {
  return Array.from({ length: 4 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join('');
}

function deviceName() {
  const ua = navigator.userAgent;
  if (/iPad|Macintosh/.test(ua) && navigator.maxTouchPoints > 1) return 'iPad';
  if (/iPhone/.test(ua)) return 'iPhone';
  if (/Android/.test(ua)) return 'Android phone';
  return 'Computer';
}

function joinCodeFromHash(): string {
  const q = location.hash.split('?')[1] ?? '';
  return (new URLSearchParams(q).get('join') ?? '').toUpperCase();
}

/** Asks the browser which path the connection actually took. */
async function describeRoute(conn: DataConnection): Promise<string> {
  try {
    const stats = await conn.peerConnection.getStats();
    let pair: RTCIceCandidatePairStats | undefined;
    stats.forEach((s) => {
      if (s.type === 'candidate-pair' && (s as RTCIceCandidatePairStats).state === 'succeeded' && (s as RTCIceCandidatePairStats).nominated) {
        pair = s as RTCIceCandidatePairStats;
      }
    });
    if (!pair) return 'Checking…';
    const local = stats.get(pair.localCandidateId) as { candidateType?: string } | undefined;
    const remote = stats.get(pair.remoteCandidateId) as { candidateType?: string } | undefined;
    const types = [local?.candidateType, remote?.candidateType];
    if (types.includes('relay')) return 'Through a relay server (works, a bit slower)';
    if (types.every((t) => t === 'host')) return 'Direct, same Wi-Fi (best)';
    return 'Direct over the internet (good)';
  } catch {
    return 'Unknown';
  }
}

function useLinks() {
  const [links, setLinks] = useState<Link[]>([]);
  const update = (conn: DataConnection, patch: Partial<Link>) =>
    setLinks((ls) => ls.map((l) => (l.conn === conn ? { ...l, ...patch } : l)));
  return { links, setLinks, update };
}

/** Wires ping/pong, hello and buzz handling onto one connection. */
function wire(conn: DataConnection, update: (c: DataConnection, p: Partial<Link>) => void, onBuzz: (from: string) => void) {
  conn.on('data', (raw) => {
    const msg = raw as Msg;
    if (msg.type === 'ping') conn.send({ type: 'pong', t: msg.t } satisfies Msg);
    else if (msg.type === 'pong') update(conn, { rtt: Math.round(performance.now() - msg.t) });
    else if (msg.type === 'hello') update(conn, { device: msg.device });
    else if (msg.type === 'buzz') onBuzz(msg.from);
  });
  const ping = window.setInterval(() => {
    if (conn.open) conn.send({ type: 'ping', t: performance.now() } satisfies Msg);
  }, 1500);
  const route = window.setInterval(async () => update(conn, { route: await describeRoute(conn) }), 3000);
  conn.on('close', () => {
    window.clearInterval(ping);
    window.clearInterval(route);
  });
  conn.send({ type: 'hello', device: deviceName() } satisfies Msg);
  void describeRoute(conn).then((r) => update(conn, { route: r }));
}

function explain(type: string): string {
  switch (type) {
    case 'peer-unavailable':
      return 'No iPad found with that code. Check the code, and keep the iPad on the test screen.';
    case 'network':
    case 'server-error':
    case 'socket-error':
    case 'socket-closed':
      return 'Couldn’t reach the connection server. Check the internet on this device.';
    case 'browser-incompatible':
      return 'This browser can’t do direct connections. Try Safari or Chrome.';
    default:
      return `Something went wrong (${type}).`;
  }
}

function Buzz({ from }: { from: string | null }) {
  if (!from) return null;
  return (
    <div className="lab__buzz" role="status">
      <Lightning size={28} weight="fill" /> Buzz from {from}
    </div>
  );
}

function Host() {
  const [code, setCode] = useState<string | null>(null);
  const [qr, setQr] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [buzz, setBuzz] = useState<string | null>(null);
  const { links, setLinks, update } = useLinks();
  const peerRef = useRef<Peer | null>(null);

  useEffect(() => {
    let cancelled = false;
    const start = () => {
      const c = makeCode();
      const peer = new Peer(PREFIX + c);
      peerRef.current = peer;
      peer.on('open', async () => {
        if (cancelled) return;
        setCode(c);
        const url = `${location.origin}${location.pathname}#/connect?join=${c}`;
        setQr(await QRCode.toDataURL(url, { margin: 1, width: 480, color: { dark: '#222b21', light: '#ffffff' } }));
      });
      peer.on('connection', (conn) => {
        conn.on('open', () => {
          setLinks((ls) => [...ls, { conn, device: 'Device', rtt: null, route: 'Checking…' }]);
          wire(conn, update, (from) => setBuzz(from));
        });
        conn.on('close', () => setLinks((ls) => ls.filter((l) => l.conn !== conn)));
      });
      peer.on('error', (e) => {
        if (e.type === 'unavailable-id') {
          peer.destroy();
          start();
        } else setError(explain(e.type));
      });
    };
    start();
    return () => {
      cancelled = true;
      peerRef.current?.destroy();
    };
  }, [setLinks]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!buzz) return;
    const id = window.setTimeout(() => setBuzz(null), 1800);
    return () => window.clearTimeout(id);
  }, [buzz]);

  const buzzAll = () => links.forEach((l) => l.conn.send({ type: 'buzz', from: 'the iPad' } satisfies Msg));

  return (
    <div className="lab">
      <h1 className="title">Connection test</h1>
      <p className="muted">Scan with a phone, or open the link on it and type the code.</p>
      {error && <p className="lab__error">{error}</p>}
      {!code && !error && <p className="muted">Getting a code…</p>}
      {code && (
        <div className="lab__host">
          {qr && <img className="lab__qr" src={qr} alt={`QR code to join room ${code}`} />}
          <div>
            <p className="faint" style={{ margin: 0 }}>
              Room code
            </p>
            <p className="display lab__code num">{code}</p>
            <p className="faint" style={{ margin: 0, fontSize: 15 }}>
              {location.host}
              {location.pathname}#/connect
            </p>
          </div>
        </div>
      )}
      <section className="surface" style={{ marginTop: 24 }}>
        <h2 className="heading">Connected devices: {links.length}</h2>
        {links.length === 0 ? (
          <p className="faint">Nobody yet.</p>
        ) : (
          <ul className="lab__links">
            {links.map((l, i) => (
              <li key={i}>
                <DeviceMobile size={24} />
                <div>
                  <strong>{l.device}</strong>
                  <div className="faint" style={{ fontSize: 15 }}>
                    {l.route} · {l.rtt === null ? 'measuring' : `${l.rtt} ms`}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        <button type="button" className="btn btn--primary btn--lg" disabled={links.length === 0} onClick={buzzAll}>
          <Lightning size={20} weight="fill" /> Buzz all phones
        </button>
      </section>
      <Buzz from={buzz} />
    </div>
  );
}

function Join() {
  const [code, setCode] = useState(joinCodeFromHash());
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'failed'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [buzz, setBuzz] = useState<string | null>(null);
  const { links, setLinks, update } = useLinks();
  const peerRef = useRef<Peer | null>(null);
  const timer = useRef<number>();

  const connect = (c: string) => {
    peerRef.current?.destroy();
    setError(null);
    setStatus('connecting');
    setLinks([]);
    const peer = new Peer();
    peerRef.current = peer;
    peer.on('open', () => {
      const conn = peer.connect(PREFIX + c, { reliable: true });
      conn.on('open', () => {
        window.clearTimeout(timer.current);
        setStatus('connected');
        setLinks([{ conn, device: 'iPad', rtt: null, route: 'Checking…' }]);
        wire(conn, update, (from) => setBuzz(from));
      });
      conn.on('close', () => setStatus('failed'));
    });
    peer.on('error', (e) => {
      window.clearTimeout(timer.current);
      setStatus('failed');
      setError(explain(e.type));
    });
    timer.current = window.setTimeout(() => {
      setStatus((s) => (s === 'connecting' ? 'failed' : s));
      setError((e) => e ?? 'Timed out. This network may be blocking direct connections.');
    }, CONNECT_TIMEOUT_MS);
  };

  useEffect(() => {
    if (code.length === 4) connect(code);
    return () => {
      window.clearTimeout(timer.current);
      peerRef.current?.destroy();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!buzz) return;
    const id = window.setTimeout(() => setBuzz(null), 1800);
    return () => window.clearTimeout(id);
  }, [buzz]);

  const link = links[0];

  return (
    <div className="lab">
      <h1 className="title">Join the test</h1>
      <form
        className="add-row"
        style={{ margin: '20px 0' }}
        onSubmit={(e) => {
          e.preventDefault();
          if (code.length === 4) connect(code);
        }}
      >
        <input
          className="field num"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4))}
          placeholder="Room code"
          aria-label="Room code"
          autoCapitalize="characters"
          autoComplete="off"
          style={{ letterSpacing: '0.2em', fontSize: 22, fontWeight: 650 }}
        />
        <button type="submit" className="icon-btn" style={{ width: 52, height: 52 }} aria-label="Connect" disabled={code.length !== 4}>
          <ArrowRight size={22} weight="bold" />
        </button>
      </form>
      {status === 'connecting' && <p className="muted">Connecting…</p>}
      {status === 'failed' && <p className="lab__error">{error ?? 'Disconnected.'}</p>}
      {status === 'connected' && link && (
        <section className="surface">
          <p style={{ display: 'flex', gap: 10, alignItems: 'center', margin: '0 0 8px', fontSize: 20, fontWeight: 650 }}>
            <DeviceTablet size={26} /> Connected to the iPad ✅
          </p>
          <p className="faint" style={{ marginTop: 0 }}>
            {link.route} · {link.rtt === null ? 'measuring' : `${link.rtt} ms`}
          </p>
          <button
            type="button"
            className="btn btn--primary btn--lg btn--block"
            onClick={() => link.conn.send({ type: 'buzz', from: deviceName() } satisfies Msg)}
          >
            <Lightning size={20} weight="fill" /> Buzz the iPad
          </button>
        </section>
      )}
      <Buzz from={buzz} />
    </div>
  );
}

export default function ConnectTest() {
  const [role, setRole] = useState<'pick' | 'host' | 'join'>(joinCodeFromHash() ? 'join' : 'pick');
  return (
    <main className="screen" aria-label="Connection test">
      {role === 'pick' && (
        <div className="lab">
          <h1 className="title">Connection test</h1>
          <p className="muted">Checks if this network lets an iPad and phones talk to each other.</p>
          <div className="home__actions" style={{ marginTop: 28 }}>
            <button type="button" className="btn btn--primary btn--lg" onClick={() => setRole('host')}>
              <DeviceTablet size={22} /> This is the iPad
            </button>
            <button type="button" className="btn btn--secondary btn--lg" onClick={() => setRole('join')}>
              <DeviceMobile size={22} /> This is a phone
            </button>
          </div>
        </div>
      )}
      {role === 'host' && <Host />}
      {role === 'join' && <Join />}
    </main>
  );
}
