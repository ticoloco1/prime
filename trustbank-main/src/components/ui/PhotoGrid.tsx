'use client';

interface PhotoGridProps {
  images: any[];
  onUpload: any;
  loadingIndex?: number | null;
  [key: string]: any; // Isso permite que você envie 'onRemove' ou qualquer outra coisa
}

export const PhotoGrid = ({ images, onUpload, loadingIndex, ...props }: PhotoGridProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {images.map((img, i) => (
        <div key={i} className="relative aspect-square bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden group">
          {img ? (
            <>
              <img src={img} className="w-full h-full object-cover" />
              <button 
                type="button"
                onClick={() => props.onRemove && props.onRemove(i)}
                className="absolute top-2 right-2 bg-red-500 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </>
          ) : (
            <label className="flex items-center justify-center w-full h-full cursor-pointer hover:bg-zinc-800 transition-colors">
              <input 
                type="file" 
                className="hidden" 
                onChange={(e) => e.target.files && onUpload(i, e.target.files[0])} 
              />
              <span className="text-2xl text-zinc-700">{loadingIndex === i ? '...' : '+'}</span>
            </label>
          )}
        </div>
      ))}
    </div>
  );
};