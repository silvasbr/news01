
import React, { useState, useRef, useCallback } from 'react';
import { NewsContent, AppState } from './types.ts';
import { processNewsContent } from './services/geminiService.ts';
import { NewsPost } from './components/NewsPost.tsx';
import * as htmlToImage from 'html-to-image';

// Logo Padrão: ND 104.5 FM
const DEFAULT_LOGO = "https://i.ibb.co/L6V6Y4K/logo-nd-104-5.png"; 

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    step: 'input',
    content: {
      title: 'Título Exemplo da Notícia Principal',
      subtitle: '',
      summary: 'Aqui aparecerá o resumo da notícia após você colar o link ou digitar o texto no campo inicial.',
      imageUrl: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&q=80&w=1080',
      logoUrl: DEFAULT_LOGO
    },
    showLogo: true,
    isProcessing: false,
  });

  const [inputVal, setInputVal] = useState('');
  const [activeFormat, setActiveFormat] = useState<'feed' | 'story'>('feed');
  const feedRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);

  const handleProcess = async (isUrl: boolean) => {
    if (!inputVal.trim()) return;
    
    setState(prev => ({ ...prev, isProcessing: true }));
    try {
      const result = await processNewsContent(inputVal, isUrl);
      setState(prev => ({
        ...prev,
        step: 'edit',
        content: {
          ...prev.content,
          ...result,
          logoUrl: prev.content.logoUrl || DEFAULT_LOGO
        },
        isProcessing: false
      }));
    } catch (err) {
      alert("Erro ao processar: " + (err as Error).message);
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const handleManualEntry = () => {
    setState(prev => ({ ...prev, step: 'edit', isProcessing: false }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'logo') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setState(prev => ({
          ...prev,
          content: {
            ...prev.content,
            [type === 'image' ? 'imageUrl' : 'logoUrl']: reader.result as string
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadPost = useCallback(async (format: 'feed' | 'story') => {
    const node = format === 'feed' ? feedRef.current : storyRef.current;
    if (node) {
      try {
        const dataUrl = await htmlToImage.toPng(node, {
          width: 1080,
          height: format === 'feed' ? 1350 : 1920,
          pixelRatio: 2,
        });
        const link = document.createElement('a');
        link.download = `nd-noticia-${format}-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Falha ao exportar', err);
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <header className="w-full bg-[#050a1d] border-b border-white/10 py-5 px-8 flex justify-between items-center shadow-lg text-white">
        <div className="flex items-center gap-4">
          <img src={DEFAULT_LOGO} alt="ND Logo" className="h-10 w-auto" />
          <h1 className="text-xl font-black tracking-tight border-l border-white/20 pl-4">
            NOTÍCIAS <span className="text-red-600">PRO</span>
          </h1>
        </div>
        {state.step === 'edit' && (
          <button 
            onClick={() => setState(prev => ({ ...prev, step: 'input' }))}
            className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-bold text-sm transition-all"
          >
            + Novo Post
          </button>
        )}
      </header>

      <main className="flex-grow w-full max-w-7xl mx-auto p-4 md:p-8">
        {state.step === 'input' ? (
          <div className="max-w-3xl mx-auto mt-12 space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="text-center space-y-4">
              <h2 className="text-5xl font-black text-[#050a1d]">Postador de Notícias ND</h2>
              <p className="text-slate-500 text-xl font-medium">A tecnologia da IA aplicada ao jornalismo da ND 104.5 FM.</p>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-2xl border border-slate-200">
              <textarea
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Cole aqui o link da notícia ou o texto que deseja transformar..."
                className="w-full h-48 p-6 rounded-2xl border-2 border-slate-100 focus:border-red-500 outline-none transition-all resize-none mb-8 text-lg text-slate-700 font-medium"
              />
              
              <div className="flex flex-col md:flex-row gap-4">
                <button
                  disabled={state.isProcessing}
                  onClick={() => handleProcess(inputVal.startsWith('http'))}
                  className="flex-[2] bg-[#050a1d] text-white py-5 px-8 rounded-2xl font-black text-xl hover:bg-black disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-xl"
                >
                  {state.isProcessing ? (
                    <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : "GERAR AUTOMÁTICO ✨"}
                </button>
                <button
                  onClick={handleManualEntry}
                  className="flex-[1] bg-white text-[#050a1d] border-2 border-slate-200 py-5 px-8 rounded-2xl font-bold text-lg hover:border-[#050a1d] transition-all shadow-sm"
                >
                  MODO MANUAL
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5 space-y-8 animate-in slide-in-from-left-6 duration-500">
              <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-200 space-y-6">
                <h3 className="font-black text-2xl text-[#050a1d] border-b-4 border-red-600 pb-2 w-fit">Editor ND</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Manchete (Título)</label>
                    <input 
                      type="text"
                      value={state.content.title}
                      onChange={(e) => setState(prev => ({ ...prev, content: { ...prev.content, title: e.target.value } }))}
                      className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Resumo da Notícia</label>
                    <textarea 
                      value={state.content.summary}
                      onChange={(e) => setState(prev => ({ ...prev, content: { ...prev.content, summary: e.target.value } }))}
                      className="w-full h-32 p-4 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none resize-none font-medium text-slate-600"
                    />
                  </div>
                  <div className="pt-4 border-t border-slate-100 space-y-6">
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Link Direto da Imagem</label>
                      <input 
                        type="text"
                        placeholder="https://sua-foto.jpg"
                        value={state.content.imageUrl}
                        onChange={(e) => setState(prev => ({ ...prev, content: { ...prev.content, imageUrl: e.target.value } }))}
                        className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 focus:ring-1 focus:ring-red-500 outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-100 rounded-xl border border-slate-200">
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Subir Nova Foto</label>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'image')}
                          className="w-full text-[10px] file:mr-2 file:py-1 file:px-2 file:rounded file:bg-[#050a1d] file:text-white"
                        />
                      </div>
                      <div className="p-4 bg-slate-100 rounded-xl border border-slate-200">
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Mudar Logo</label>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'logo')}
                          className="w-full text-[10px] file:mr-2 file:py-1 file:px-2 file:rounded file:bg-[#050a1d] file:text-white"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <input 
                      type="checkbox" 
                      id="showLogo"
                      checked={state.showLogo}
                      onChange={(e) => setState(prev => ({ ...prev, showLogo: e.target.checked }))}
                      className="w-6 h-6 accent-red-600"
                    />
                    <label htmlFor="showLogo" className="text-sm font-black text-slate-700 uppercase tracking-tight">Manter Logo ND 104.5 FM</label>
                  </div>
                </div>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-200">
                <h3 className="font-black text-lg text-slate-800 mb-6 uppercase">Download Final</h3>
                <div className="grid grid-cols-2 gap-6">
                  <button onClick={() => downloadPost('feed')} className="flex flex-col items-center gap-3 p-6 rounded-2xl border-4 border-dotted border-slate-100 hover:border-red-500 hover:bg-red-50 transition-all group">
                    <span className="text-4xl group-hover:scale-110 transition-transform">🖼️</span>
                    <span className="font-black text-xs text-slate-700 uppercase">FEED (4:5)</span>
                  </button>
                  <button onClick={() => downloadPost('story')} className="flex flex-col items-center gap-3 p-6 rounded-2xl border-4 border-dotted border-slate-100 hover:border-red-500 hover:bg-red-50 transition-all group">
                    <span className="text-4xl group-hover:scale-110 transition-transform">📱</span>
                    <span className="font-black text-xs text-slate-700 uppercase">STORY (9:16)</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-8">
              <div className="flex bg-slate-200 p-1.5 rounded-2xl w-fit mx-auto border border-slate-300">
                <button onClick={() => setActiveFormat('feed')} className={`px-8 py-3 rounded-xl font-black text-sm transition-all ${activeFormat === 'feed' ? 'bg-white text-blue-900 shadow-md scale-105' : 'text-slate-500 hover:text-slate-800'}`}>PREVIEW FEED</button>
                <button onClick={() => setActiveFormat('story')} className={`px-8 py-3 rounded-xl font-black text-sm transition-all ${activeFormat === 'story' ? 'bg-white text-blue-900 shadow-md scale-105' : 'text-slate-500 hover:text-slate-800'}`}>PREVIEW STORY</button>
              </div>
              <div className="flex justify-center items-center bg-[#050a1d]/5 rounded-[3rem] p-12 min-h-[750px] overflow-hidden relative border border-slate-200 shadow-inner">
                <div className="transform scale-[0.35] md:scale-[0.45] lg:scale-[0.4] xl:scale-[0.45]">
                   <div className="absolute opacity-0 pointer-events-none">
                      <div ref={feedRef}><NewsPost content={state.content} format="feed" showLogo={state.showLogo} /></div>
                      <div ref={storyRef}><NewsPost content={state.content} format="story" showLogo={state.showLogo} /></div>
                   </div>
                   <NewsPost content={state.content} format={activeFormat} showLogo={state.showLogo} />
                </div>
              </div>
              <p className="text-center text-slate-400 text-xs font-black uppercase tracking-[0.3em]">Ambiente de Produção ND 104.5 FM</p>
            </div>
          </div>
        )}
      </main>
      <footer className="py-12 text-slate-400 text-[10px] font-black uppercase tracking-[0.5em] text-center border-t border-slate-200 bg-white">
        © 2024 SISTEMA DE JORNALISMO ND — INTELIGÊNCIA ARTIFICIAL
      </footer>
    </div>
  );
};

export default App;
