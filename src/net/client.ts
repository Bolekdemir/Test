import Peer, { type DataConnection } from 'peerjs';
import type { PhoneView } from '../game/view';
import { HEARTBEAT_MS, PEER_PREFIX, STALE_MS, type ToHost, type ToPhone } from './protocol';

export type ClientStatus = 'connecting' | 'connected' | 'reconnecting' | 'not-found' | 'rejected';

export interface ClientHandlers {
  onView: (view: PhoneView) => void;
  onStatus: (status: ClientStatus, reason?: string) => void;
}

/**
 * The phone side of a room. Connects to the iPad, introduces itself with a device id
 * that survives reloads, and keeps reconnecting until told to stop.
 */
export class RoomClient {
  private peer: Peer | null = null;
  private conn: DataConnection | null = null;
  private lastSeen = 0;
  private timer: number | undefined;
  private retry: number | undefined;
  private stopped = false;
  private everConnected = false;
  private failures = 0;

  constructor(
    readonly room: string,
    private deviceId: string,
    private name: string,
    private handlers: ClientHandlers,
  ) {
    this.connect();
    this.timer = window.setInterval(() => this.tick(), HEARTBEAT_MS);
    document.addEventListener('visibilitychange', this.onVisible);
  }

  private onVisible = () => {
    if (document.visibilityState === 'visible' && !this.isLive()) this.reconnect(0);
  };

  private isLive() {
    return !!this.conn?.open && Date.now() - this.lastSeen < STALE_MS;
  }

  private connect() {
    if (this.stopped) return;
    this.teardown();
    this.handlers.onStatus(this.everConnected ? 'reconnecting' : 'connecting');
    const peer = new Peer();
    this.peer = peer;
    peer.on('open', () => {
      const conn = peer.connect(PEER_PREFIX + this.room, { reliable: true });
      this.conn = conn;
      conn.on('open', () => {
        this.everConnected = true;
        this.failures = 0;
        this.lastSeen = Date.now();
        conn.send({ t: 'join', deviceId: this.deviceId, name: this.name } satisfies ToHost);
        this.handlers.onStatus('connected');
      });
      conn.on('data', (raw) => {
        const msg = raw as ToPhone;
        this.lastSeen = Date.now();
        if (msg.t === 'view') this.handlers.onView(msg.view);
        else if (msg.t === 'rejected') {
          this.stop();
          this.handlers.onStatus('rejected', msg.reason);
        }
      });
      conn.on('close', () => this.reconnect(1500));
    });
    peer.on('error', (e) => {
      if (e.type === 'peer-unavailable') {
        this.failures += 1;
        // Never reached this room at all: the code is probably wrong.
        if (!this.everConnected && this.failures >= 2) {
          this.handlers.onStatus('not-found');
          this.stop();
          return;
        }
      }
      this.reconnect(2000);
    });
  }

  private reconnect(delay: number) {
    if (this.stopped) return;
    window.clearTimeout(this.retry);
    if (this.everConnected) this.handlers.onStatus('reconnecting');
    this.retry = window.setTimeout(() => this.connect(), delay);
  }

  private tick() {
    if (this.stopped) return;
    if (this.conn?.open) this.conn.send({ t: 'hb' } satisfies ToHost);
    if (this.everConnected && this.conn?.open && Date.now() - this.lastSeen > STALE_MS) this.reconnect(0);
  }

  send(msg: ToHost) {
    if (this.conn?.open) this.conn.send(msg);
  }

  private teardown() {
    this.conn?.removeAllListeners();
    this.conn?.close();
    this.conn = null;
    this.peer?.removeAllListeners();
    this.peer?.destroy();
    this.peer = null;
  }

  stop() {
    this.stopped = true;
    window.clearInterval(this.timer);
    window.clearTimeout(this.retry);
    document.removeEventListener('visibilitychange', this.onVisible);
    this.teardown();
  }
}
