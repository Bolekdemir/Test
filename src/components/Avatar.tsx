const TINTS = ['#d2e0dc', '#bfd0c4', '#e6dcc8', '#a9bcb3', '#ead8b4', '#e7cabd', '#cfdbd0', '#dfe5d2'];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function Avatar({ id, name }: { id: string; name: string }) {
  const initial = Array.from(name.trim())[0]?.toUpperCase() ?? '?';
  return (
    <span className="avatar" style={{ background: TINTS[hash(id) % TINTS.length] }} aria-hidden>
      {initial}
    </span>
  );
}
