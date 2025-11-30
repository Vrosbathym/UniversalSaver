import React, { useState, useEffect } from 'react';
import { Youtube, Search, Download, Music, Video, Check, AlertCircle, Loader2, Zap, ShieldCheck, Globe, Linkedin, Instagram } from 'lucide-react';

export default function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [videoData, setVideoData] = useState(null);
  const [serverStatus, setServerStatus] = useState('sleeping'); // 'sleeping', 'waking', 'ready'
  
  // URL do seu servidor no Render
  const API_BASE_URL = "https://youtube-downloader-d535.onrender.com";

  // NOVO: Acordar o servidor assim que o site abre
  useEffect(() => {
    const wakeUpServer = async () => {
      setServerStatus('waking');
      try {
        // Manda um pedido simples apenas para acordar a máquina
        await fetch(`${API_BASE_URL}/`); 
        setServerStatus('ready');
        console.log("Servidor acordado e pronto!");
      } catch (e) {
        console.log("Tentando acordar servidor...");
        // Tenta de novo em 5 segundos se falhar
        setTimeout(wakeUpServer, 5000);
      }
    };

    wakeUpServer();
  }, []);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setError('');
    setVideoData(null);

    // VALIDAÇÃO UNIVERSAL (Aceita qualquer link HTTP/HTTPS)
    const urlRegex = /^(https?:\/\/[^\s]+)/;
    if (!urlRegex.test(url)) {
      setError('Por favor, insira uma URL válida (começando com http ou https).');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url })
      });

      if (!response.ok) {
        throw new Error('O servidor está acordando ou o link não é suportado. Tente novamente.');
      }

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
    const downloadUrl = `${API_BASE_URL}/api/download?url=${encodeURIComponent(url)}&quality=${qualityId}`;
    window.location.href = downloadUrl;
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 text-white selection:bg-rose-500 selection:text-white flex flex-col font-sans">
      
      {/* Background Decorativo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 flex-grow">
        
        {/* Navbar */}
        <nav className="flex items-center justify-between py-6 mb-12">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-2 rounded-xl shadow-lg shadow-blue-500/20">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Universal<span className="text-blue-500">Saver</span></span>
          </div>
          
          {/* Status do Servidor Atualizado */}
          <div className={`flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full border transition-colors duration-500 ${
            serverStatus === 'ready' 
              ? 'text-green-400 bg-green-900/20 border-green-800' 
              : 'text-yellow-400 bg-yellow-900/20 border-yellow-800'
          }`}>
            <div className={`w-2 h-2 rounded-full ${serverStatus === 'ready' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></div>
            {serverStatus === 'ready' ? 'Servidor Online' : 'Iniciando Servidor...'}
          </div>
        </nav>

        {/* Hero Section */}
        <div className="text-center mb-12 space-y-6">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
            Baixe vídeos de <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
              qualquer lugar.
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
            YouTube, PandaVideo, Vimeo e muito mais. Cole o link e baixe sem complicações.
          </p>
        </div>

        {/* Card de Busca */}
        <div className="max-w-3xl mx-auto bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-2 rounded-2xl shadow-2xl mb-12 transform transition-all hover:scale-[1.01]">
          <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-grow group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="text"
                className="block w-full pl-12 pr-4 py-4 bg-transparent text-white placeholder-slate-500 focus:outline-none rounded-xl font-medium"
                placeholder="Cole o link do vídeo aqui..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !url || serverStatus !== 'ready'} 
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[160px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analisando</span>
                </>
              ) : (
                <>
                  <span>Baixar</span>
                  <Zap className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
          {serverStatus !== 'ready' && (
             <p className="text-center text-xs text-yellow-500 mt-2 animate-pulse">Aguarde, o servidor gratuito está acordando...</p>
          )}
        </div>

        {/* Mensagem de Erro */}
        {error && (
          <div className="max-w-3xl mx-auto mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 animate-fadeIn">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Área de Resultados */}
        {videoData && (
          <div className="max-w-4xl mx-auto animate-slideUp mb-12">
            <div className="bg-slate-800/50 backdrop-blur-md rounded-3xl overflow-hidden border border-slate-700/50 shadow-2xl">
              
              <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start border-b border-slate-700/50">
                <div className="w-full md:w-64 flex-shrink-0 rounded-xl overflow-hidden shadow-lg relative aspect-video group bg-black">
                  {videoData.thumbnail ? (
                    <img src={videoData.thumbnail} alt="Thumbnail" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-600">
                      <Video className="w-12 h-12" />
                    </div>
                  )}
                </div>
                <div className="flex-grow space-y-3">
                  <h3 className="text-2xl font-bold text-white leading-snug">{videoData.title || "Vídeo Detectado"}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1.5 bg-slate-900/50 px-3 py-1 rounded-lg">
                      <Video className="w-4 h-4 text-blue-500" /> {videoData.author || "Desconhecido"}
                    </span>
                    <span className="flex items-center gap-1.5 bg-slate-900/50 px-3 py-1 rounded-lg">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" /> {videoData.duration || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8 bg-slate-900/30">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-blue-400 font-bold text-sm tracking-wider uppercase mb-2">
                      <Video className="w-4 h-4" /> Downloads de Vídeo
                    </div>
                    {videoData.qualities ? (
                        videoData.qualities.map((quality) => (
                        <button
                            key={quality.id}
                            onClick={() => handleDownload(quality.id)}
                            className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-blue-500/50 transition-all group shadow-sm hover:shadow-blue-900/10"
                        >
                            <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${quality.id === 'best' ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                                {quality.id === 'best' ? 'HD' : (quality.id === 'worst' ? 'SD' : 'Auto')}
                            </div>
                            <span className="font-semibold text-slate-200">{quality.label}</span>
                            </div>
                            <Download className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-colors" />
                        </button>
                        ))
                    ) : (
                        <button
                            onClick={() => handleDownload('best')}
                            className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-blue-500/50 transition-all group"
                        >
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center font-bold text-sm text-white">HD</div>
                                <span className="font-semibold text-slate-200">Melhor Qualidade</span>
                             </div>
                             <Download className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-colors" />
                        </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm tracking-wider uppercase mb-2">
                      <Music className="w-4 h-4" /> Somente Áudio
                    </div>
                    <button
                      onClick={() => handleDownload('audio')}
                      className="w-full flex items-center justify-between p-4 rounded-xl bg-emerald-900/10 hover:bg-emerald-900/20 border border-emerald-500/30 hover:border-emerald-500/60 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                          <Music className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-emerald-100">Extrair Áudio</div>
                          <div className="text-xs text-emerald-500/60">Converter para MP3</div>
                        </div>
                      </div>
                      <Download className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}

      </div>
      
      {/* Footer com Assinatura */}
      <footer className="w-full border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm mt-auto">
        <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
            
            <div className="text-center md:text-left">
                <p className="text-slate-400 text-sm">
                    Desenvolvido por <span className="text-white font-semibold">Vinicius de Paiva</span>
                </p>
                <p className="text-slate-600 text-xs mt-1">© 2025 UniversalSaver Project</p>
            </div>

            <div className="flex items-center gap-4">
                <a 
                    href="https://www.linkedin.com/in/viniciusdepaivamarti/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 bg-slate-800 rounded-full hover:bg-blue-600 text-slate-400 hover:text-white transition-all duration-300 hover:-translate-y-1"
                    title="LinkedIn"
                >
                    <Linkedin className="w-5 h-5" />
                </a>
                <a 
                    href="https://www.instagram.com/viniciusdpaiva_/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 bg-slate-800 rounded-full hover:bg-pink-600 text-slate-400 hover:text-white transition-all duration-300 hover:-translate-y-1"
                    title="Instagram"
                >
                    <Instagram className="w-5 h-5" />
                </a>
            </div>
        </div>
      </footer>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
        .animate-slideUp { animation: slideUp 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
}