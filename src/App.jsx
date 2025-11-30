import React, { useState, useEffect } from 'react';
import { Youtube, Search, Download, Music, Video, Check, AlertCircle, Loader2, Zap, ShieldCheck, Globe, Linkedin, Instagram, X } from 'lucide-react';

export default function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [videoData, setVideoData] = useState(null);
  const [serverStatus, setServerStatus] = useState('sleeping');
  
  // Estado para controlar o modal de download
  const [isProcessing, setIsProcessing] = useState(false);
  // Estado para mostrar o botão de fechar (só aparece depois de um tempo)
  const [showCloseBtn, setShowCloseBtn] = useState(false);
  
  // URL do seu servidor Backend (Render)
  const API_BASE_URL = "https://youtube-downloader-d535.onrender.com";

  // Efeito para acordar o servidor assim que o site abre
  useEffect(() => {
    const wakeUpServer = async () => {
      setServerStatus('waking');
      try {
        await fetch(`${API_BASE_URL}/`); 
        setServerStatus('ready');
      } catch (e) {
        // Se falhar, tenta de novo em 5 segundos
        setTimeout(wakeUpServer, 5000);
      }
    };
    wakeUpServer();
  }, []);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setError('');
    setVideoData(null);

    // Validação Universal
    const urlRegex = /^(https?:\/\/[^\s]+)/;
    if (!urlRegex.test(url)) {
      setError('Por favor, insira uma URL válida.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url })
      });

      if (!response.ok) throw new Error('Erro ao conectar ao servidor. Tente novamente.');

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setVideoData(data);

    } catch (err) {
      setError(err.message || 'Erro ao conectar.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (qualityId) => {
    setIsProcessing(true);
    setShowCloseBtn(false); // Esconde o botão de fechar inicialmente
    
    const downloadUrl = `${API_BASE_URL}/api/download?url=${encodeURIComponent(url)}&quality=${qualityId}`;
    
    // Inicia o download
    window.location.href = downloadUrl;
    
    // Agora NÃO fecha sozinho imediatamente.
    // Espera 10 segundos e então MOSTRA o botão para o usuário fechar quando quiser.
    // Isso evita que a janela suma antes do download começar.
    setTimeout(() => {
        setShowCloseBtn(true);
    }, 10000);
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 text-white font-sans flex flex-col relative">
      
      {/* Tela de Processamento (Overlay) - CORRIGIDA */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center animate-fadeIn p-4">
          <div className="w-full max-w-md bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-700 text-center relative overflow-hidden">
            
            {/* Animação de carregamento */}
            <div className="relative w-24 h-24 mx-auto mb-8">
               <div className="absolute inset-0 border-4 border-slate-600 rounded-full"></div>
               <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
               <Download className="absolute inset-0 m-auto w-10 h-10 text-white animate-pulse" />
            </div>

            <h3 className="text-2xl font-bold mb-4">A preparar o seu ficheiro...</h3>
            
            <div className="space-y-4 text-slate-300 text-sm">
                <p>O servidor está a processar o vídeo. <br/> <span className="text-yellow-400 font-semibold">Por favor, não feche esta janela.</span></p>
                <p className="text-xs text-slate-500">
                    Dependendo do tamanho do vídeo, isto pode demorar de 30 segundos a alguns minutos.
                    O download iniciará automaticamente no seu navegador assim que estiver pronto.
                </p>
            </div>

            {/* Botão de Fechar Manual (Só aparece depois de 10s) */}
            {showCloseBtn && (
                <button 
                    onClick={() => setIsProcessing(false)}
                    className="mt-8 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors flex items-center justify-center gap-2 mx-auto w-full animate-fadeIn"
                >
                    <Check className="w-4 h-4" /> Já iniciou? Fechar janela
                </button>
            )}
          </div>
        </div>
      )}

      {/* Fundo Decorativo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 flex-grow pt-8">
        
        {/* Navbar */}
        <nav className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Globe className="text-blue-500" /> UniversalSaver
          </div>
          <div className={`text-xs px-3 py-1 rounded-full border transition-colors duration-300 ${serverStatus === 'ready' ? 'text-green-400 border-green-800 bg-green-900/20' : 'text-yellow-400 border-yellow-800 bg-yellow-900/20'}`}>
            {serverStatus === 'ready' ? 'Servidor Online' : 'A Iniciar...'}
          </div>
        </nav>

        {/* Texto Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            Baixe vídeos facilmente
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            YouTube, PandaVideo, Vimeo e muito mais. Cole o link e baixe sem complicações.
          </p>
        </div>

        {/* Barra de Busca */}
        <div className="max-w-3xl mx-auto bg-slate-800/50 p-2 rounded-2xl mb-12 backdrop-blur-sm border border-slate-700 shadow-xl">
          <form onSubmit={handleAnalyze} className="flex gap-2 flex-col sm:flex-row">
            <input 
              type="text" 
              className="flex-grow bg-transparent px-4 py-3 outline-none text-white placeholder-slate-500"
              placeholder="Cole o link do vídeo aqui..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button 
              disabled={loading || !url || serverStatus !== 'ready'} 
              className="px-6 py-3 bg-blue-600 rounded-xl font-bold hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[140px]"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                <>
                  <span>Analisar</span>
                  <Search className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
          {serverStatus !== 'ready' && (
             <p className="text-center text-xs text-yellow-500 mt-2 animate-pulse">Aguarde, o servidor gratuito está a acordar...</p>
          )}
        </div>

        {/* Erros */}
        {error && (
          <div className="max-w-3xl mx-auto mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 animate-fadeIn">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Resultados */}
        {videoData && (
          <div className="max-w-4xl mx-auto bg-slate-800/50 rounded-3xl p-6 md:p-8 border border-slate-700 animate-fadeIn shadow-2xl mb-12">
            <div className="flex flex-col md:flex-row gap-8 items-start mb-8 border-b border-slate-700 pb-8">
              <div className="w-full md:w-64 flex-shrink-0 rounded-xl overflow-hidden shadow-lg aspect-video bg-black flex items-center justify-center">
                {videoData.thumbnail ? (
                    <img src={videoData.thumbnail} className="w-full h-full object-cover" alt="Thumb" />
                ) : (
                    <Video className="w-12 h-12 text-slate-600" />
                )}
              </div>
              <div className="flex-grow">
                <h3 className="text-2xl font-bold mb-2 line-clamp-2">{videoData.title || "Vídeo Encontrado"}</h3>
                <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1"><Video className="w-4 h-4 text-blue-400"/> {videoData.author || "Desconhecido"}</span>
                    <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-emerald-400"/> {videoData.duration || "N/A"}</span>
                </div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Opções de Vídeo */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-2"><Video className="w-4 h-4" /> Vídeo</h4>
                {videoData.qualities?.map(q => (
                    <button key={q.id} onClick={() => handleDownload(q.id)} className="w-full flex justify-between items-center p-4 bg-slate-700/50 rounded-xl hover:bg-slate-700 border border-slate-600 hover:border-blue-500/50 transition-all group">
                        <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${q.id === 'best' ? 'bg-blue-500 text-white' : 'bg-slate-600 text-slate-300'}`}>
                                {q.id === 'best' ? 'HD' : 'SD'}
                            </span>
                            <span className="font-medium text-slate-200">{q.label}</span>
                        </div>
                        <Download className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-colors" />
                    </button>
                ))}
                {(!videoData.qualities || videoData.qualities.length === 0) && (
                    <button onClick={() => handleDownload('best')} className="w-full flex justify-between items-center p-4 bg-slate-700/50 rounded-xl hover:bg-slate-700 border border-slate-600 hover:border-blue-500/50 transition-all group">
                        <span className="font-medium text-slate-200">Melhor Qualidade</span>
                        <Download className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-colors" />
                    </button>
                )}
              </div>

              {/* Opções de Áudio */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-2"><Music className="w-4 h-4" /> Áudio</h4>
                <button onClick={() => handleDownload('audio')} className="w-full flex justify-between items-center p-4 bg-emerald-900/10 text-emerald-100 border border-emerald-500/30 rounded-xl hover:bg-emerald-900/20 transition-all group">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/20"><Music className="w-5 h-5 text-emerald-400" /></div>
                        <div className="text-left">
                            <span className="block font-medium">Extrair Áudio</span>
                            <span className="block text-xs text-emerald-500/60">Converter para MP3</span>
                        </div>
                    </div>
                    <Download className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer 2025 */}
      <footer className="w-full border-t border-slate-800 bg-slate-900/80 backdrop-blur-md mt-auto py-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
                <p className="text-slate-400 text-sm">
                    Desenvolvido por <span className="text-white font-semibold">Vinicius de Paiva</span>
                </p>
                <p className="text-slate-600 text-xs mt-1">© 2025 UniversalSaver Project</p>
            </div>
            <div className="flex gap-4">
                <a 
                    href="https://www.linkedin.com/in/viniciusdepaivamarti/" 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-2 bg-slate-800 rounded-full hover:bg-blue-600 text-slate-400 hover:text-white transition-all duration-300 hover:-translate-y-1"
                    title="LinkedIn"
                >
                    <Linkedin className="w-5 h-5" />
                </a>
                <a 
                    href="https://www.instagram.com/viniciusdpaiva_/" 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-2 bg-slate-800 rounded-full hover:bg-pink-600 text-slate-400 hover:text-white transition-all duration-300 hover:-translate-y-1"
                    title="Instagram"
                >
                    <Instagram className="w-5 h-5" />
                </a>
            </div>
        </div>
      </footer>
      
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
}
