
import React from 'react';
import { NewsContent, PostFormat } from '../types.ts';

interface NewsPostProps {
  content: NewsContent;
  format: PostFormat;
  showLogo: boolean;
  scale?: number;
}

export const NewsPost: React.FC<NewsPostProps> = ({ content, format, showLogo, scale = 1 }) => {
  const isFeed = format === 'feed';
  const width = 1080;
  const height = isFeed ? 1350 : 1920;

  const getTitleFontSize = (text: string) => {
    if (text.length > 80) return 'text-5xl';
    if (text.length > 50) return 'text-6xl';
    return 'text-7xl';
  };

  const containerStyle: React.CSSProperties = {
    width: `${width}px`,
    height: `${height}px`,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#050a1d',
    color: 'white'
  };

  return (
    <div style={containerStyle} className="flex flex-col font-sans select-none">
      {/* Imagem Principal */}
      <div className={`${isFeed ? 'h-[65%]' : 'h-[75%]'} w-full relative overflow-hidden`}>
        <img 
          src={content.imageUrl} 
          alt="News" 
          className="w-full h-full object-cover object-center" 
        />
        
        {/* Gradientes de Profundidade */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050a1d] via-transparent to-transparent opacity-90" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#050a1d] to-transparent" />
        
        {/* LOGO: Canto Superior Direito e Bem Grande */}
        {showLogo && (
          <div className="absolute top-16 right-16 z-30 drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)]">
            {content.logoUrl ? (
              <img 
                src={content.logoUrl} 
                alt="Logo ND" 
                className="h-48 w-auto object-contain" 
              />
            ) : (
              <div className="bg-white text-blue-900 p-8 font-black text-4xl rounded shadow-2xl">ND</div>
            )}
          </div>
        )}
      </div>

      {/* Área Editorial (Textos) */}
      <div className={`${isFeed ? 'h-[35%]' : 'h-[25%]'} w-full p-20 flex flex-col justify-end bg-[#050a1d] relative z-20`}>
        <div className="mb-10 flex items-center gap-6">
          <span className="bg-red-600 text-white px-8 py-3 text-2xl font-black uppercase tracking-[0.25em] shadow-2xl">
            Urgente
          </span>
          <div className="h-[2px] flex-grow bg-white/20" />
        </div>
        
        <h1 className={`font-news ${getTitleFontSize(content.title)} font-black leading-[1.05] mb-12 uppercase tracking-tighter drop-shadow-2xl`}>
          {content.title}
        </h1>
        
        <p className="text-4xl font-medium text-slate-300 leading-snug line-clamp-3 opacity-90 italic">
          {content.summary}
        </p>

        {/* Detalhe de Rodapé */}
        <div className="mt-14 h-2 w-48 bg-red-600 shadow-lg" />
      </div>
    </div>
  );
};
