'use client';
import { useAuth } from '@/hooks/useAuth';
import { useMySite } from '@/hooks/useSite';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/store/cart';
import { slugPrice, extractYouTubeId } from '@/lib/utils';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Save, Eye, Upload, Plus, Trash2, X, Lock, Unlock } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { FeedSection } from '@/components/site/FeedSection';
import { PhotoGrid } from '@/components/ui/PhotoGrid';
import { YouTubeVerification } from '@/components/editor/YouTubeVerification';

const THEMES = [
  { id: 'midnight', label: 'Midnight', bg: '#0f172a', text: '#f1f5f9' },
  { id: 'cosmic', label: 'Cosmic', bg: '#1e1b4b', text: '#ddd6fe' },
  { id: 'ocean', label: 'Ocean', bg: '#0c1a2e', text: '#bae6fd' },
  { id: 'forest', label: 'Forest', bg: '#052e16', text: '#bbf7d0' },
  { id: 'sunset', label: 'Sunset', bg: '#431407', text: '#fed7aa' },
  { id: 'neon', label: 'Neon', bg: '#2d0036', text: '#f9a8d4' },
  { id: 'noir', label: 'Noir', bg: '#000000', text: '#ffffff' },
  { id: 'ember', label: 'Ember', bg: '#1c0a00', text: '#fdba74' },
  { id: 'arctic', label: 'Arctic', bg: '#0a1628', text: '#e0f2fe' },
  { id: 'rose', label: 'Rose', bg: '#1a0010', text: '#fda4af' },
  { id: 'gold', label: 'Gold', bg: '#1a1200', text: '#fde68a' },
];

const FONT_STYLES = [
  { id: 'sans', label: 'Modern', css: 'font-sans' },
  { id: 'serif', label: 'Elegant', css: 'font-serif' },
  { id: 'mono', label: 'Code', css: 'font-mono' },
];

const ACCENT_PRESETS = [
  '#818cf8','#a78bfa','#f472b6','#34d399','#fbbf24',
  '#60a5fa','#f87171','#22d3ee','#fb923c','#a3e635',
];

export default function EditorPage() {
  const { user, loading: authLoading } = useAuth();
  const { site, loading: siteLoading, save } = useMySite();
  const { add: addToCart } = useCart();
  const router = useRouter();

  const [siteName, setSiteName] = useState('');
  const [slug, setSlug] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [bgImageUrl, setBgImageUrl] = useState('');
  const [theme, setTheme] = useState('midnight');
  const [accentColor, setAccentColor] = useState('#818cf8');
  const [fontSize, setFontSize] = useState('md');
  const [fontStyle, setFontStyle] = useState('sans');
  const [photoShape, setPhotoShape] = useState('round');
  const [photoSize, setPhotoSize] = useState('md');
  const [videoCols, setVideoCols] = useState(2);
  const [published, setPublished] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  const [showCv, setShowCv] = useState(false);
  const [cvLocked, setCvLocked] = useState(true);
  const [cvContent, setCvContent] = useState('');
  const [cvHeadline, setCvHeadline] = useState('');
  const [cvLocation, setCvLocation] = useState('');
  const [cvSkills, setCvSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactPrice, setContactPrice] = useState('20');

  const [videos, setVideos] = useState<any[]>([]);
  const [ytUrl, setYtUrl] = useState('');
  const [ytTitle, setYtTitle] = useState('');
  const [paywallEnabled, setPaywallEnabled] = useState(false);
  const [paywallPrice, setPaywallPrice] = useState('0.15');

  const [links, setLinks] = useState<any[]>([]);
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  // Separate classified state for imovel
  const [imoveisEnabled, setImoveisEnabled] = useState(false);
  const [imList, setImList] = useState<any[]>([]);
  const [imTitle, setImTitle] = useState('');
  const [imPrice, setImPrice] = useState('');
  const [imLocation, setImLocation] = useState('');
  const [imDesc, setImDesc] = useState('');
  const [imImages, setImImages] = useState<string[]>([]);
  const [imTipo, setImTipo] = useState('');
  const [imQuartos, setImQuartos] = useState('');
  const [imM2, setImM2] = useState('');
  const [imCurrency, setImCurrency] = useState('BRL');
  const [imContact, setImContact] = useState('');
  const [imLink, setImLink] = useState('');
  const [imContactType, setImContactType] = useState<'phone'|'link'>('phone');
  const [savingIm, setSavingIm] = useState(false);
  const [uploadingIm, setUploadingIm] = useState(false);

  // Separate classified state for carro
  const [carrosEnabled, setCarrosEnabled] = useState(false);
  const [carList, setCarList] = useState<any[]>([]);
  const [carTitle, setCarTitle] = useState('');
  const [carPrice, setCarPrice] = useState('');
  const [carLocation, setCarLocation] = useState('');
  const [carDesc, setCarDesc] = useState('');
  const [carImages, setCarImages] = useState<string[]>([]);
  const [carMarca, setCarMarca] = useState('');
  const [carAno, setCarAno] = useState('');
  const [carKm, setCarKm] = useState('');
  const [carCurrency, setCarCurrency] = useState('BRL');
  const [carContact, setCarContact] = useState('');
  const [carLink, setCarLink] = useState('');
  const [carContactType, setCarContactType] = useState<'phone'|'link'>('phone');
  const [savingCar, setSavingCar] = useState(false);
  const [uploadingCar, setUploadingCar] = useState(false);

  const [saving, setSaving] = useState(false);
  const [ytVerified, setYtVerified] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile'|'appearance'|'cv'|'videos'|'links'|'imoveis'|'carros'|'feed'>('profile');

  useEffect(() => {
    if (!site) return;
    setSiteName(site.site_name || '');
    setSlug(site.slug || '');
    setBio(site.bio || '');
    setAvatarUrl(site.avatar_url || '');
    setBannerUrl(site.banner_url || '');
    setBgImageUrl(site.bg_image_url || '');
    setTheme(site.theme || 'midnight');
    setAccentColor(site.accent_color || '#818cf8');
    setFontSize(site.font_size || 'md');
    setFontStyle((site as any).font_style || 'sans');
    setPhotoShape(site.photo_shape || 'round');
    setPhotoSize((site as any).photo_size || 'md');
    setVideoCols((site as any).video_cols || 2);
    setPublished(site.published || false);
    setWalletAddress((site as any).wallet_address || '');
    setShowCv(site.show_cv || false);
    setCvLocked((site as any).cv_locked ?? true);
    setCvContent(site.cv_content || '');
    setCvHeadline(site.cv_headline || '');
    setCvLocation(site.cv_location || '');
    setCvSkills(site.cv_skills || []);
    setContactEmail(site.contact_email || '');
    setContactPhone(site.contact_phone || '');
    setContactPrice(String(site.contact_price || 20));
  }, [site]);

  useEffect(() => {
    if (!site?.id) return;
    supabase.from('mini_site_videos').select('*').eq('site_id', site.id).order('sort_order').then(r => setVideos(r.data || []));
    // Check YouTube verification
    (supabase as any).from('youtube_verifications').select('status').eq('user_id', user!.id).eq('status', 'approved').maybeSingle()
      .then((r: any) => { if (r.data) setYtVerified(true); });
    supabase.from('mini_site_links').select('*').eq('site_id', site.id).order('sort_order').then(r => setLinks(r.data || []));
    (supabase as any).from('classified_listings').select('*').eq('site_id', site.id).eq('type', 'imovel').then((r: any) => setImList(r.data || []));
    (supabase as any).from('classified_listings').select('*').eq('site_id', site.id).eq('type', 'carro').then((r: any) => setCarList(r.data || []));
  }, [site?.id]);

  useEffect(() => {
    if (!siteLoading && !site && user) {
      const defaultSlug = (user.email?.split('@')[0] || 'user').replace(/[^a-z0-9]/g, '') + user.id.slice(0, 6);
      save({ site_name: 'My Site', slug: defaultSlug, bio: '', published: false } as any).catch(() => {});
    }
  }, [siteLoading, site, user]);

  const uploadFile = async (file: File, folder: string) => {
    const path = `${user!.id}/${folder}/${Date.now()}_${file.name.replace(/[^a-z0-9.]/gi, '_')}`;
    const { error } = await supabase.storage.from('platform-assets').upload(path, file, { upsert: true });
    if (error) throw error;
    return supabase.storage.from('platform-assets').getPublicUrl(path).data.publicUrl;
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const currentSlug = site?.slug || slug;
      const sp = slugPrice(slug);
      const slugChanged = slug !== site?.slug;
      await save({
        site_name: siteName, slug: slugChanged && sp === 0 ? slug : currentSlug,
        bio, avatar_url: avatarUrl || null, banner_url: bannerUrl || null,
        bg_image_url: bgImageUrl || null, theme, accent_color: accentColor,
        font_size: fontSize, font_style: fontStyle, photo_shape: photoShape,
        photo_size: photoSize, video_cols: videoCols, published,
        show_cv: showCv, cv_locked: cvLocked, cv_content: cvContent,
        cv_headline: cvHeadline, cv_location: cvLocation, cv_skills: cvSkills,
        contact_email: contactEmail, contact_phone: contactPhone,
        contact_price: parseFloat(contactPrice) || 20,
      } as any);
      if (slugChanged && sp > 0) {
        addToCart({ id: `slug_${slug}`, label: `Slug /${slug}`, price: sp, type: 'slug' });
        toast.success(`Slug /${slug} added to cart!`);
      } else {
        toast.success('✅ Site saved!');
      }
    } catch (e: any) {
      toast.error('Error: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (published && site?.slug) { window.open(`/s/${site.slug}`, '_blank'); return; }
    await handleSave();
    addToCart({ id: 'plan_pro', label: 'Pro Plan — Publish mini site', price: 29.90, type: 'plan' });
    toast.success('Added to cart! Pay to go live.');
  };

  const addVideo = async () => {
    if (!site?.id || !ytUrl) return;
    if (!ytVerified) { toast.error('Please verify your YouTube channel first'); return; }
    const ytId = extractYouTubeId(ytUrl);
    if (!ytId || ytId.length < 5 || ytId.includes(' ') || ytId.includes('/')) {
      toast.error('Invalid YouTube URL. Use youtube.com/watch?v=... or youtu.be/...');
      return;
    }
    await supabase.from('mini_site_videos').insert({
      site_id: site.id, youtube_video_id: ytId,
      title: ytTitle || 'Video', paywall_enabled: paywallEnabled,
      paywall_price: parseFloat(paywallPrice) || 0.15, sort_order: videos.length,
    });
    toast.success('Video added!');
    setYtUrl(''); setYtTitle('');
    supabase.from('mini_site_videos').select('*').eq('site_id', site.id).order('sort_order').then(r => setVideos(r.data || []));
    // Check YouTube verification
    (supabase as any).from('youtube_verifications').select('status').eq('user_id', user!.id).eq('status', 'approved').maybeSingle()
      .then((r: any) => { if (r.data) setYtVerified(true); });
  };

  const deleteVideo = async (id: string) => {
    await supabase.from('mini_site_videos').delete().eq('id', id);
    setVideos(v => v.filter(x => x.id !== id));
  };

  const addLink = async () => {
    if (!site?.id || !linkTitle || !linkUrl) return;
    await supabase.from('mini_site_links').insert({
      site_id: site.id, user_id: user!.id, title: linkTitle, url: linkUrl, icon: 'link', sort_order: links.length,
    });
    toast.success('Link added!');
    setLinkTitle(''); setLinkUrl('');
    supabase.from('mini_site_links').select('*').eq('site_id', site.id).order('sort_order').then(r => setLinks(r.data || []));
  };

  const deleteLink = async (id: string) => {
    await supabase.from('mini_site_links').delete().eq('id', id);
    setLinks(l => l.filter(x => x.id !== id));
  };

  const uploadImages = async (files: FileList, setter: React.Dispatch<React.SetStateAction<string[]>>, current: string[]): Promise<void> => {
    for (const file of Array.from(files).slice(0, 10 - current.length)) {
      const url = await uploadFile(file, 'classified');
      setter(prev => [...prev, url]);
    }
  };

  const saveClassified = async (type: 'imovel' | 'carro') => {
    const isCar = type === 'carro';
    const title = isCar ? carTitle : imTitle;
    if (!title.trim()) { toast.error('Fill in the title'); return; }
    if (!user) { toast.error('Sign in first'); return; }

    // Auto-save site first if no site.id
    let siteId = site?.id;
    if (!siteId) {
      // Try to save site first
      toast.info('Saving your profile first...');
      try {
        await save({ site_name: siteName || 'My Site', slug: slug || user.id.slice(0,8), bio, published: false } as any);
        siteId = site?.id;
        if (!siteId) { toast.error('Please save your profile first'); return; }
      } catch {
        toast.error('Please save your profile first');
        return;
      }
    }

    isCar ? setSavingCar(true) : setSavingIm(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

      const payload = {
        site_id: siteId,
        user_id: user.id,
        type,
        title: title.trim(),
        description: (isCar ? carDesc : imDesc) || null,
        price: isCar ? (carPrice ? parseFloat(carPrice) : null) : (imPrice ? parseFloat(imPrice) : null),
        location: (isCar ? carLocation : imLocation) || null,
        images: isCar ? carImages : imImages,
        status: 'active',
        extra: isCar
          ? { marca: carMarca, ano: carAno, km: carKm, currency: carCurrency, contact: carContact, link: carLink, contact_type: carContactType }
          : { tipo: imTipo, quartos: imQuartos, m2: imM2, currency: imCurrency, contact: imContact, link: imLink, contact_type: imContactType },
      };

      // Use REST API directly — most reliable
      const res = await fetch(`${SUPABASE_URL}/rest/v1/classified_listings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${session?.access_token || SUPABASE_KEY}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        let errMsg = errText;
        try { errMsg = JSON.parse(errText).message || errText; } catch {}
        throw new Error(errMsg);
      }

      toast.success(isCar ? '🚗 Car listed!' : '🏠 Property listed!');
      if (isCar) {
        setCarTitle(''); setCarPrice(''); setCarLocation(''); setCarDesc('');
        setCarImages([]); setCarMarca(''); setCarAno(''); setCarKm('');
        setCarContact(''); setCarLink('');
      } else {
        setImTitle(''); setImPrice(''); setImLocation(''); setImDesc('');
        setImImages([]); setImTipo(''); setImQuartos(''); setImM2('');
        setImContact(''); setImLink('');
      }
      const r = await (supabase as any).from('classified_listings').select('*').eq('site_id', siteId).eq('type', type);
      isCar ? setCarList(r.data || []) : setImList(r.data || []);
    } catch (e: any) {
      console.error('saveClassified error:', e);
      toast.error('Error saving: ' + e.message);
    } finally {
      isCar ? setSavingCar(false) : setSavingIm(false);
    }
  };

  if (authLoading || siteLoading) return <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center"><div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) { router.push('/auth'); return null; }

  const currentTheme = THEMES.find(t => t.id === theme) || THEMES[0];
  const TABS = [
    { id: 'profile', label: '👤 Profile' },
    { id: 'appearance', label: '🎨 Theme' },
    { id: 'cv', label: '📄 CV' },
    { id: 'videos', label: '🎬 Videos' },
    { id: 'links', label: '🔗 Links' },
    { id: 'imoveis', label: '🏠 Properties' },
    { id: 'carros', label: '🚗 Cars' },
    { id: 'feed', label: '📢 Feed' },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Header />

      {/* Editor top bar */}
      <div className="border-b border-[var(--border)] bg-[var(--bg)] sticky top-14 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1 overflow-x-auto">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-brand text-white' : 'text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--bg2)]'}`}>
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {site?.slug && (
              <a href={`/s/${site.slug}`} target="_blank" className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> Preview
              </a>
            )}
            <button onClick={handleSave} disabled={saving} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5">
              <Save className="w-3.5 h-3.5" />{saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={handlePublish}
              className={`text-xs px-3 py-1.5 rounded-xl font-semibold text-white flex items-center gap-1.5 ${published ? 'bg-green-600' : 'bg-amber-500'}`}>
              {published ? '🟢 View Site' : '💳 Publish'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">

          {/* PROFILE */}
          {activeTab === 'profile' && (
            <div className="card p-6 space-y-5">
              <h2 className="font-black text-[var(--text)]">Profile</h2>
              <div>
                <label className="label block mb-1">Username (URL)</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[var(--text2)]">/s/</span>
                  <input value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} className="input flex-1" placeholder="yourname" />
                </div>
                {slug && slugPrice(slug) > 0 && <p className="text-xs text-amber-500 mt-1">💎 Premium — ${slugPrice(slug).toLocaleString()} USDC</p>}
              </div>
              <div>
                <label className="label block mb-1">Profile Photo</label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-[var(--bg2)] border border-[var(--border)]">
                    {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl font-black text-[var(--text2)]">{siteName?.[0] || '?'}</div>}
                  </div>
                  <label className="btn-secondary text-xs cursor-pointer">
                    {uploadingAvatar ? 'Uploading...' : <><Upload className="w-3.5 h-3.5" /> Upload</>}
                    <input type="file" accept="image/*" className="hidden" onChange={async e => { if (e.target.files?.[0]) { setUploadingAvatar(true); try { setAvatarUrl(await uploadFile(e.target.files[0], 'avatars')); } catch(err:any){toast.error(err.message);} setUploadingAvatar(false); }}} />
                  </label>
                </div>
              </div>
              <div>
                <label className="label block mb-1">Banner (full width)</label>
                {bannerUrl ? (
                  <div className="relative">
                    <img src={bannerUrl} alt="" className="w-full h-24 object-cover rounded-xl" />
                    <button onClick={() => setBannerUrl('')} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1"><X className="w-3 h-3" /></button>
                  </div>
                ) : (
                  <label className="btn-secondary text-xs cursor-pointer">
                    <Upload className="w-3.5 h-3.5" /> Upload Banner
                    <input type="file" accept="image/*" className="hidden" onChange={async e => { if (e.target.files?.[0]) setBannerUrl(await uploadFile(e.target.files[0], 'banners')); }} />
                  </label>
                )}
              </div>
              <div>
                <label className="label block mb-1">Display Name</label>
                <input value={siteName} onChange={e => setSiteName(e.target.value)} className="input" placeholder="Your Name" />
              </div>
              <div>
                <label className="label block mb-1">Bio</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} className="input resize-none" rows={3} />
              </div>

              <div className="border-t border-[var(--border)] pt-4">
                <label className="label block mb-1">💳 Wallet Address (Polygon/USDC)</label>
                <input value={walletAddress} onChange={e => setWalletAddress(e.target.value)}
                  className="input font-mono text-xs" placeholder="0x... (to receive USDC payments)" />
                <p className="text-xs text-[var(--text2)] mt-1">
                  Payments from video paywall and CV unlocks go to this address. 
                  You receive <strong>60%</strong>, platform takes 40%.
                </p>
                {walletAddress && (
                  <div className="mt-2 flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                    <span className="text-xs text-green-500">✓ Wallet set</span>
                    <a href={`https://polygonscan.com/address/${walletAddress}`} target="_blank"
                      className="text-xs text-brand hover:underline ml-auto">View on Polygonscan →</a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* APPEARANCE */}
          {activeTab === 'appearance' && (
            <div className="card p-6 space-y-5">
              <h2 className="font-black text-[var(--text)]">Appearance</h2>
              <div>
                <label className="label block mb-2">Theme</label>
                <div className="grid grid-cols-3 gap-2">
                  {THEMES.map(t => (
                    <button key={t.id} onClick={() => setTheme(t.id)}
                      className={`p-3 rounded-xl border-2 transition-all text-left ${theme === t.id ? 'border-brand' : 'border-[var(--border)]'}`}
                      style={{ background: t.bg }}>
                      <div className="w-4 h-4 rounded-full mb-2" style={{ background: accentColor }} />
                      <p className="text-xs font-bold" style={{ color: t.text }}>{t.label}</p>
                      {theme === t.id && <p className="text-[10px] text-brand mt-1">✓ Active</p>}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label block mb-2">Accent Color</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {ACCENT_PRESETS.map(c => (
                    <button key={c} onClick={() => setAccentColor(c)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${accentColor === c ? 'border-white scale-110' : 'border-transparent'}`}
                      style={{ background: c }} />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent" />
                  <input value={accentColor} onChange={e => setAccentColor(e.target.value)} className="input w-28 font-mono text-xs" />
                </div>
              </div>
              <div>
                <label className="label block mb-2">Background Image</label>
                {bgImageUrl ? (
                  <div className="relative">
                    <img src={bgImageUrl} alt="" className="w-full h-24 object-cover rounded-xl" />
                    <button onClick={() => setBgImageUrl('')} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1"><X className="w-3 h-3" /></button>
                  </div>
                ) : (
                  <label className="btn-secondary text-xs cursor-pointer">
                    <Upload className="w-3.5 h-3.5" /> Upload Background
                    <input type="file" accept="image/*" className="hidden" onChange={async e => { if (e.target.files?.[0]) setBgImageUrl(await uploadFile(e.target.files[0], 'bg')); }} />
                  </label>
                )}
              </div>
              <div>
                <label className="label block mb-2">Font Style</label>
                <div className="flex gap-2">
                  {FONT_STYLES.map(f => (
                    <button key={f.id} onClick={() => setFontStyle(f.id)}
                      className={`flex-1 py-2 rounded-xl text-sm border-2 transition-all ${fontStyle === f.id ? 'border-brand text-brand bg-brand/10' : 'border-[var(--border)] text-[var(--text2)]'} ${f.css}`}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label block mb-2">Font Size</label>
                <div className="flex gap-2">
                  {[{id:'sm',l:'S'},{id:'md',l:'M'},{id:'lg',l:'L'},{id:'xl',l:'XL'}].map(f => (
                    <button key={f.id} onClick={() => setFontSize(f.id)}
                      className={`w-10 h-10 rounded-xl font-bold text-sm border-2 transition-all ${fontSize === f.id ? 'border-brand text-brand bg-brand/10' : 'border-[var(--border)] text-[var(--text2)]'}`}>
                      {f.l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label block mb-2">Photo Shape</label>
                <div className="flex gap-2">
                  {['round','square','rounded'].map(s => (
                    <button key={s} onClick={() => setPhotoShape(s)}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize border-2 transition-all ${photoShape === s ? 'border-brand text-brand bg-brand/10' : 'border-[var(--border)] text-[var(--text2)]'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label block mb-2">Photo Size</label>
                <div className="flex gap-2">
                  {[{id:'sm',l:'S'},{id:'md',l:'M'},{id:'lg',l:'L'},{id:'xl',l:'XL'}].map(s => (
                    <button key={s.id} onClick={() => setPhotoSize(s.id)}
                      className={`w-10 h-10 rounded-xl font-bold text-sm border-2 transition-all ${photoSize === s.id ? 'border-brand text-brand bg-brand/10' : 'border-[var(--border)] text-[var(--text2)]'}`}>
                      {s.l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label block mb-2">Video Columns</label>
                <div className="flex gap-2">
                  {[1,2,3].map(n => (
                    <button key={n} onClick={() => setVideoCols(n)}
                      className={`flex-1 py-2 rounded-xl text-sm font-bold border-2 transition-all ${videoCols === n ? 'border-brand text-brand bg-brand/10' : 'border-[var(--border)] text-[var(--text2)]'}`}>
                      {n} Col{n>1?'s':''}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CV */}
          {activeTab === 'cv' && (
            <div className="card p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-black text-[var(--text)]">CV / Resume</h2>
                <button onClick={() => setShowCv(!showCv)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${showCv ? 'bg-brand' : 'bg-[var(--border)]'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${showCv ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>

              {/* CV Lock toggle */}
              <div className="flex items-center justify-between bg-[var(--bg2)] rounded-xl p-4 border border-[var(--border)]">
                <div>
                  <p className="text-sm font-semibold text-[var(--text)]">Contact Info Lock</p>
                  <p className="text-xs text-[var(--text2)]">{cvLocked ? 'Visitors must pay to see contact' : 'Contact visible to everyone'}</p>
                </div>
                <button onClick={() => setCvLocked(!cvLocked)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${cvLocked ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-green-500/10 text-green-400 border border-green-500/30'}`}>
                  {cvLocked ? <><Lock className="w-4 h-4" /> Locked</> : <><Unlock className="w-4 h-4" /> Open</>}
                </button>
              </div>

              <div>
                <label className="label block mb-1">Headline</label>
                <input value={cvHeadline} onChange={e => setCvHeadline(e.target.value)} className="input" placeholder="Senior Product Designer" />
              </div>
              <div>
                <label className="label block mb-1">Location</label>
                <input value={cvLocation} onChange={e => setCvLocation(e.target.value)} className="input" placeholder="San Francisco, CA" />
              </div>
              <div>
                <label className="label block mb-1">About</label>
                <textarea value={cvContent} onChange={e => setCvContent(e.target.value)} className="input resize-none" rows={5} placeholder="Write about yourself..." />
              </div>
              <div>
                <label className="label block mb-1">Skills</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {cvSkills.map(s => (
                    <span key={s} className="flex items-center gap-1 px-2 py-1 rounded-full bg-brand/10 text-brand text-xs">
                      {s}<button onClick={() => setCvSkills(cvSkills.filter(x => x !== s))}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={newSkill} onChange={e => setNewSkill(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && newSkill) { setCvSkills([...cvSkills, newSkill]); setNewSkill(''); }}}
                    className="input flex-1" placeholder="Add skill + Enter" />
                  <button onClick={() => { if (newSkill) { setCvSkills([...cvSkills, newSkill]); setNewSkill(''); }}} className="btn-primary px-3"><Plus className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="border-t border-[var(--border)] pt-4 space-y-3">
                <p className="text-sm font-semibold text-[var(--text)]">Contact Info</p>
                <input value={contactEmail} onChange={e => setContactEmail(e.target.value)} className="input" placeholder="Email" type="email" />
                <input value={contactPhone} onChange={e => setContactPhone(e.target.value)} className="input" placeholder="Phone / WhatsApp" />
                <div>
                  <label className="label block mb-1">Unlock Price (USDC)</label>
                  <input value={contactPrice} onChange={e => setContactPrice(e.target.value)} className="input" type="number" min="1" />
                  <p className="text-xs text-[var(--text2)] mt-1">You receive: ${(parseFloat(contactPrice||'0') * 0.5).toFixed(2)} (50%)</p>
                </div>
              </div>
            </div>
          )}

          {/* VIDEOS */}
          {activeTab === 'videos' && (
            <div className="card p-6 space-y-5">
              <h2 className="font-black text-[var(--text)]">Videos</h2>
              {!ytVerified ? (
                <YouTubeVerification onVerified={() => setYtVerified(true)} />
              ) : (
                <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <p className="text-xs text-green-500 font-semibold">YouTube channel verified — you can add paywall videos</p>
                </div>
              )}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                <p className="text-xs text-amber-600 font-semibold">💡 To protect with paywall: in YouTube Studio set visibility to "Unlisted"</p>
              </div>
              <div className="space-y-3">
                <input value={ytUrl} onChange={e => setYtUrl(e.target.value)} className="input" placeholder="YouTube URL (youtube.com/watch?v=...)" />
                <input value={ytTitle} onChange={e => setYtTitle(e.target.value)} className="input" placeholder="Video title" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setPaywallEnabled(!paywallEnabled)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${paywallEnabled ? 'bg-brand' : 'bg-[var(--border)]'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${paywallEnabled ? 'left-5' : 'left-0.5'}`} />
                    </button>
                    <span className="text-sm text-[var(--text)]">Paywall</span>
                  </div>
                  {paywallEnabled && <input value={paywallPrice} onChange={e => setPaywallPrice(e.target.value)} className="input w-28 text-xs" placeholder="Price USDC" type="number" step="0.01" />}
                </div>
                <button onClick={addVideo} disabled={!ytUrl || !site?.id || !ytVerified} className="btn-primary w-full justify-center">
                  <Plus className="w-4 h-4" /> Add Video
                </button>
              </div>
              {videos.map(v => (
                <div key={v.id} className="flex items-center gap-3 bg-[var(--bg2)] rounded-xl p-3 border border-[var(--border)]">
                  <img src={`https://img.youtube.com/vi/${v.youtube_video_id}/default.jpg`} alt="" className="w-16 h-10 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text)] truncate">{v.title}</p>
                    {v.paywall_enabled && <p className="text-xs text-amber-500">${v.paywall_price} USDC</p>}
                  </div>
                  <button onClick={() => deleteVideo(v.id)} className="text-red-400 hover:opacity-70"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          )}

          {/* LINKS */}
          {activeTab === 'links' && (
            <div className="card p-6 space-y-4">
              <h2 className="font-black text-[var(--text)]">Links & Social</h2>
              <div>
                <label className="label block mb-2">Quick Add</label>
                <div className="flex flex-wrap gap-2">
                  {[{n:'Instagram',p:'https://instagram.com/'},{n:'Twitter/X',p:'https://x.com/'},{n:'YouTube',p:'https://youtube.com/@'},{n:'TikTok',p:'https://tiktok.com/@'},{n:'LinkedIn',p:'https://linkedin.com/in/'},{n:'Spotify',p:'https://open.spotify.com/artist/'},{n:'WhatsApp',p:'https://wa.me/'},{n:'Twitch',p:'https://twitch.tv/'}].map(s => (
                    <button key={s.n} onClick={() => { setLinkTitle(s.n); setLinkUrl(s.p); }}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] hover:border-brand text-[var(--text2)] hover:text-brand transition-all">
                      {s.n}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <input value={linkTitle} onChange={e => setLinkTitle(e.target.value)} className="input" placeholder="Link title" />
                <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} className="input" placeholder="https://..." type="url" />
                <button onClick={addLink} disabled={!linkTitle || !linkUrl || !site?.id} className="btn-primary w-full justify-center">
                  <Plus className="w-4 h-4" /> Add Link
                </button>
              </div>
              {links.map(link => (
                <div key={link.id} className="flex items-center justify-between bg-[var(--bg2)] rounded-xl px-4 py-3 border border-[var(--border)]">
                  <div><p className="text-sm font-medium text-[var(--text)]">{link.title}</p><p className="text-xs text-[var(--text2)] truncate max-w-xs">{link.url}</p></div>
                  <button onClick={() => deleteLink(link.id)} className="text-red-400 hover:opacity-70"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          )}

          {/* IMOVEIS */}
          {activeTab === 'imoveis' && (
            <div className="space-y-4">
              <div className="card p-6 space-y-4">
                <h2 className="font-black text-[var(--text)]">🏠 List a Property</h2>
                <div>
                  <label className="label block mb-2">Photos — drag to reorder</label>
                  <PhotoGrid
                    images={imImages}
                    onChange={setImImages}
                    uploading={uploadingIm}
                    onUpload={async (files) => {
                      setUploadingIm(true);
                      await uploadImages(files, setImImages, imImages);
                      setUploadingIm(false);
                    }}
                  />
                </div>
                <input value={imTitle} onChange={e => setImTitle(e.target.value)} className="input" placeholder="Apartment 2BR, House, etc." />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <select value={imCurrency} onChange={e => setImCurrency(e.target.value)} className="input mb-2">
                      <option value="BRL">R$ BRL</option><option value="USD">$ USD</option><option value="EUR">€ EUR</option>
                    </select>
                    <input value={imPrice} onChange={e => setImPrice(e.target.value)} className="input" placeholder="Price" type="number" />
                  </div>
                  <input value={imLocation} onChange={e => setImLocation(e.target.value)} className="input" placeholder="Location / Neighborhood" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <input value={imTipo} onChange={e => setImTipo(e.target.value)} className="input" placeholder="Type (Apt, House)" />
                  <input value={imQuartos} onChange={e => setImQuartos(e.target.value)} className="input" placeholder="Bedrooms" type="number" />
                  <input value={imM2} onChange={e => setImM2(e.target.value)} className="input" placeholder="Area m²" />
                </div>
                <div>
                  <label className="label block mb-1">Contact Method</label>
                  <div className="flex gap-2 mb-2">
                    {(['phone','link'] as const).map(t => (
                      <button key={t} onClick={() => setImContactType(t)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${imContactType===t?'border-brand text-brand bg-brand/10':'border-[var(--border)] text-[var(--text2)]'}`}>
                        {t === 'phone' ? '📞 Phone/WhatsApp' : '🔗 Link'}
                      </button>
                    ))}
                  </div>
                  {imContactType === 'phone'
                    ? <input value={imContact} onChange={e => setImContact(e.target.value)} className="input" placeholder="+55 11 99999-9999" />
                    : <input value={imLink} onChange={e => setImLink(e.target.value)} className="input" placeholder="https://..." type="url" />
                  }
                </div>
                <textarea value={imDesc} onChange={e => setImDesc(e.target.value)} className="input resize-none" rows={3} placeholder="Description..." />
                <button onClick={() => saveClassified('imovel')} disabled={savingIm || !imTitle.trim()} className="btn-primary w-full justify-center py-3">
                  {savingIm ? 'Saving...' : '🏠 List Property'}
                </button>
              </div>
              {imList.length > 0 && (
                <div className="card p-4">
                  <h3 className="font-semibold text-[var(--text)] mb-3 text-sm">My Properties ({imList.length})</h3>
                  <div className="space-y-2">
                    {imList.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-3 bg-[var(--bg2)] rounded-xl p-3 border border-[var(--border)]">
                        {item.images?.[0] && <img src={item.images[0]} alt="" className="w-12 h-9 rounded-lg object-cover shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[var(--text)] truncate">{item.title}</p>
                          {item.price && <p className="text-xs text-brand">R$ {Number(item.price).toLocaleString()}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CARROS */}
          {activeTab === 'carros' && (
            <div className="space-y-4">
              <div className="card p-6 space-y-4">
                <h2 className="font-black text-[var(--text)]">🚗 List a Car</h2>
                <div>
                  <label className="label block mb-2">Photos — drag to reorder</label>
                  <PhotoGrid
                    images={carImages}
                    onChange={setCarImages}
                    uploading={uploadingCar}
                    onUpload={async (files) => {
                      setUploadingCar(true);
                      await uploadImages(files, setCarImages, carImages);
                      setUploadingCar(false);
                    }}
                  />
                </div>
                <input value={carTitle} onChange={e => setCarTitle(e.target.value)} className="input" placeholder="Honda Civic 2022" />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <select value={carCurrency} onChange={e => setCarCurrency(e.target.value)} className="input mb-2">
                      <option value="BRL">R$ BRL</option><option value="USD">$ USD</option><option value="EUR">€ EUR</option>
                    </select>
                    <input value={carPrice} onChange={e => setCarPrice(e.target.value)} className="input" placeholder="Price" type="number" />
                  </div>
                  <input value={carLocation} onChange={e => setCarLocation(e.target.value)} className="input" placeholder="City / State" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <input value={carMarca} onChange={e => setCarMarca(e.target.value)} className="input" placeholder="Brand" />
                  <input value={carAno} onChange={e => setCarAno(e.target.value)} className="input" placeholder="Year" />
                  <input value={carKm} onChange={e => setCarKm(e.target.value)} className="input" placeholder="KM" />
                </div>
                <div>
                  <label className="label block mb-1">Contact Method</label>
                  <div className="flex gap-2 mb-2">
                    {(['phone','link'] as const).map(t => (
                      <button key={t} onClick={() => setCarContactType(t)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${carContactType===t?'border-brand text-brand bg-brand/10':'border-[var(--border)] text-[var(--text2)]'}`}>
                        {t === 'phone' ? '📞 Phone/WhatsApp' : '🔗 Link'}
                      </button>
                    ))}
                  </div>
                  {carContactType === 'phone'
                    ? <input value={carContact} onChange={e => setCarContact(e.target.value)} className="input" placeholder="+55 11 99999-9999" />
                    : <input value={carLink} onChange={e => setCarLink(e.target.value)} className="input" placeholder="https://..." type="url" />
                  }
                </div>
                <textarea value={carDesc} onChange={e => setCarDesc(e.target.value)} className="input resize-none" rows={3} placeholder="Description, extras..." />
                <button onClick={() => saveClassified('carro')} disabled={savingCar || !carTitle.trim()} className="btn-primary w-full justify-center py-3">
                  {savingCar ? 'Saving...' : '🚗 List Car'}
                </button>
              </div>
              {carList.length > 0 && (
                <div className="card p-4">
                  <h3 className="font-semibold text-[var(--text)] mb-3 text-sm">My Cars ({carList.length})</h3>
                  <div className="space-y-2">
                    {carList.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-3 bg-[var(--bg2)] rounded-xl p-3 border border-[var(--border)]">
                        {item.images?.[0] && <img src={item.images[0]} alt="" className="w-12 h-9 rounded-lg object-cover shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[var(--text)] truncate">{item.title}</p>
                          {item.price && <p className="text-xs text-brand">R$ {Number(item.price).toLocaleString()}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* FEED */}
          {activeTab === 'feed' && site?.id && (
            <div className="card p-6">
              <h2 className="font-black text-[var(--text)] mb-2">Feed</h2>
              <p className="text-xs text-[var(--text2)] mb-4">Posts expire after 7 days. Pin for 365 days costs $10 USDC.</p>
              <FeedSection siteId={site.id} isOwner={true} />
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="lg:col-span-2">
          <div className="sticky top-28">
            <p className="text-xs font-semibold text-[var(--text2)] mb-3 uppercase tracking-wider">Live Preview</p>
            <div className="rounded-2xl overflow-hidden border border-[var(--border)] min-h-[500px]" style={{ background: currentTheme.bg }}>
              {bannerUrl && <img src={bannerUrl} alt="" className="w-full h-20 object-cover" />}
              {!bannerUrl && <div className="h-12 w-full" style={{ background: `${accentColor}20` }} />}
              <div className="p-5">
                <div className="overflow-hidden mb-3 border-4" style={{
                  borderColor: currentTheme.bg,
                  borderRadius: photoShape === 'square' ? '10px' : photoShape === 'rounded' ? '16px' : '50%',
                  width: photoSize === 'xl' ? '96px' : photoSize === 'lg' ? '80px' : '64px',
                  height: photoSize === 'xl' ? '96px' : photoSize === 'lg' ? '80px' : '64px',
                }}>
                  {avatarUrl
                    ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-2xl font-black" style={{ background: accentColor, color: '#fff' }}>{siteName?.[0] || '?'}</div>
                  }
                </div>
                <h3 className="font-black mb-1" style={{ color: currentTheme.text, fontSize: fontSize === 'xl' ? '1.5rem' : fontSize === 'lg' ? '1.25rem' : '1rem' }}>{siteName || 'Your Name'}</h3>
                {bio && <p className="text-xs mb-2 opacity-70" style={{ color: currentTheme.text }}>{bio.slice(0, 60)}</p>}
                {cvHeadline && <p className="text-xs font-semibold mb-3" style={{ color: accentColor }}>{cvHeadline}</p>}
                {links.slice(0, 3).map(l => (
                  <div key={l.id} className="mb-2 px-3 py-2 rounded-xl text-xs font-medium" style={{ background: `${accentColor}20`, color: currentTheme.text }}>{l.title}</div>
                ))}
              </div>
            </div>
            {site?.slug && <p className="text-center text-xs text-[var(--text2)] mt-2">trustbank.xyz/s/{site.slug}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
