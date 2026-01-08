
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

  const titleClass = getTitleFontSize(content.title);

  return (
    <div style={containerStyle} className="flex flex-col font-sans">
      <div className={`${isFeed ? 'h-[62%]' : 'h-[72%]'} w-full relative overflow-hidden`}>
        <img src={content.imageUrl} alt="News" className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050a1d] via-[#050a1d]/10 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-40 bg-[#050a1d]/30 backdrop-blur-2xl" />
        {showLogo && (
          <div className="absolute top-14 right-14 z-20 drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]">
            {content.logoUrl ? (
              <img src={content.logoUrl} alt="Logo ND" className="h-40 w-auto object-contain" />
            ) : (
              <div className="bg-white text-blue-900 p-6 font-black text-3xl rounded shadow-2xl">LOGO</div>
            )}
          </div>
        )}
      </div>
      <div className={`${isFeed ? 'h-[38%]' : 'h-[28%]'} w-full p-20 flex flex-col justify-end bg-[#050a1d] relative z-10`}>
        <div className="mb-8 flex items-center gap-6">
          <span className="bg-red-600 text-white px-6 py-2.5 text-2xl font-black uppercase tracking-[0.2em] shadow-xl">Urgente</span>
          <div className="h-[2px] flex-grow bg-white/20" />
        </div>
        <h1 className={`font-news ${titleClass} font-black leading-[1.05] mb-10 uppercase tracking-tight drop-shadow-lg`}>{content.title}</h1>
        <p className="text-3xl font-medium text-slate-300 leading-relaxed line-clamp-3 opacity-90 italic">{content.summary}</p>
        <div className="mt-12 h-1.5 w-32 bg-red-600" />
      </div>
    </div>
  );
};
