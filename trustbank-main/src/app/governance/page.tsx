'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/layout/Header';
import { Shield, Ban, CheckCircle, Globe, TrendingUp, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export default function GovernancePage() {
  const [sites, setSites] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data } = await supabase.from('mini_sites').select('*').order('created_at', { descending: true });
    if (data) {
      setSites(data);
      setStats({
        total: data.length,
        active: data.filter(s => s.published).length,
        revenue: data.reduce((acc, curr) => acc + (curr.contact_price || 0), 0)
      });
    }
    setLoading(false);
  }

  async function toggleStatus(id: string, currentStatus: boolean) {
    const { error } = await supabase
      .from('mini_sites')
      .update({ published: !currentStatus })
      .eq('id', id);

    if (error) {
      toast.error("Erro ao alterar status");
    } else {
      toast.success(currentStatus ? "Site Bloqueado" : "Site Liberado");
      fetchData();
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-brand/20 flex items-center justify-center">
            <Shield className="w-6 h-6 text-brand" />
          </div>
          <div>
            <h1 className="text-3xl font-black">Governance & Power</h1>
            <p className="text-zinc-500">Controle total sobre o ecossistema TrustBank</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl">
            <Globe className="text-brand mb-2" />
            <p className="text-zinc-400 text-sm">Total de Sites</p>
            <h3 className="text-2xl font-black">{stats.total}</h3>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl">
            <TrendingUp className="text-green-500 mb-2" />
            <p className="text-zinc-400 text-sm">Sites Ativos</p>
            <h3 className="text-2xl font-black">{stats.active}</h3>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl">
            <DollarSign className="text-yellow-500 mb-2" />
            <p className="text-zinc-400 text-sm">Estimativa de Receita</p>
            <h3 className="text-2xl font-black">USDC {stats.revenue}</h3>
          </div>
        </div>

        {/* Management List */}
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-zinc-800 bg-zinc-900/50">
            <h2 className="font-bold">Gerenciamento de Instâncias</h2>
          </div>
          <div className="divide-y divide-zinc-800">
            {sites.map(site => (
              <div key={site.id} className="p-6 flex flex-wrap items-center justify-between gap-4 hover:bg-white/5 transition-colors">
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden">
                    <img src={site.avatar_url || `https://avatar.vercel.sh/${site.slug}`} alt="" />
                  </div>
                  <div>
                    <h4 className="font-bold">{site.site_name}</h4>
                    <p className="text-xs text-zinc-500 font-mono">{site.slug}.trustbank.xyz</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${site.published ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {site.published ? 'Online' : 'Bloqueado'}
                  </div>
                  <button 
                    onClick={() => toggleStatus(site.id, site.published)}
                    className="p-2 hover:bg-zinc-800 rounded-lg transition-colors group"
                  >
                    {site.published ? <Ban className="w-5 h-5 text-zinc-500 group-hover:text-red-500" /> : <CheckCircle className="w-5 h-5 text-zinc-500 group-hover:text-green-500" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
