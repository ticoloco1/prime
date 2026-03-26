'use client';

import { useState } from 'react';
import { Upload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface FileUploadProps {
  onUploadComplete: (url: string) => void;
  folder?: string;
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validação simples (ex: 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return toast.error("Arquivo muito grande (máx 5MB)");
    }

    try {
      setUploading(true);
      setProgress(10);

      // 1. Pedir a Presigned URL para a sua API Route
      const res = await fetch('/api/upload/r2', {
        method: 'POST',
        body: JSON.stringify({ fileName: file.name, fileType: file.type }),
      });

      const { uploadUrl, publicUrl } = await res.json();
      setProgress(40);

      // 2. Upload direto do browser para o R2 (via PUT)
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      if (!uploadRes.ok) throw new Error('Falha no upload para o storage');

      setProgress(100);
      toast.success("Mídia enviada!");
      onUploadComplete(publicUrl);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao processar upload");
    } finally {
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
      }, 1000);
    }
  };

  return (
    <div className="relative">
      <label className={`
        flex flex-col items-center justify-center w-full h-32 
        border-2 border-dashed rounded-[2rem] cursor-pointer
        transition-all duration-300
        ${uploading ? 'border-indigo-500 bg-indigo-500/5' : 'border-white/10 hover:border-white/30 bg-white/5'}
      `}>
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-2" />
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{progress}%</p>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-white/20 mb-2 group-hover:text-white/40" />
              <p className="text-[10px] font-black uppercase tracking-widest opacity-30 text-center px-4">
                Clique para enviar foto ou vídeo
              </p>
            </>
          )}
        </div>
        <input type="file" className="hidden" onChange={handleFileChange} disabled={uploading} accept="image/*,video/*" />
      </label>

      {progress === 100 && (
        <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1 animate-bounce">
          <CheckCircle2 size={16} className="text-white" />
        </div>
      )}
    </div>
  );
}
