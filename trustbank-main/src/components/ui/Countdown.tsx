'use client';
import { useEffect, useState } from 'react';

export function Countdown({ expiresAt }: { expiresAt: string }) {
  const [time, setTime] = useState('');
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const update = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) { setExpired(true); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTime(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [expiresAt]);

  if (expired) return <span className="text-xs text-red-400 font-mono">Expired</span>;

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-xs font-black"
      style={{ background: '#000', color: '#00ff41', textShadow: '0 0 8px #00ff41', border: '1px solid #00ff4130' }}>
      ⏱ {time}
    </span>
  );
}
