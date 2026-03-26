'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/layout/Header';
import { PhotoGrid } from '@/components/ui/PhotoGrid';
import { Car, Zap, Loader2 } from 'lucide-react'; 
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function NovoCarroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
  const [images, setImages] = useState<(string | null)[]>(Array(10).fill(null));
  const [formData, setFormData] = useState({
    title: '', price: '', marca: '', ano: '', km: '', combustivel: '', description: ''
  });

  const handleUpload = async (index: number, file: File) => {
    setLoadingIndex(index);
    try {
      const res = await fetch('/api/upload/r2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, fileType: file.type }),
      });
      if (!res.ok) throw new Error('Erro na API');
      const { signedUrl, publicUrl } = await res.json();

      await fetch(signedUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
      
      const newImages = [...images];
      newImages[index] = publicUrl;
      setImages(newImages);
      toast.success("Foto enviada!");
    } catch (err) {
      toast.error("Erro no upload");
    } finally {
      setLoadingIndex(null);
    }
  };

  const saveAnuncio = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalImages = images.filter((img): img is string => img !== null);
    if (finalImages.length === 0) return toast.error("Adicione uma foto");

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('classified_listings').insert([{
        user_id: user?.id,
        type: 'carro',
        title: formData.title,
        price: parseFloat(formData.price),
        description: formData.description,
        images: finalImages,
        status: 'active',
        extra: { ...formData }
      }]);

      if (error) throw error;
      toast.success("Publicado!");
      router.push('/dashboard');
    } catch (err) {
      toast.error("Erro ao salvar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7">
            <h1 className="text-4xl font-black mb-4 flex items-center gap-3">
              <Car className="text-brand w-10 h-10" /> Detalhes do Veículo
            </h1>
            <PhotoGrid 
              images={images as any} 
              onUpload={handleUpload as any} 
              onRemove={((i: number) => {const n=[...images]; n[i]=null; setImages(n)}) as any}
              loadingIndex={loadingIndex}
            />
          </div>
          <div className="lg:col-span-5">
            <form onSubmit={saveAnuncio} className="bg-zinc-900/50 p-8 rounded-[40px] border border-zinc-800 space-y-6 shadow-2xl">
              <div className="space-y-4">
                <input type="text" placeholder="Título" required className="w-full bg-black p-5 rounded-2xl border border-zinc-800 outline-none" onChange={e => setFormData({...formData, title: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" placeholder="Preço (USDC)" required className="bg-black p-4 rounded-xl border border-zinc-800 outline-none" onChange={e => setFormData({...formData, price: e.target.value})} />
                  <input type="text" placeholder="Marca" className="bg-black p-4 rounded-xl border border-zinc-800 outline-none" onChange={e => setFormData({...formData, marca: e.target.value})} />
                </div>
                <textarea placeholder="Descrição..." rows={4} className="w-full bg-black p-5 rounded-2xl border border-zinc-800 outline-none" onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-brand py-6 rounded-3xl font-black text-xl flex items-center justify-center gap-3">
                {loading ? <Loader2 className="animate-spin" /> : <><Zap size={24} /> PUBLICAR AGORA</>}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}