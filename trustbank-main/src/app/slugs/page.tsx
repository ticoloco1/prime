'use client';
import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/store/cart';
import { useAuth } from '@/hooks/useAuth';
import { slugPrice } from '@/lib/utils';
import { Search, Crown, ShoppingCart, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const PRICE_TABLE = [
  { len: '1 char', price: '$5,000' }, { len: '2 chars', price: '$3,500' },
  { len: '3 chars', price: '$3,000' }, { len: '4 chars', price: '$1,500' },
  { len: '5 chars', price: '$500' }, { len: '6 chars', price: '$150' },
  { len: '7+ chars', price: '$12/yr' },
];

export default function SlugsPage() {
  const { add } = useCart();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [premiumSlugs, setPremiumSlugs] = useState<any[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('premium_slugs' as any).select('*').eq('active', true).is('sold_to', null)
      .then(r => setPremiumSlugs(r.data || []));
    if (user) {
      supabase.from('slug_registrations' as any).select('*').eq('user_id', user.id)
        .then(r => setMyRegistrations(r.data || []));
    }
  }, [user]);

  useEffect(() => {
    if (!search || search.length < 1) { setAvailable(null); return; }
    const timer = setTimeout(async () => {
      setChecking(true);
      const { data } = await supabase.from('mini_sites').select('id').eq('slug', search).maybeSingle();
      const { data: reg } = await supabase.from('slug_registrations' as any).select('id').eq('slug', search).eq('status', 'active').maybeSingle();
      setAvailable(!data && !reg);
      setChecking(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleAdd = () => {
    if (!search) return;
    if (!user) { toast.error('Sign in first to claim a slug'); return; }
    const price = slugPrice(search);
    if (price === 0) {
      // Free slug (7+ chars) requires a plan
      add({ id: `plan_pro`, label: 'Pro Plan (required for slug)', price: 29.90, type: 'plan' });
      add({ id: `slug_${search}`, label: `Slug /${search} (free with plan)`, price: 0, type: 'slug' });
      toast.success(`/${search} added to cart with Pro Plan!`);
      return;
    }
    add({ id: `slug_${search}`, label: `Slug /${search} (${search.length} chars)`, price, type: 'slug' });
    toast.success(`/${search} added to cart! Complete payment to activate.`);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <Crown className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h1 className="text-4xl font-black text-[var(--text)] mb-3">Slug Marketplace</h1>
          <p className="text-[var(--text2)]">Claim your identity. Short slugs are premium assets.</p>
        </div>

        {/* Search */}
        <div className="card p-6 mb-8">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text2)]" />
            <input value={search} onChange={e => setSearch(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              className="input pl-9 text-lg font-mono" placeholder="search your slug..." />
          </div>

          {search && (
            <div className="flex items-center justify-between bg-[var(--bg2)] rounded-xl p-4 border border-[var(--border)]">
              <div>
                <p className="font-mono font-black text-[var(--text)] text-lg">/{search}</p>
                <div className="flex items-center gap-2 mt-1">
                  {checking ? (
                    <span className="text-xs text-[var(--text2)]">Checking...</span>
                  ) : available === true ? (
                    <span className="flex items-center gap-1 text-xs text-green-500 font-semibold"><CheckCircle className="w-3 h-3" /> Available</span>
                  ) : available === false ? (
                    <span className="text-xs text-red-400 font-semibold">✗ Taken</span>
                  ) : null}
                  <span className="text-xs text-[var(--text2)]">
                    {slugPrice(search) === 0 ? 'Free with plan ($12/yr renewal)' : `$${slugPrice(search).toLocaleString()} USDC`}
                  </span>
                </div>
              </div>
              {available && (
                <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  {slugPrice(search) === 0 ? 'Claim (Free w/ Pro Plan)' : `Buy $${slugPrice(search).toLocaleString()}`}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Price table */}
        <div className="card p-6 mb-8">
          <h2 className="font-black text-[var(--text)] mb-4">Pricing</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PRICE_TABLE.map(({ len, price }) => (
              <div key={len} className="bg-[var(--bg2)] rounded-xl p-3 text-center border border-[var(--border)]">
                <p className="font-mono font-black text-brand text-lg">{price}</p>
                <p className="text-xs text-[var(--text2)] mt-1">{len}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-[var(--text2)] mt-3">All slugs require $12/year renewal. Cancel anytime — slug returns to marketplace.</p>
        </div>

        {/* Premium slugs */}
        {premiumSlugs.length > 0 && (
          <div className="card p-6">
            <h2 className="font-black text-[var(--text)] mb-4">Premium Slugs Available</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {premiumSlugs.map((s: any) => (
                <button key={s.id} onClick={() => add({ id: `slug_${s.slug || s.keyword}`, label: `Slug /${s.slug || s.keyword}`, price: s.price, type: 'slug' })}
                  className="bg-[var(--bg2)] rounded-xl p-4 border border-[var(--border)] hover:border-brand transition-all text-left">
                  <p className="font-mono font-black text-[var(--text)] text-lg">/{s.slug || s.keyword}</p>
                  <p className="text-brand font-bold text-sm mt-1">${s.price?.toLocaleString()}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* My registrations */}
        {myRegistrations.length > 0 && (
          <div className="card p-6 mt-6">
            <h2 className="font-black text-[var(--text)] mb-4">My Slugs</h2>
            <div className="space-y-2">
              {myRegistrations.map((r: any) => (
                <div key={r.id} className="flex items-center justify-between bg-[var(--bg2)] rounded-xl px-4 py-3 border border-[var(--border)]">
                  <span className="font-mono font-bold text-[var(--text)]">/{r.slug}</span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${r.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-400'}`}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
