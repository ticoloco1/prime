 'use client';

import { usePublicSite } from '@/hooks/useSite';
import { useParams } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { 
  ExternalLink, ChevronDown, ChevronUp, Lock, 
  MessageSquare, Pin, Home, Car, ShieldCheck, 
  MapPin, Calendar, Gauge, Zap 
} from 'lucide-react';
import { Countdown } from '@/components/ui/Countdown';
import { useCart } from '@/store/cart';
import { toast } from 'sonner';

const POSTS_PER_PAGE = 10;

const THEMES: Record<string, string> = {
  midnight: 'from-[#0f172a] via-[#1e293b] to-[#020617]',
  cosmic: 'from-[#2e1065] via-[#4c1d95] to-[#1e1b4b]',
  ocean: 'from-[#083344] via-[#164e63] to-[#042f2e]',
  noir: 'from-black via-zinc-900 to-black',
};

export default function SitePageB1() {
  const { slug } = useParams();
  const { site, loading, notFound } = usePublicSite(slug as string);
  const { user } = useAuth();
  const { add: addToCart, open: openCart } = useCart();

  const [posts, setPosts] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [postText, setPostText] = useState('');
  const [links, setLinks] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [classifieds, setClassifieds] = useState<any[]>([]);
  const [cvOpen, setCvOpen] = useState(false);
  const [unlockedVideos, setUnlockedVideos] = useState<Set<string>>(new Set());

  const loaderRef = useRef<HTMLDivElement | null>(null);
  const isOwner = user?.id === site?.user_id;
  const accent = site?.accent_color || '#818cf8';

  // --- CARREGAR POSTS (MURAL) ---
  const loadPosts = useCallback(async (reset = false) => {
    if (!site?.id || (loadingMore && !reset)) return;
    setLoadingMore(true);
    const from = reset ? 0 : page * POSTS_PER_PAGE;

    const { data } = await supabase
      .from('feed_posts')
      .select('*')
      .eq('site_id', site.id)
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, from + POSTS_PER_PAGE - 1);

    const now = new Date();
    const filtered = (data || []).filter((p: any) => p.pinned || new Date(p.expires_at) > now);

    setPosts(prev => reset ? filtered : [...prev, ...filtered]);
    setPage(prev => reset ? 1 : prev + 1);
    setHasMore((data || []).length === POSTS_PER_PAGE);
    setLoadingMore(false);
  }, [site?.id, page, loadingMore]);

  // --- INICIALIZAÇÃO DE DADOS ---
  useEffect(() => {
    if (!site?.id) return;
    loadPosts(true);

    Promise.all([
      supabase.from('mini_site_links').select('*').eq('site_id', site.id).order('sort_order'),
      supabase.from('mini_site_videos').select('*').eq('site_id', site.id).order('sort_order'),
      supabase.from('classified_listings').select('*').eq('site_id', site.id).eq('status', 'active')
    ]).then(([linksRes, videosRes, classifiedsRes]: any) => {
      setLinks(linksRes.data || []);
      setVideos(videosRes.data || []);
      setClassifieds(classifiedsRes.data || []);
    });

    if (user) {
      supabase.from('paywall_unlocks').select('video_id').eq('user_id', user.id)
        .then(r => setUnlockedVideos(new Set((r.data || []).map((u: any) => u.video_id))));
    }
  }, [site?.id, user?.id, loadPosts]);

  // --- INFINITE SCROLL ---
  useEffect(() => {
    const currentLoader = loaderRef.current;
    if (!currentLoader || !hasMore) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) loadPosts();
    }, { threshold: 0.1 });
    observer.observe(currentLoader);
    return () => observer.disconnect();
  }, [hasMore, loadPosts]);

  const submitPost = async () => {
    if (!postText.trim() || !user || !site) return;
    const { error } = await supabase.from('feed_posts').insert({
      site_id: site.id, user_id: user.id, text: postText,
      expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
    });
    if (error) return toast.error("Erro ao publicar");
    setPostText(''); loadPosts(true);
    toast.success("Publicado no mural!");
  };

  const handlePaywall = (video: any) => {
    if (!user) return toast.error('Faça login para desbloquear');
    addToCart({ 
      id: `video_${video.id}`, 
      label: `Vídeo: ${video.title}`, 
      price: video.paywall_price || 0.15, 
      type: 'plan' 
    });
    openCart();
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-black tracking-widest animate-pulse">TRUSTBANK...</div>;
  if (notFound || !site) return <div className="min-h-screen bg-black flex items-center justify-center text-white text-6xl font-black">404</div>;

  const imoveis = classifieds.filter(c => c.type === 'imovel');
  const carros = classifieds.filter(c => c.type === 'carro');

  return (
    <div className={`min-h-screen bg-gradient-to-b ${THEMES[site.theme] || THEMES.midnight} text-white pb-32 font-sans selection:bg-indigo-500/30`}>
      <div className="max-w-5xl mx-auto px-6">

        {/* --- HEADER --- */}
        <header className="flex flex-col items-center text-center pt-24 mb-20 animate-in fade-in duration-1000">
          <div className="relative mb-8">
             <img src={site.avatar_url} className="w-36 h-36 rounded-full border-[6px] border-white/5 shadow-2xl object-cover hover:scale-105 transition-transform duration-500" alt="Avatar" />
             <div className="absolute -bottom-2 -right-2 bg-indigo-500 p-2 rounded-full border-4 border-slate-900 shadow-lg">
                <ShieldCheck size={20} className="text-white" />
             </div>
          </div>
          <h1 className="text-5xl font-black tracking-tighter mb-4">{site.site_name}</h1>
          <p className="opacity-60 max-w-xl text-lg leading-relaxed font-medium">{site.bio}</p>
        </header>

        {/* --- MURAL (FEED) --- */}
        <section className="max-w-[520px] mx-auto mb-24">
          {isOwner && (
            <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 mb-8 backdrop-blur-xl shadow-2xl">
              <textarea value={postText} onChange={e => setPostText(e.target.value)} 
                className="w-full bg-transparent text-sm outline-none resize-none placeholder-white/20 font-medium" 
                placeholder="Escreva algo para seus visitantes..." rows={3} />
              <div className="flex justify-end mt-4 pt-4 border-t border-white/5">
                <button onClick={submitPost} style={{ background: accent }} 
                  className="px-10 py-3 rounded-full font-black text-[11px] uppercase tracking-widest shadow-xl active:scale-95 transition-all">Publicar</button>
              </div>
            </div>
          )}
          
          <div className="rounded-[40px] bg-black/40 border border-white/10 shadow-2xl backdrop-blur-2xl overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <MessageSquare size={18} style={{ color: accent }} />
                <span className="text-[12px] font-black uppercase tracking-[0.3em] opacity-40">Mural de Notícias</span>
              </div>
              {posts.length > 0 && <span className="text-[10px] font-bold opacity-20 px-3 py-1 bg-white/5 rounded-full">{posts.length} posts</span>}
            </div>

            <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto custom-scrollbar">
              {posts.map(post => (
                <article key={post.id} className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-white/15 transition-all group">
                  {post.pinned && <div className="text-amber-400 text-[10px] font-black mb-4 flex items-center gap-2 tracking-widest"><Pin size={14} fill="currentColor"/> FIXADO</div>}
                  <div className="prose prose-invert prose-sm max-w-none text-white/80 font-medium leading-relaxed mb-4">{post.text}</div>
                  {post.image_url && <img src={post.image_url} className="rounded-2xl w-full object-cover border border-white/10 mb-4 shadow-lg" alt="Post" />}
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                    <Countdown expiresAt={post.expires_at} />
                    <span className="text-[9px] opacity-20 font-black uppercase tracking-tighter">{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                </article>
              ))}
              <div ref={loaderRef} className="text-center text-[10px] font-black opacity-20 py-10 uppercase tracking-[0.4em]">
                {hasMore ? 'Carregando atualizações...' : 'Você chegou ao fim'}
              </div>
            </div>
          </div>
        </section>

        {/* --- LINKS --- */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-24">
          {links.map(link => (
            <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" 
              className="group p-6 bg-white/5 border border-white/10 rounded-[2rem] flex justify-between items-center hover:bg-white/10 hover:border-indigo-500/50 transition-all duration-300 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/5 rounded-2xl group-hover:text-indigo-400 transition-colors">
                  {link.icon === 'home' ? <Home size={20}/> : link.icon === 'car' ? <Car size={20}/> : <Zap size={20}/>}
                </div>
                <span className="font-bold text-lg tracking-tight">{link.title}</span>
              </div>
              <ExternalLink size={20} className="opacity-10 group-hover:opacity-100 transition-opacity" />
            </a>
          ))}
        </section>

        {/* --- CLASSIFICADOS (IMOVEIS / CARROS) --- */}
        <div className="space-y-32 mb-32">
          {imoveis.length > 0 && (
            <section>
              <h2 className="text-3xl font-black mb-10 flex items-center gap-4 tracking-tighter"><Home size={32} style={{ color: accent }} /> Imóveis em Destaque</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {imoveis.map(item => (
                  <div key={item.id} className="bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden group shadow-2xl hover:border-white/20 transition-all">
                    <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar h-72 relative">
                      {item.images?.map((img:string) => <img key={img} src={img} className="w-full h-full object-cover shrink-0 snap-start" alt="Imovel" />)}
                      <div className="absolute bottom-6 left-6 bg-black/80 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/10 font-black text-2xl shadow-2xl">
                        R$ {Number(item.price).toLocaleString('pt-BR')}
                      </div>
                    </div>
                    <div className="p-10">
                      <h3 className="text-2xl font-black mb-2 tracking-tight">{item.title}</h3>
                      <p className="flex items-center gap-2 text-[11px] font-bold opacity-30 uppercase tracking-[0.2em] mb-8"><MapPin size={12}/> {item.location}</p>
                      <div className="grid grid-cols-2 gap-8 border-t border-white/5 pt-8">
                        <div className="flex flex-col gap-1"><span className="text-white text-xl font-black">{item.extra?.quartos || 0}</span><span className="text-[10px] font-bold uppercase opacity-30">Dormitórios</span></div>
                        <div className="flex flex-col gap-1"><span className="text-white text-xl font-black">{item.extra?.m2 || 0}m²</span><span className="text-[10px] font-bold uppercase opacity-30">Área Total</span></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {carros.length > 0 && (
            <section>
              <h2 className="text-3xl font-black mb-10 flex items-center gap-4 tracking-tighter"><Car size={32} style={{ color: accent }} /> Veículos à Venda</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {carros.map(car => (
                  <div key={car.id} className="bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden group shadow-2xl">
                    <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar h-72">
                      {car.images?.map((img:string) => <img key={img} src={img} className="w-full h-full object-cover shrink-0 snap-start" alt="Carro" />)}
                    </div>
                    <div className="p-10">
                      <div className="flex justify-between items-start mb-8">
                         <div>
                            <h3 className="text-2xl font-black uppercase italic leading-none mb-2">{car.title}</h3>
                            <span className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black uppercase tracking-widest opacity-40">Oportunidade</span>
                         </div>
                         <p className="text-3xl font-black tracking-tighter" style={{ color: accent }}>R$ {Number(car.price).toLocaleString('pt-BR')}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-8">
                        <div className="bg-black/40 p-4 rounded-3xl text-center flex flex-col items-center gap-1"><Calendar size={14} className="opacity-20"/><p className="text-sm font-black">{car.extra?.ano}</p></div>
                        <div className="bg-black/40 p-4 rounded-3xl text-center flex flex-col items-center gap-1"><Gauge size={14} className="opacity-20"/><p className="text-sm font-black">{car.extra?.km}k</p></div>
                        <div className="bg-black/40 p-4 rounded-3xl text-center flex flex-col items-center gap-1"><Zap size={14} className="opacity-20"/><p className="text-sm font-black">{car.extra?.cambio || 'Aut'}</p></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* --- VÍDEOS PREMIUM --- */}
        {videos.length > 0 && (
          <section className="mb-32">
            <h2 className="text-3xl font-black mb-10 tracking-tighter">Conteúdo Exclusivo</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {videos.map(video => (
                <div key={video.id} className="rounded-[3rem] overflow-hidden bg-black/40 border border-white/10 shadow-2xl group hover:border-indigo-500/30 transition-all duration-500">
                  {video.paywall_enabled && !unlockedVideos.has(video.id) ? (
                    <button onClick={() => handlePaywall(video)} className="relative w-full aspect-video flex flex-col items-center justify-center overflow-hidden">
                      <img src={`https://img.youtube.com/vi/${video.youtube_video_id}/hqdefault.jpg`} 
                        className="absolute inset-0 w-full h-full object-cover opacity-20 scale-110 blur-xl group-hover:scale-125 transition-transform duration-700" alt="Preview" />
                      <div className="relative z-10 flex flex-col items-center">
                        <div className="p-6 bg-white/10 rounded-full backdrop-blur-2xl mb-5 group-hover:bg-indigo-500 transition-all duration-500 shadow-2xl">
                          <Lock size={32} className="text-white" fill="currentColor"/>
                        </div>
                        <span className="font-black text-2xl tracking-tighter mb-1">${video.paywall_price} USDC</span>
                        <span className="text-[11px] font-black uppercase opacity-40 tracking-[0.3em]">Clique para Desbloquear</span>
                      </div>
                    </button>
                  ) : (
                    <div className="aspect-video w-full">
                      <iframe 
                        src={`https://www.youtube-nocookie.com/embed/${video.youtube_video_id}?autoplay=0&modestbranding=1&rel=0`} 
                        className="w-full h-full" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen 
                      />
                    </div>
                  )}
                  <div className="p-6 bg-white/5 flex items-center justify-between">
                    <p className="text-xs font-black uppercase opacity-50 tracking-[0.2em] truncate">{video.title}</p>
                    <div className="flex gap-1">
                      <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse" />
                      <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse delay-75" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* --- CURRÍCULO PROFISSIONAL --- */}
        {site.show_cv && (
          <section className="max-w-3xl mx-auto bg-white/5 rounded-[4rem] border border-white/10 p-12 mb-32 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none text-9xl font-black uppercase italic">BIO</div>
            <button onClick={() => setCvOpen(!cvOpen)} className="w-full flex justify-between items-center group">
              <span className="font-black uppercase text-[12px] tracking-[0.5em] opacity-40 group-hover:opacity-100 transition-opacity">Currículo Profissional</span>
              <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                {cvOpen ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
              </div>
            </button>
            {cvOpen && (
              <div className="mt-12 animate-in fade-in slide-in-from-top-6 duration-700">
                <div className="prose prose-invert prose-lg max-w-none opacity-80 leading-relaxed font-medium mb-12" 
                  dangerouslySetInnerHTML={{ __html: site.cv_content || "" }} />
                
                <div className="p-8 rounded-[2rem] bg-indigo-600/10 border border-indigo-500/20 text-center">
                  <p className="text-sm font-bold text-indigo-200 mb-6">Deseja contratar ou entrar em contato direto?</p>
                  <button onClick={() => { 
                    addToCart({ id: 'cv_unlock', label: 'Desbloqueio: Contato de ' + site.site_name, price: site.contact_price || 15, type: 'plan' }); 
                    openCart(); 
                  }}
                  className="w-full py-5 rounded-[1.5rem] bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-[12px] tracking-[0.3em] shadow-2xl active:scale-[0.98] transition-all">
                    🔓 Desbloquear Informações de Contato (${site.contact_price || 15})
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* --- FOOTER --- */}
        <footer className="text-center opacity-20 py-10 border-t border-white/5 mt-20">
          <p className="text-[10px] font-black uppercase tracking-[0.5em]">TrustBank Technology © 2026</p>
        </footer>

      </div>
    </div>
  );
}
