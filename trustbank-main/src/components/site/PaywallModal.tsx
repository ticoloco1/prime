'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Lock, CreditCard, X, Play } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  video: { id: string; title: string; youtube_video_id: string; paywall_price: number };
  onUnlocked: () => void;
}

export function PaywallModal({ video, onUnlocked }: Props) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  const handlePay = async () => {
    if (!user) { toast.error('Sign in to watch'); return; }
    setPaying(true);
    // Record the unlock (in real app, verify payment first)
    const { error } = await supabase.from('paywall_unlocks' as any).insert({
      user_id: user.id,
      video_id: video.id,
      amount_paid: video.paywall_price,
      expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    });
    if (error) { toast.error(error.message); setPaying(false); return; }
    setUnlocked(true);
    setPaying(false);
    toast.success('Unlocked! Valid for 12 hours.');
    onUnlocked();
  };

  const ytId = video.youtube_video_id;

  if (unlocked) {
    return (
      <div className="aspect-video w-full rounded-2xl overflow-hidden">
        <iframe
          src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
          className="w-full h-full" allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    );
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="w-full aspect-video relative rounded-2xl overflow-hidden group">
        <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
          alt={video.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2 group-hover:bg-black/80 transition-all">
          <div className="w-14 h-14 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <span className="text-white font-black text-lg">${video.paywall_price} USDC</span>
          <span className="text-white/60 text-xs">Click to unlock</span>
        </div>
      </button>

      {open && (
        <div className="fixed inset-0 z-[300] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-white">Unlock Video</h3>
              <button onClick={() => setOpen(false)}><X className="w-5 h-5 text-white/50" /></button>
            </div>
            <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
              alt="" className="w-full h-32 object-cover rounded-xl mb-4" />
            <p className="text-white font-semibold mb-1">{video.title}</p>
            <p className="text-white/50 text-xs mb-5">Valid for 12 hours after unlock</p>
            <div className="flex items-center justify-between bg-white/5 rounded-xl p-4 mb-4">
              <span className="text-white/70 text-sm">Price</span>
              <span className="text-white font-black text-xl">${video.paywall_price} USDC</span>
            </div>
            <button onClick={handlePay} disabled={paying || !user}
              className="w-full py-3 rounded-xl bg-brand text-white font-black flex items-center justify-center gap-2 disabled:opacity-50">
              <CreditCard className="w-4 h-4" />
              {!user ? 'Sign in to watch' : paying ? 'Processing...' : `Pay $${video.paywall_price} & Watch`}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
