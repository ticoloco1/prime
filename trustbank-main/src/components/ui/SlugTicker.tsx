'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/store/cart';

export function SlugTicker() {
  const [slugs, setSlugs] = useState<any[]>([]);
  const { add } = useCart();

  useEffect(() => {
    supabase.from('premium_slugs' as any)
      .select('*').eq('active', true).is('sold_to', null).limit(20)
      .then(r => setSlugs(r.data || []));
  }, []);

  if (slugs.length === 0) return null;

  const items = [...slugs, ...slugs]; // duplicate for seamless loop

  return (
    <div className="bg-black border-y border-[var(--border)] overflow-hidden py-2" style={{ borderColor: '#00ff4120' }}>
      <div className="flex animate-[ticker_30s_linear_infinite] whitespace-nowrap">
        {items.map((s, i) => (
          <button key={i} onClick={() => add({ id: `slug_${s.slug||s.keyword}`, label: `/${s.slug||s.keyword}`, price: s.price, type: 'slug' })}
            className="inline-flex items-center gap-2 mx-6 hover:opacity-70 transition-opacity">
            <span className="font-mono font-black text-sm" style={{ color: '#00ff41', textShadow: '0 0 6px #00ff41' }}>
              /{s.slug || s.keyword}
            </span>
            <span className="text-xs text-white/50">${s.price?.toLocaleString()}</span>
            <span className="text-white/20">🔥</span>
          </button>
        ))}
      </div>
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
