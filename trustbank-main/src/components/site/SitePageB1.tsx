'use client';

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
import { handleTrustBankPayment } from '@/lib/payments'; // Importação do sistema Helio
import { toast } from 'sonner';

const POSTS_PER_PAGE = 10;

const THEMES: Record<string, string> = {
  midnight: 'from-[#0f172a] via-[#1e293b] to-[#020617]',
  cosmic: 'from-[#2e1065] via-[#4c1d95] to-[#1e1b4b]',
  ocean: 'from-[#083344] via-[#164e63] to-[#042f2e]',
  noir: 'from-black via-zinc-900 to-black',
};

interface SitePageProps {
  initialData: any; // Dados vindos do servidor via app/s/[slug]/page.tsx
}

export default function SitePageB1({ initialData }: SitePageProps) {
  const { slug } = useParams();
  const { user } = useAuth();
  const { add: addToCart, open: openCart } = useCart();

  // Estados inicializados com os dados do servidor
  const [site, setSite] = useState(initialData);
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

  // --- BUSCA DE DADOS COMPLEMENTARES ---
  useEffect(() => {
    if (!site?.id) return;
    loadPosts(true);

    // Carrega Links, Vídeos e Classificados
    Promise.all([
      supabase.from('mini_site_links').select('*').eq('site_id', site.id).order('sort_order'),
      supabase.from('mini_site_videos').select('*').eq('site_id', site.id).order('sort_order'),
      supabase.from('classified_listings').select('*').eq('site_id', site.id).eq('status', 'active')
    ]).then(([linksRes, videosRes, classifiedsRes]: any) => {
      setLinks(linksRes.data || []);
      setVideos(videosRes.data || []);
      setClassifieds(classifiedsRes.data || []);
    });

    // Verifica acessos já comprados pelo usuário
    if (user) {
      supabase.from('paywall_unlocks')
        .select('video_id')
        .eq('user_id', user.id)
        .then(r => setUnlockedVideos(new Set((r.data || []).map((u: any) => u.video_id))));
    }
  }, [site?.id, user?.id, loadPosts]);

  // --- PAGAMENTO HELIO (VÍDEO) ---
  const handlePaywall = async (video: any) => {
    if (!user) return toast.error('Faça login para desbloquear');

    // Integração direta com o sistema de pagamento USDC
    await handleTrustBankPayment({
      itemId: video.id,
      type: 'video',
      price: video.paywall_price || 0.15,
      userId: user.id,
      creatorWallet: site.user_wallet_address // Endereço do criador para o split 70/30
    });
  };

  // --- PAGAMENTO HELIO (CV) ---
  const handleUnlockCV = async () => {
    if (!user) return toast.error('Login necessário');
    
    await handleTrustBankPayment({
      itemId: site.id,
      type: 'cv',
      price: site.contact_price || 20,
      userId: user.id,
      creatorWallet: site.user_wallet_address // Split 50/50
    });
  };

  // --- RENDERIZAÇÃO (JSX) ---
  if (!site) return <div className="min-h-screen bg-black flex items-center justify-center text-white text-6xl font-black italic">TRUSTBANK</div>;

  const imoveis = classifieds.filter(c => c.type === 'imovel');
  const carros = classifieds.filter(c => c.type === 'carro');

  return (
    <div className={`min-h-screen bg-gradient-to-b ${THEMES[site.theme] || THEMES.midnight} text-white pb-32 font-sans`}>
      <div className="max-w-5xl mx-auto px-6">

        {/* HEADER */}
        <header className="flex flex-col items-center text-center pt-24 mb-20 animate-in fade-in duration-1000">
          <div className="relative mb-8">
             <img src={site.avatar_url || "/default-avatar.png"} className="w-36 h-36 rounded-full border-[6px] border-white/5 shadow-2xl object-cover" alt="Avatar" />
             <div className="absolute -bottom-2 -right-2 bg-indigo-500 p-2 rounded-full border-4 border-slate-900 shadow-lg">
                <ShieldCheck size={20} className="text-white" />
             </div>
          </div>
          <h1 className="text-5xl font-black tracking-tighter mb-4">{site.site_name}</h1>
          <p className="opacity-60 max-w-xl text-lg font-medium">{site.bio}</p>
        </header>

        {/* VÍDEOS PREMIUM */}
        {videos.length > 0 && (
          <section className="mb-32">
            <h2 className="text-3xl font-black mb-10 tracking-tighter">Conteúdo Exclusivo</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {videos.map(video => (
                <div key={video.id} className="rounded-[3rem] overflow-hidden bg-black/40 border border-white/10 shadow-2xl group">
                  {video.paywall_enabled && !unlockedVideos.has(video.id) ? (
                    <button onClick={() => handlePaywall(video)} className="relative w-full aspect-video flex flex-col items-center justify-center">
                      <img src={`https://img.youtube.com/vi/${video.youtube_video_id}/hqdefault.jpg`} className="absolute inset-0 w-full h-full object-cover opacity-20 blur-xl" alt="Preview" />
                      <div className="relative z-10 flex flex-col items-center">
                        <div className="p-6 bg-white/10 rounded-full backdrop-blur-2xl mb-5 group-hover:bg-indigo-500 transition-all">
                          <Lock size={32} className="text-white" fill="currentColor"/>
                        </div>
                        <span className="font-black text-2xl tracking-tighter mb-1">${video.paywall_price} USDC</span>
                        <span className="text-[11px] font-black uppercase opacity-40 tracking-widest">Desbloquear</span>
                      </div>
                    </button>
                  ) : (
                    <div className="aspect-video w-full">
                      <iframe src={`https://www.youtube-nocookie.com/embed/${video.youtube_video_id}`} className="w-full h-full" allowFullScreen />
                    </div>
                  )}
                  <div className="p-6 bg-white/5">
                    <p className="text-xs font-black uppercase opacity-50 truncate">{video.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CURRÍCULO PROFISSIONAL */}
        {site.show_cv && (
          <section className="max-w-3xl mx-auto bg-white/5 rounded-[4rem] border border-white/10 p-12 mb-32 shadow-2xl">
            <button onClick={() => setCvOpen(!cvOpen)} className="w-full flex justify-between items-center group">
              <span className="font-black uppercase text-[12px] tracking-[0.5em] opacity-40">Currículo Profissional</span>
              <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10">
                {cvOpen ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
              </div>
            </button>
            {cvOpen && (
              <div className="mt-12 animate-in fade-in slide-in-from-top-6 duration-700">
                <div className="prose prose-invert prose-lg max-w-none opacity-80 mb-12" dangerouslySetInnerHTML={{ __html: site.cv_content || "" }} />
                <div className="p-8 rounded-[2rem] bg-indigo-600/10 border border-indigo-500/20 text-center">
                  <button onClick={handleUnlockCV} className="w-full py-5 rounded-[1.5rem] bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-[12px] tracking-[0.3em] transition-all">
                    🔓 Desbloquear Contato (${site.contact_price || 15} USDC)
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        <footer className="text-center opacity-20 py-10 border-t border-white/5 mt-20">
          <p className="text-[10px] font-black uppercase tracking-[0.5em]">TrustBank Technology © 2026</p>
        </footer>

      </div>
    </div>
  );
}
