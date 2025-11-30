import React, { useState, useEffect } from 'react';
import { Youtube, Search, Download, Music, Video, Check, AlertCircle, Loader2, Zap, ShieldCheck, Globe, Linkedin, Instagram } from 'lucide-react';

export default function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [videoData, setVideoData] = useState(null);
  const [serverStatus, setServerStatus] = useState('sleeping');
  const [isDownloading, setIsDownloading] = useState(false); // Novo estado para download
  
  // URL do servidor
  const API_BASE_URL = "https://youtube-downloader-d535.onrender.com";

  useEffect(() => {
    const wakeUpServer = async () => {
      setServerStatus('waking');
      try {
        await fetch(`${API_BASE_URL}/`); 
        setServerStatus('ready');
      } catch (e) {
        setTimeout(wakeUpServer, 5000);
      }
    };
    wakeUpServer();
  }, []);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setError('');
    setVideoData(null);

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

      if (!response.ok) throw new Error('Erro ao conectar ao servidor.');

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
    setIsDownloading(true); // Inicia o estado de carregamento
    const downloadUrl = `${API_BASE_URL}/api/download?url=${encodeURIComponent(url)}&quality=${qualityId}`;
    
    // Pequeno truque: como o download é feito pelo navegador em outra aba/janela,
    // não temos como saber exatamente quando termina via JS simples.
    // Vamos mostrar o loading por 5 segundos para dar feedback inicial.
    window.location.href = downloadUrl;
    
    setTimeout(() => {
      setIsDownloading(false);
    }, 8000); 
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 text-white font-sans flex flex-col relative">
      
      {/* Overlay de Download (Aparece quando está baixando) */}
      {isDownloading && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center animate-fadeIn">
          <div className="bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-700 text-center max-w-sm mx-4">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
              <Download className="absolute inset-0 m-auto w-8 h-8 text-blue-400 animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Processando...</h3>
            <p className="text-slate-400 text-sm">O seu download começará em instantes. Por favor, aguarde o servidor preparar o arquivo.</p>
          </div>
        </div>
      )}

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 flex-grow pt-8">
        <nav className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Globe className="text-blue-500" /> UniversalSaver
          </div>
          <div className={`text-xs px-3 py-1 rounded-full border ${serverStatus === 'ready' ? 'text-green-400 border-green-800' : 'text-yellow-400 border-yellow-800'}`}>
            {serverStatus === 'ready' ? 'Online' : 'Iniciando...'}
          </div>
        </nav>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">Baixe vídeos facilmente</h1>
        </div>

        <div className="max-w-3xl mx-auto bg-slate-800/50 p-2 rounded-2xl mb-12 backdrop-blur-sm border border-slate-700">
          <form onSubmit={handleAnalyze} className="flex gap-2">
            <input 
              type="text" 
              className="flex-grow bg-transparent px-4 outline-none text-white"
              placeholder="Cole o link aqui..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button disabled={loading} className="px-6 py-3 bg-blue-600 rounded-xl font-bold hover:bg-blue-500 transition-colors">
              {loading ? <Loader2 className="animate-spin" /> : 'Baixar'}
            </button>
          </form>
        </div>

        {error && <div className="text-red-400 text-center mb-8">{error}</div>}

        {videoData && (
          <div className="max-w-4xl mx-auto bg-slate-800/50 rounded-3xl p-8 border border-slate-700 animate-fadeIn">
            <div className="flex flex-col md:flex-row gap-8 items-center mb-8">
              <img src={videoData.thumbnail} className="w-64 rounded-xl shadow-lg" alt="Thumb" />
              <div>
                <h3 className="text-2xl font-bold">{videoData.title}</h3>
                <p className="text-slate-400">{videoData.author}</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {videoData.qualities?.map(q => (
                <button key={q.id} onClick={() => handleDownload(q.id)} className="flex justify-between p-4 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors">
                  <span>{q.label}</span> <Download className="w-5 h-5" />
                </button>
              ))}
              <button onClick={() => handleDownload('audio')} className="flex justify-between p-4 bg-emerald-900/30 text-emerald-400 border border-emerald-500/30 rounded-xl hover:bg-emerald-900/50 transition-colors">
                <span>Apenas Áudio (MP3)</span> <Music className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <footer className="w-full border-t border-slate-800 bg-slate-900/80 backdrop-blur-md mt-auto py-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
                <p className="text-slate-400 text-sm">Desenvolvido por <span className="text-white font-semibold">Vinicius de Paiva</span></p>
                <p className="text-slate-600 text-xs mt-1">© 2025 UniversalSaver Project</p>
            </div>
            <div className="flex gap-4">
                <a href="https://www.linkedin.com/in/viniciusdepaivamarti/" target="_blank" className="p-2 bg-slate-800 rounded-full hover:bg-blue-600 transition-colors"><Linkedin className="w-5 h-5" /></a>
                <a href="https://www.instagram.com/viniciusdpaiva_/" target="_blank" className="p-2 bg-slate-800 rounded-full hover:bg-pink-600 transition-colors"><Instagram className="w-5 h-5" /></a>
            </div>
        </div>
      </footer>
      
      {/* Estilos para animação simples */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
}
