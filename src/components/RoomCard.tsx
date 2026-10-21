import { useEffect, useState } from 'react';
import type { HostStatus } from '../net/useRoomHost';
import { joinUrl } from '../net/protocol';

/** Room code and QR for phones to join, shown on the iPad while phones are on. */
export function RoomCard({ room, status, count }: { room: string; status: HostStatus; count: number }) {
  const [qr, setQr] = useState('');
  useEffect(() => {
    let live = true;
    void import('qrcode').then((QR) =>
      QR.toDataURL(joinUrl(room), { margin: 1, width: 360, color: { dark: '#222b21', light: '#ffffff' } }).then(
        (url) => live && setQr(url),
      ),
    );
    return () => {
      live = false;
    };
  }, [room]);

  const note =
    status === 'error'
      ? 'Can’t open the room. Check this iPad’s internet.'
      : status === 'ready'
        ? count === 0
          ? 'Scan with a phone camera to join.'
          : `${count} ${count === 1 ? 'phone' : 'phones'} connected.`
        : 'Opening the room…';

  return (
    <div className="room">
      <div className="room__qr" aria-hidden={!qr}>
        {qr && <img src={qr} alt={`QR code to join room ${room}`} />}
      </div>
      <div className="room__text">
        <span className="panel__hint">Room code</span>
        <span className="room__code num">{room}</span>
        <span className={status === 'error' ? 'room__note room__note--error' : 'room__note'} aria-live="polite">
          {note}
        </span>
      </div>
    </div>
  );
}
