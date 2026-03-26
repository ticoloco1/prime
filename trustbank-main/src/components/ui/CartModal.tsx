'use client';
import { useCart } from '@/store/cart';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { X, CreditCard, Coins, Check, Loader2, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function CartModal() {
  const { items, isOpen, close, remove, clear, total } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState<'cart'|'method'|'card_pending'|'crypto_pending'|'done'>('cart');
  const [processing, setProcessing] = useState(false);

  if (!isOpen) return null;

  const activateItems = async () => {
    if (!user) return;
    for (const item of items) {
      if (item.type === 'plan') {
        const isAnnual = item.id.includes('annual');
        await supabase.from('subscriptions' as any).upsert({
          user_id: user.id, plan: item.id, price: item.price, status: 'active',
          expires_at: new Date(Date.now() + (isAnnual?365:30)*24*60*60*1000).toISOString(),
        });
        await supabase.from('mini_sites').update({ published: true }).eq('user_id', user.id);
      }
      if (item.type === 'slug') {
        const slug = item.id.replace('slug_','');
        await (supabase as any).from('slug_registrations').upsert({
          user_id: user.id, slug, status: 'active',
          registration_fee: item.price, renewal_fee: 12,
          expires_at: new Date(Date.now()+365*24*60*60*1000).toISOString(),
        });
      }
    }
    clear(); setStep('done');
  };

  const handleCard = () => {
    const appId = process.env.NEXT_PUBLIC_COINBASE_APP_ID;
    if (!appId) { toast.error('Coinbase App ID not set in Vercel env vars'); return; }
    const params = new URLSearchParams({ appId, presetFiatAmount: String(Math.ceil(total())), fiatCurrency: 'USD' });
    window.open(`https://pay.coinbase.com/buy?${params}`, '_blank', 'width=460,height=640');
    setStep('card_pending');
  };

  const handleCrypto = () => setStep('crypto_pending');

  const confirm = async () => {
    setProcessing(true);
    await activateItems();
    setProcessing(false);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
          <div className="flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-brand" /><h2 className="font-black text-[var(--text)]">Cart</h2></div>
          <button onClick={() => { close(); setStep('cart'); }}><X className="w-5 h-5 text-[var(--text2)]" /></button>
        </div>

        {step === 'cart' && (
          <div className="p-5">
            {items.length === 0 ? <p className="text-center text-[var(--text2)] py-8 text-sm">Your cart is empty</p> : (
              <>
                <div className="space-y-3 mb-5">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center justify-between bg-[var(--bg2)] rounded-xl px-4 py-3 border border-[var(--border)]">
                      <div><p className="text-sm font-semibold text-[var(--text)]">{item.label}</p><p className="text-xs text-[var(--text2)]">${item.price.toFixed(2)} USDC</p></div>
                      <button onClick={() => remove(item.id)} className="text-red-400 hover:opacity-70"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between py-3 border-t border-[var(--border)] mb-5">
                  <span className="font-black text-[var(--text)]">Total</span>
                  <span className="font-black text-2xl text-brand">${total().toFixed(2)}</span>
                </div>
                <button onClick={() => setStep('method')} className="btn-primary w-full justify-center py-3">Continue →</button>
              </>
            )}
          </div>
        )}

        {step === 'method' && (
          <div className="p-5 space-y-3">
            <p className="text-sm text-[var(--text2)] mb-4">Pay <strong className="text-[var(--text)]">${total().toFixed(2)}</strong></p>
            <button onClick={handleCard} className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-[var(--border)] hover:border-brand transition-colors text-left">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0"><CreditCard className="w-6 h-6 text-blue-500" /></div>
              <div><p className="font-bold text-[var(--text)]">Credit / Debit Card</p><p className="text-xs text-[var(--text2)]">Coinbase — auto converts to USDC</p></div>
            </button>
            <button onClick={handleCrypto} className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-[var(--border)] hover:border-brand transition-colors text-left">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0"><Coins className="w-6 h-6 text-purple-500" /></div>
              <div><p className="font-bold text-[var(--text)]">USDC / Crypto</p><p className="text-xs text-[var(--text2)]">Send from your Polygon wallet</p></div>
            </button>
            <button onClick={() => setStep('cart')} className="w-full text-sm text-[var(--text2)] py-2">← Back</button>
          </div>
        )}

        {step === 'card_pending' && (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto"><CreditCard className="w-8 h-8 text-blue-500" /></div>
            <p className="font-black text-[var(--text)]">Complete payment in the popup</p>
            <p className="text-sm text-[var(--text2)]">After paying, click below to activate your items.</p>
            <button onClick={confirm} disabled={processing} className="btn-primary w-full justify-center py-3">
              {processing ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Activating...</> : '✅ I paid — Activate Items'}
            </button>
            <button onClick={() => setStep('method')} className="text-sm text-[var(--text2)]">← Back</button>
          </div>
        )}

        {step === 'crypto_pending' && (
          <div className="p-6 space-y-4">
            <p className="font-black text-[var(--text)] text-center mb-2">Send USDC on Polygon</p>
            <div className="bg-[var(--bg2)] rounded-xl p-4 border border-[var(--border)]">
              <div className="text-center mb-4">
                <p className="text-xs text-[var(--text2)] mb-1">Total amount</p>
                <p className="text-3xl font-black text-brand">${total().toFixed(2)} USDC</p>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-[var(--text2)] mb-1">📤 Send to (Polygon network):</p>
                  <div className="bg-black/30 rounded-lg p-3 break-all cursor-pointer"
                    onClick={() => { navigator.clipboard.writeText(process.env.NEXT_PUBLIC_PLATFORM_WALLET || ''); }}>
                    <p className="text-xs font-mono text-green-400">
                      {process.env.NEXT_PUBLIC_PLATFORM_WALLET || '⚠️ Platform wallet not configured'}
                    </p>
                    <p className="text-[10px] text-white/30 mt-1">Tap to copy</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-amber-500/10 rounded-lg p-3">
                  <span className="text-amber-400 text-xs mt-0.5">⚠️</span>
                  <p className="text-xs text-amber-400">Polygon (MATIC) network only. Do NOT send on Ethereum — funds will be lost.</p>
                </div>
                <div className="bg-brand/10 rounded-lg p-3 text-xs text-[var(--text2)]">
                  <p className="font-semibold text-[var(--text)] mb-1">How payments work:</p>
                  <p>• Platform receives 100% initially</p>
                  <p>• Creator receives 60% within 24h to their wallet</p>
                  <p>• All verified on Polygonscan</p>
                </div>
              </div>
            </div>
            <button onClick={confirm} disabled={processing} className="btn-primary w-full justify-center py-3">
              {processing ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Activating...</> : '✅ I sent USDC — Activate Items'}
            </button>
            <button onClick={() => setStep('method')} className="text-sm text-[var(--text2)] w-full text-center">← Back</button>
          </div>
        )}

        {step === 'done' && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4"><Check className="w-8 h-8 text-green-500" /></div>
            <p className="font-black text-[var(--text)] text-lg mb-2">Payment confirmed! 🎉</p>
            <p className="text-sm text-[var(--text2)] mb-5">Your items have been activated.</p>
            <button onClick={() => { close(); setStep('cart'); }} className="btn-primary px-8 py-3">Close</button>
          </div>
        )}
      </div>
    </div>
  );
}
