import Peer, { type DataConnection } from 'peerjs';
import { HEARTBEAT_MS, PEER_PREFIX, STALE_MS, type ToHost, type ToPhone } from './protocol';

export interface HostHandlers {
  onJoin: (deviceId: string, name: string) => void;
  onPeeked: (deviceId: string) => void;
  onVote: (deviceId: string, targetId: string) => void;
  /** Called whenever the set of connected devices changes. */
  onPresence: (online: Set<string>) => void;
  onStatus: (status: 'starting' | 'ready' | 'error', detail?: string) => void;
}

/**
 * The iPad side of a room. Owns the PeerJS id for the room code, keeps one live
 * connection per device, and drops devices that stop sending heartbeats.
 */
export class RoomHost {
  private peer: Peer | null = null;
  private conns = new Map<string, DataConnection>();
  private lastSeen = new Map<string, number>();
  private timer: number | undefined;
  private retry: number | undefined;
  private destroyed = false;
  private attempts = 0;

  constructor(
    readonly room: string,
    private handlers: HostHandlers,
  ) {
    this.open();
    this.timer = window.setInterval(() => this.tick(), HEARTBEAT_MS);
  }

  private open() {
    if (this.destroyed) return;
    this.handlers.onStatus('starting');
    const peer = new Peer(PEER_PREFIX + this.room);
    this.peer = peer;
    peer.on('open', () => {
      this.attempts = 0;
      this.handlers.onStatus('ready');
    });
    peer.on('connection', (conn) => this.accept(conn));
    peer.on('disconnected', () => {
      if (!this.destroyed && !peer.destroyed) peer.reconnect();
    });
    peer.on('error', (e) => {
      // After a refresh the old id can linger on the server for a little while.
      if (e.type === 'unavailable-id' || e.type === 'network' || e.type === 'server-error' || e.type === 'socket-error') {
        peer.destroy();
        this.attempts += 1;
        this.handlers.onStatus(this.attempts > 3 ? 'error' : 'starting', e.type);
        window.clearTimeout(this.retry);
        this.retry = window.setTimeout(() => this.open(), Math.min(2000 * this.attempts, 8000));
      }
    });
  }

  private accept(conn: DataConnection) {
    let deviceId: string | null = null;
    conn.on('data', (raw) => {
      const msg = raw as ToHost;
      if (msg.t === 'join') {
        deviceId = msg.deviceId;
        const old = this.conns.get(deviceId);
        if (old && old !== conn) old.close();
        this.conns.set(deviceId, conn);
        this.lastSeen.set(deviceId, Date.now());
        this.handlers.onJoin(deviceId, msg.name);
        this.presence();
        return;
      }
      if (!deviceId) return;
      this.lastSeen.set(deviceId, Date.now());
      if (msg.t === 'peeked') this.handlers.onPeeked(deviceId);
      else if (msg.t === 'vote') this.handlers.onVote(deviceId, msg.targetId);
    });
    conn.on('close', () => {
      if (deviceId && this.conns.get(deviceId) === conn) {
        this.conns.delete(deviceId);
        this.presence();
      }
    });
  }

  private tick() {
    const now = Date.now();
    let changed = false;
    for (const [id, conn] of this.conns) {
      if (now - (this.lastSeen.get(id) ?? 0) > STALE_MS) {
        conn.close();
        this.conns.delete(id);
        changed = true;
      } else if (conn.open) {
        conn.send({ t: 'hb' } satisfies ToPhone);
      }
    }
    if (changed) this.presence();
  }

  private presence() {
    this.handlers.onPresence(new Set(this.conns.keys()));
  }

  send(deviceId: string, msg: ToPhone) {
    const conn = this.conns.get(deviceId);
    if (conn?.open) conn.send(msg);
  }

  connected(): string[] {
    return [...this.conns.keys()];
  }

  kick(deviceId: string) {
    this.send(deviceId, { t: 'rejected', reason: 'removed' });
    const conn = this.conns.get(deviceId);
    window.setTimeout(() => conn?.close(), 300);
    this.conns.delete(deviceId);
    this.presence();
  }

  destroy() {
    this.destroyed = true;
    window.clearInterval(this.timer);
    window.clearTimeout(this.retry);
    this.conns.forEach((c) => c.close());
    this.conns.clear();
    this.peer?.destroy();
  }
}
