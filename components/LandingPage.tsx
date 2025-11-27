import React, { useEffect, useState } from 'react';
import { ArrowRight, Eye, Mic2, FileDown, Sparkles } from 'lucide-react';
import { UILanguage } from '../types';
import { TRANSLATIONS } from '../utils/translations';

interface LandingPageProps {
  onStart: () => void;
  uiLanguage: UILanguage;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, uiLanguage }) => {
  const t = TRANSLATIONS[uiLanguage].landing;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col relative overflow-hidden">
      
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[100px]" />
      </div>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-6 flex flex-col justify-center relative z-10">
        
        {/* Hero Section */}
        <div className={`flex flex-col md:flex-row items-center gap-12 md:gap-20 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          
          {/* Text Content */}
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-6">
              <Sparkles className="w-3 h-3" />
              <span>Powered by Gemini 2.5</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
              {t.heroTitle} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400">
                {t.heroTitleGradient}
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto md:mx-0">
              {t.heroDesc}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button 
                onClick={onStart}
                className="group relative px-8 py-4 bg-white text-slate-900 rounded-xl font-bold text-lg shadow-xl shadow-blue-900/20 hover:shadow-2xl hover:shadow-blue-500/30 transition-all hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center gap-2">
                  {t.startBtn}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          </div>

          {/* Visual Content - Floating Card Effect */}
          <div className="flex-1 w-full max-w-lg relative group perspective-1000">
             <div className="relative transform group-hover:rotate-y-12 transition-transform duration-700 ease-out preserve-3d">
                
                {/* Main Card */}
                <div className="relative z-20 rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
                   {/* Placeholder for AI generated "presentation" image - using Unsplash for demo */}
                   <img 
                      src="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=2674" 
                      alt="Presentation Tech" 
                      className="w-full h-auto object-cover opacity-80"
                   />
                   
                   {/* Overlay UI Elements */}
                   <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-900 to-transparent">
                      <div className="flex items-center gap-3 mb-2">
                         <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                            <Mic2 className="w-4 h-4 text-white" />
                         </div>
                         <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full w-2/3 bg-blue-500 animate-pulse" />
                         </div>
                      </div>
                      <div className="space-y-2">
                         <div className="h-2 w-3/4 bg-slate-700 rounded-full" />
                         <div className="h-2 w-1/2 bg-slate-700 rounded-full" />
                      </div>
                   </div>
                </div>

                {/* Floating Elements (Decorations) */}
                <div className="absolute -top-10 -right-10 z-10 w-24 h-24 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg animate-bounce delay-700">
                    <Eye className="w-10 h-10 text-white" />
                </div>
                
                <div className="absolute -bottom-5 -left-5 z-30 px-4 py-2 bg-slate-800 rounded-lg border border-slate-700 shadow-xl flex items-center gap-2 animate-bounce delay-1000">
                    <FileDown className="w-4 h-4 text-green-400" />
                    <span className="text-xs font-mono text-green-400">.pptx exported</span>
                </div>
             </div>
          </div>

        </div>

        {/* Feature Grid */}
        <div className={`mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-1000 delay-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
           
           <div className="p-8 rounded-3xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50 transition-colors group cursor-default">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                 <Eye className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{t.features.visual.title}</h3>
              <p className="text-slate-400 leading-relaxed">{t.features.visual.desc}</p>
           </div>

           <div className="p-8 rounded-3xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50 transition-colors group cursor-default">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                 <Mic2 className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{t.features.style.title}</h3>
              <p className="text-slate-400 leading-relaxed">{t.features.style.desc}</p>
           </div>

           <div className="p-8 rounded-3xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50 transition-colors group cursor-default">
              <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                 <FileDown className="w-7 h-7 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{t.features.export.title}</h3>
              <p className="text-slate-400 leading-relaxed">{t.features.export.desc}</p>
           </div>

        </div>
      </div>

    </div>
  );
};