'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function WindowFeed({ siteId }: { siteId?: string }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      let query = supabase
        .from('feed_posts')
        .select('*, mini_sites(site_name, avatar_url, slug)')
        .order('created_at', { ascending: false }); // <--- O ÚLTIMO SEMPRE NO TOPO

      if (siteId) query = query.eq('site_id', siteId);

      const { data } = await query;
      setPosts(data || []);
      setLoading(false);
    };

    fetchPosts();
    
    // Opcional: Realtime para o post aparecer na hora sem dar refresh
    const channel = supabase.channel('feed_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'feed_posts' }, 
      payload => {
        setPosts(prev => [payload.new, ...prev]); // Adiciona no topo instantaneamente
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [siteId]);

  return (
    <div className="w-[400px] h-[448px] bg-zinc-900/50 border border-zinc-800 rounded-[32px] overflow-hidden flex flex-col shadow-2xl backdrop-blur-md">
      {/* HEADER DA JANELA */}
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/80">
        <h3 className="font-black text-xs uppercase tracking-widest flex items-center gap-2">
          <MessageCircle size={14} className="text-brand" /> Feed de Notícias
        </h3>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-zinc-700" />
          <div className="w-2 h-2 rounded-full bg-zinc-700" />
        </div>
      </div>

      {/* ÁREA DE SCROLL INFINITO (JANELA) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-zinc-800/50 animate-pulse rounded-2xl" />)}
          </div>
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className="bg-black/40 border border-zinc-800/50 p-4 rounded-[20px] hover:border-brand/30 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-brand/20 overflow-hidden border border-brand/10">
                  {post.mini_sites?.avatar_url ? (
                    <img src={post.mini_sites.avatar_url} className="w-full h-full object-cover" />
                  ) : <User size={14} className="m-auto mt-2 text-brand" />}
                </div>
                <div>
                  <p className="text-[11px] font-bold text-white leading-none">@{post.mini_sites?.slug}</p>
                  <p className="text-[9px] text-zinc-500 mt-1">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ptBR })}
                  </p>
                </div>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                {post.content}
              </p>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-zinc-600">
            <MessageCircle size={40} className="mb-2 opacity-20" />
            <p className="text-xs">Nenhuma novidade por aqui.</p>
          </div>
        )}
      </div>
    </div>
  );
}
