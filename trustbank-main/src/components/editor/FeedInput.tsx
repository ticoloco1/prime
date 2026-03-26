'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Send, Loader2, Zap } from 'lucide-react';
import { toast } from 'sonner';

export function FeedInput({ siteId }: { siteId: string }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    if (!content.trim()) return;
    if (content.length > 280) return toast.error("Mensagem muito longa! Máximo 280 caracteres.");

    setLoading(true);
    const { error } = await supabase.from('feed_posts').insert([
      { site_id: siteId, content: content.trim() }
    ]);

    if (!error) {
      setContent('');
      toast.success("Publicado no seu Feed!");
    } else {
      toast.error("Erro ao publicar: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-[32px] shadow-xl backdrop-blur-md">
      <div className="flex items-center gap-2 mb-4">
        <Zap size={16} className="text-brand fill-brand" />
        <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400">O que está acontecendo?</h4>
      </div>
      
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Novidades, promoções ou avisos..."
          className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm outline-none focus:border-brand transition-all resize-none min-h-[100px]"
          maxLength={280}
        />
        
        <div className="absolute bottom-4 right-4 flex items-center gap-4">
          <span className={cn(
            "text-[10px] font-bold",
            content.length > 250 ? "text-red-500" : "text-zinc-600"
          )}>
            {content.length}/280
          </span>
          
          <button
            onClick={handlePost}
            disabled={loading || !content.trim()}
            className="bg-brand hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 p-3 rounded-xl transition-all shadow-lg shadow-brand/20"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="text-white" />}
          </button>
        </div>
      </div>
    </div>
  );
}
