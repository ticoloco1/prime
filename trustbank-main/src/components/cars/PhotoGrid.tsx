'use client';
import { useState } from 'react';
import { Camera, X, ChevronLeft, ChevronRight, Maximize2, Loader2 } from 'lucide-react';

interface PhotoGridProps {
  images: (string | null)[];
  onUpload: (index: number, file: File) => void;
  onRemove: (index: number) => void;
  loadingIndex: number | null;
}

export function PhotoGrid({ images, onUpload, onRemove, loadingIndex }: PhotoGridProps) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const next = () => setViewerIndex(prev => (prev !== null && prev < 9 ? prev + 1 : 0));
  const prev = () => setViewerIndex(prev => (prev !== null && prev > 0 ? prev - 1 : 9));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {images.map((img, i) => (
          <div key={i} className="relative aspect-square bg-zinc-900 rounded-2xl border-2 border-dashed border-zinc-800 hover:border-brand transition-all overflow-hidden group">
            {img ? (
              <>
                <img src={img} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button type="button" onClick={() => setViewerIndex(i)} className="p-2 bg-white text-black rounded-full shadow-lg hover:scale-110 transition-transform">
                    <Maximize2 size={16} />
                  </button>
                  <button type="button" onClick={() => onRemove(i)} className="p-2 bg-red-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform">
                    <X size={16} />
                  </button>
                </div>
              </>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-zinc-800/50 transition-colors">
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onUpload(i, e.target.files[0])} />
                {loadingIndex === i ? <Loader2 className="animate-spin text-brand" /> : <Camera className="text-zinc-700" />}
                <span className="text-[10px] text-zinc-600 mt-1">Slot {i + 1}</span>
              </label>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox / Carrossel Expansível */}
      {viewerIndex !== null && (
        <div className="fixed inset-0 z-[999] bg-black/98 flex items-center justify-center backdrop-blur-md">
          <button onClick={() => setViewerIndex(null)} className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
            <X size={40} />
          </button>
          
          <button onClick={prev} className="absolute left-4 p-4 text-white/30 hover:text-white">
            <ChevronLeft size={60} />
          </button>

          <div className="w-full max-w-5xl h-[70vh] flex items-center justify-center p-4">
            {images[viewerIndex] ? (
              <img src={images[viewerIndex]!} className="max-w-full max-h-full object-contain rounded-xl shadow-2xl border border-white/5" />
            ) : (
              <div className="text-zinc-800 text-2xl font-black">SLOT VAZIO</div>
            )}
          </div>

          <button onClick={next} className="absolute right-4 p-4 text-white/30 hover:text-white">
            <ChevronRight size={60} />
          </button>

          <div className="absolute bottom-10 flex gap-3">
            {images.map((img, idx) => (
              <div 
                key={idx} 
                onClick={() => setViewerIndex(idx)}
                className={`w-3 h-3 rounded-full cursor-pointer transition-all ${idx === viewerIndex ? 'bg-brand scale-125' : 'bg-zinc-800 hover:bg-zinc-600'}`} 
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
