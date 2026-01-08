
import React, { useState, useRef, useCallback } from 'react';
import { NewsContent, AppState } from './types.ts';
import { processNewsContent } from './services/geminiService.ts';
import { NewsPost } from './components/NewsPost.tsx';
import * as htmlToImage from 'html-to-image';

const DEFAULT_LOGO = "https://i.ibb.co/L6V6Y4K/logo-nd-104-5.png"; 

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    step: 'input',
    content: {
      title: 'Título da Notícia Principal em Destaque',
      subtitle: '',
      summary: 'Cole o link ou texto da matéria para que a Inteligência Artificial gere o resumo automaticamente.',
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
      alert("Erro: " + (err as Error).message);
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
        link.download = `ND1045-${format}-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Falha ao exportar', err);
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900">
      <header className="w-full bg-[#050a1d] border-b border-white/10 py-4 px-6 flex justify-between items-center shadow-xl text-white">
        <div className="flex items-center gap-3">
          <img src={DEFAULT_LOGO} alt="ND Logo" className="h-12 w-auto" />
          <div className="h-8 w-px bg-white/20 mx-2" />
          <h1 className="text-lg font-black tracking-tighter uppercase italic">
            InstaNews <span className="text-red-600">Pro</span>
          </h1>
        </div>
        {state.step === 'edit' && (
          <button 
            onClick={() => setState(prev => ({ ...prev, step: 'input' }))}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-full font-bold text-xs transition-all uppercase tracking-widest shadow-lg"
          >
            + Novo Post
          </button>
        )}
      </header>

      <main className="flex-grow w-full max-w-7xl mx-auto p-4 lg:p-10">
        {state.step === 'input' ? (
          <div className="max-w-2xl mx-auto mt-16 space-y-8 text-center">
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-[#050a1d]">Editor de Notícias ND</h2>
              <p className="text-slate-500 font-medium">Transforme links ou textos em posts profissionais.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-200">
              <textarea
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Cole o link da notícia ou o texto aqui..."
                className="w-full h-40 p-6 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-red-500 outline-none transition-all resize-none mb-6 text-slate-700"
              />
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  disabled={state.isProcessing}
                  onClick={() => handleProcess(inputVal.startsWith('http'))}
                  className="flex-[2] bg-[#050a1d] text-white py-4 px-6 rounded-xl font-black text-lg hover:bg-black disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  {state.isProcessing ? "PROCESSANDO..." : "GERAR COM IA ✨"}
                </button>
                <button
                  onClick={handleManualEntry}
                  className="flex-[1] bg-white text-[#050a1d] border-2 border-slate-200 py-4 px-6 rounded-xl font-bold hover:border-[#050a1d] transition-all"
                >
                  MANUAL
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Editor Lateral */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-6 rounded-3xl shadow-md border border-slate-200 space-y-6">
                <h3 className="font-black text-xl text-[#050a1d] uppercase tracking-tight">Conteúdo</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Título</label>
                    <input 
                      type="text"
                      value={state.content.title}
                      onChange={(e) => setState(prev => ({ ...prev, content: { ...prev.content, title: e.target.value } }))}
                      className="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Resumo</label>
                    <textarea 
                      value={state.content.summary}
                      onChange={(e) => setState(prev => ({ ...prev, content: { ...prev.content, summary: e.target.value } }))}
                      className="w-full h-24 p-3 bg-slate-50 rounded-lg border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none text-sm leading-relaxed"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 relative">
                      <label className="text-[9px] font-black text-slate-400 uppercase block mb-2">Foto Notícia</label>
                      <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'image')} className="text-[10px] w-full" />
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 relative">
                      <label className="text-[9px] font-black text-slate-400 uppercase block mb-2">Mudar Logo</label>
                      <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} className="text-[10px] w-full" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <input type="checkbox" id="showLogo" checked={state.showLogo} onChange={(e) => setState(prev => ({ ...prev, showLogo: e.target.checked }))} className="w-5 h-5 accent-red-600" />
                    <label htmlFor="showLogo" className="text-xs font-bold text-slate-600 uppercase">Exibir Logo ND</label>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-md border border-slate-200">
                <h3 className="font-black text-lg text-slate-800 mb-4 uppercase tracking-tight">Exportar</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => downloadPost('feed')} className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-slate-100 hover:border-red-500 hover:bg-red-50 transition-all">
                    <span className="text-2xl">🖼️</span>
                    <span className="font-black text-[10px] uppercase">FEED (4:5)</span>
                  </button>
                  <button onClick={() => downloadPost('story')} className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-slate-100 hover:border-red-500 hover:bg-red-50 transition-all">
                    <span className="text-2xl">📱</span>
                    <span className="font-black text-[10px] uppercase">STORY (9:16)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Preview do Post */}
            <div className="lg:col-span-8 flex flex-col items-center space-y-6">
              <div className="flex bg-white shadow-sm border border-slate-200 p-1.5 rounded-2xl">
                <button 
                  onClick={() => setActiveFormat('feed')} 
                  className={`px-10 py-3 rounded-xl font-black text-xs transition-all uppercase ${activeFormat === 'feed' ? 'bg-[#050a1d] text-white shadow-lg scale-105' : 'text-slate-400'}`}
                >
                  FEED
                </button>
                <button 
                  onClick={() => setActiveFormat('story')} 
                  className={`px-10 py-3 rounded-xl font-black text-xs transition-all uppercase ${activeFormat === 'story' ? 'bg-[#050a1d] text-white shadow-lg scale-105' : 'text-slate-400'}`}
                >
                  STORY
                </button>
              </div>

              <div className="w-full flex justify-center bg-slate-200/50 rounded-[2.5rem] p-10 border border-slate-200 shadow-inner overflow-hidden min-h-[600px] items-center">
                <div className="transform scale-[0.3] sm:scale-[0.4] lg:scale-[0.35] xl:scale-[0.4] origin-center">
                   <div className="absolute opacity-0 pointer-events-none">
                      <div ref={feedRef}><NewsPost content={state.content} format="feed" showLogo={state.showLogo} /></div>
                      <div ref={storyRef}><NewsPost content={state.content} format="story" showLogo={state.showLogo} /></div>
                   </div>
                   <NewsPost content={state.content} format={activeFormat} showLogo={state.showLogo} />
                </div>
              </div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">Preview Digital ND 104.5 FM</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
