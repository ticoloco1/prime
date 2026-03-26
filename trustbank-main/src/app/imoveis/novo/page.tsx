'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/layout/Header';
import { PhotoGrid } from '@/components/cars/PhotoGrid'; // Reutilizamos o componente de galeria
import { Home, Zap, Loader2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function NovoImovelPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
  const [images, setImages] = useState<(string | null)[]>(Array(10).fill(null));
  const [formData, setFormData] = useState({
    title: '', price: '', location: '', tipo: 'Casa', quartos: '', m2: '', description: ''
  });

  const handleUpload = async (index: number, file: File) => {
    setLoadingIndex(index);
    try {
      const res = await fetch('/api/upload/r2', {
        method: 'POST',
        body: JSON.stringify({ fileName: file.name, fileType: file.type }),
      });
      const { uploadUrl, publicUrl } = await res.json();
      await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
      
      const newImages = [...images];
      newImages[index] = publicUrl;
      setImages(newImages);
      toast.success("Foto do imóvel enviada!");
    } catch (err) {
      toast.error("Erro no upload");
    } finally {
      setLoadingIndex(null);
    }
  };

  const saveAnuncio = async (e: React.FormEvent) => {
    e.preventDefault();
    const fotosLimpas = images.filter(img => img !== null);
    if (fotosLimpas.length === 0) return toast.error("Adicione pelo menos uma foto do imóvel");

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('classified_listings').insert([{
      user_id: user?.id,
      type: 'imovel',
      title: formData.title,
      price: parseFloat(formData.price),
      location: formData.location,
      description: formData.description,
      images: fotosLimpas,
      status: 'active',
      extra: {
        tipo: formData.tipo,
        quartos: formData.quartos,
        m2: formData.m2
      }
    }]);

    if (!error) {
      toast.success("Imóvel anunciado com sucesso!");
      router.push('/imoveis');
    } else {
      toast.error("Erro ao salvar no banco");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LADO ESQUERDO: GALERIA */}
          <div className="lg:col-span-7">
            <h1 className="text-4xl font-black mb-4 flex items-center gap-3">
              <Home className="text-brand w-10 h-10" /> Anunciar Imóvel
            </h1>
            <p className="text-zinc-500 mb-8 font-medium">Capture os melhores ângulos. Arraste ou clique para subir até 10 fotos.</p>
            
            <PhotoGrid 
              images={images} 
              onUpload={handleUpload} 
              onRemove={(i) => {const n=[...images]; n[i]=null; setImages(n)}}
              loadingIndex={loadingIndex}
            />
          </div>

          {/* LADO DIREITO: FORMULÁRIO */}
          <div className="lg:col-span-5">
            <form onSubmit={saveAnuncio} className="bg-zinc-900/40 p-8 rounded-[40px] border border-zinc-800 space-y-5 shadow-2xl backdrop-blur-md">
              <input type="text" placeholder="Título do Imóvel (ex: Cobertura no Leblon)" required className="w-full bg-black p-5 rounded-2xl border border-zinc-800 focus:border-brand outline-none font-bold" onChange={e => setFormData({...formData, title: e.target.value})} />
              
              <div className="relative">
                <MapPin className="absolute left-4 top-5 text-zinc-500 w-5 h-5" />
                <input type="text" placeholder="Localização (Cidade/Bairro)" required className="w-full bg-black p-5 pl-12 rounded-2xl border border-zinc-800 outline-none" onChange={e => setFormData({...formData, location: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Valor (USDC)" required className="bg-black p-4 rounded-xl border border-zinc-800 outline-none" onChange={e => setFormData({...formData, price: e.target.value})} />
                <select className="bg-black p-4 rounded-xl border border-zinc-800 outline-none text-zinc-400" onChange={e => setFormData({...formData, tipo: e.target.value})}>
                  <option value="Casa">Casa</option>
                  <option value="Apartamento">Apartamento</option>
                  <option value="Terreno">Terreno</option>
                  <option value="Comercial">Comercial</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Quartos" className="bg-black p-4 rounded-xl border border-zinc-800 outline-none" onChange={e => setFormData({...formData, quartos: e.target.value})} />
                <input type="text" placeholder="Área (m²)" className="bg-black p-4 rounded-xl border border-zinc-800 outline-none" onChange={e => setFormData({...formData, m2: e.target.value})} />
              </div>

              <textarea placeholder="Descrição completa do imóvel..." rows={4} className="w-full bg-black p-5 rounded-2xl border border-zinc-800 outline-none" onChange={e => setFormData({...formData, description: e.target.value})}></textarea>

              <button type="submit" disabled={loading} className="w-full bg-brand py-6 rounded-3xl font-black text-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl shadow-brand/20">
                {loading ? <Loader2 className="animate-spin" /> : <><Zap size={24} /> PUBLICAR IMÓVEL</>}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
