import React, { useCallback, useState } from 'react';
import { UploadCloud, AlertCircle, Globe, Mic2, Sparkles, Settings2, ScanText, Eye, CheckCircle2, FileText, Presentation, Timer } from 'lucide-react';
import { TargetLanguage, ScriptStyle, ProcessingMode, UILanguage } from '../types';
import { TRANSLATIONS } from '../utils/translations';

interface UploadZoneProps {
  onFilesSelect: (pptxFile: File, pdfFile?: File) => void;
  selectedLanguage: TargetLanguage;
  onLanguageChange: (lang: TargetLanguage) => void;
  selectedStyle: ScriptStyle;
  onStyleChange: (style: ScriptStyle) => void;
  customPrompt: string;
  onCustomPromptChange: (text: string) => void;
  processingMode: ProcessingMode;
  onProcessingModeChange: (mode: ProcessingMode) => void;
  visionDelay: number;
  onVisionDelayChange: (seconds: number) => void;
  uiLanguage: UILanguage;
}

const LANGUAGES: TargetLanguage[] = [
  'English',
  'Chinese',
  'Spanish',
  'French',
  'German',
  'Japanese',
  'Korean'
];

const STYLE_OPTIONS = [
    'Professional', 'Conversational', 'Academic', 'Enthusiastic', 'Humorous', 'Custom'
] as const;

export const UploadZone: React.FC<UploadZoneProps> = ({ 
  onFilesSelect, 
  selectedLanguage, 
  onLanguageChange,
  selectedStyle,
  onStyleChange,
  customPrompt,
  onCustomPromptChange,
  processingMode,
  onProcessingModeChange,
  visionDelay,
  onVisionDelayChange,
  uiLanguage
}) => {
  const [pptxFile, setPptxFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const t = TRANSLATIONS[uiLanguage].uploadZone;

  // --- Handlers for Text Mode (Single PPTX) ---
  const handlePptxDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (!file.name.endsWith('.pptx')) {
        setError(t.errorPPTX);
        return;
      }
      setError(null);
      
      if (processingMode === 'Text') {
        onFilesSelect(file);
      } else {
        setPptxFile(file);
      }
    }
  }, [processingMode, onFilesSelect, t]);

  const handlePptxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.name.endsWith('.pptx')) {
        setError(t.errorPPTX);
        return;
      }
      setError(null);

      if (processingMode === 'Text') {
        onFilesSelect(file);
      } else {
        setPptxFile(file);
      }
    }
  };

  // --- Handlers for Vision Mode (PDF) ---
  const handlePdfDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setError(t.errorPDF);
        return;
      }
      setError(null);
      setPdfFile(file);
    }
  }, [t]);

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setError(t.errorPDF);
        return;
      }
      setError(null);
      setPdfFile(file);
    }
  };

  const handleStartVisionAnalysis = () => {
    if (!pptxFile || !pdfFile) {
      setError(t.errorBoth);
      return;
    }
    onFilesSelect(pptxFile, pdfFile);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-4xl mx-auto px-4 py-8">
      
      {/* Configuration Panel */}
      <div className="w-full max-w-2xl bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800 p-6 mb-8 shadow-xl">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
          <Settings2 className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">{t.settingsTitle}</h2>
        </div>

        {/* Processing Mode Switch */}
        <div className="mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
           <label className="text-sm text-slate-400 font-medium mb-3 block">{t.analysisMode}</label>
           <div className="flex gap-4">
              <button 
                onClick={() => {
                  onProcessingModeChange('Text');
                  setPptxFile(null);
                  setPdfFile(null);
                  setError(null);
                }}
                className={`flex-1 py-3 px-4 rounded-lg border transition-all flex items-center justify-center gap-2
                  ${processingMode === 'Text' 
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20' 
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                  }`}
              >
                 <ScanText className="w-4 h-4" />
                 <div className="text-left">
                    <div className="text-sm font-semibold">{t.modeText}</div>
                 </div>
              </button>

              <button 
                onClick={() => {
                  onProcessingModeChange('Vision');
                  setPptxFile(null);
                  setPdfFile(null);
                  setError(null);
                }}
                className={`flex-1 py-3 px-4 rounded-lg border transition-all flex items-center justify-center gap-2
                  ${processingMode === 'Vision' 
                    ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/20' 
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                  }`}
              >
                 <Eye className="w-4 h-4" />
                 <div className="text-left">
                    <div className="text-sm font-semibold">{t.modeVision}</div>
                 </div>
              </button>
           </div>
           
           {/* Vision Mode Specific Settings */}
           {processingMode === 'Vision' && (
             <div className="mt-4 pt-4 border-t border-slate-700/50">
                <label className="text-xs text-slate-400 font-medium flex items-center gap-2 mb-2">
                   <Timer className="w-3 h-3 text-purple-400" />
                   {t.visionDelay}
                </label>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={visionDelay} 
                    onChange={(e) => onVisionDelayChange(Number(e.target.value))}
                    className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <span className="text-sm font-mono text-purple-300 w-12 text-right">{visionDelay}s</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">{t.visionHint}</p>
             </div>
           )}

           <p className="text-xs text-slate-500 mt-2 ml-1">
             {processingMode === 'Text' ? t.modeDescText : t.modeDescVision}
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Language Selector */}
          <div className="space-y-2">
            <label className="text-sm text-slate-400 font-medium flex items-center gap-2">
              <Globe className="w-4 h-4" />
              {t.targetLang}
            </label>
            <div className="relative w-full">
              <select 
                value={selectedLanguage}
                onChange={(e) => onLanguageChange(e.target.value as TargetLanguage)}
                className="w-full appearance-none bg-slate-800 border border-slate-700 hover:border-blue-500 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Style Selector */}
          <div className="space-y-2">
            <label className="text-sm text-slate-400 font-medium flex items-center gap-2">
              <Mic2 className="w-4 h-4" />
              {t.style}
            </label>
            <div className="relative w-full">
              <select 
                value={selectedStyle}
                onChange={(e) => onStyleChange(e.target.value as ScriptStyle)}
                className="w-full appearance-none bg-slate-800 border border-slate-700 hover:border-blue-500 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
              >
                {STYLE_OPTIONS.map(style => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Style Hint */}
        <div className="mt-3 text-xs text-slate-500 flex items-center justify-between">
           <span>{t.styleDesc[selectedStyle]}</span>
           {selectedStyle === 'Custom' && (
             <span className="text-blue-400 font-medium">{t.advanced}</span>
           )}
        </div>

        {/* Custom Prompt */}
        <div className={`
          overflow-hidden transition-all duration-300 ease-in-out mt-4
          ${selectedStyle === 'Custom' ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}
        `}>
          <label className="text-sm text-slate-400 font-medium flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            {t.customInst}
          </label>
          <textarea 
            value={customPrompt}
            onChange={(e) => onCustomPromptChange(e.target.value)}
            placeholder={t.customPlaceholder}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm h-24 resize-none"
          />
        </div>
      </div>

      {/* Upload Areas */}
      {processingMode === 'Text' ? (
        /* Standard Text Mode Dropzone */
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handlePptxDrop}
          className="relative w-full max-w-2xl p-10 rounded-3xl border-2 border-dashed border-slate-700 hover:border-blue-400/50 hover:bg-slate-800/50 transition-all flex flex-col items-center justify-center cursor-pointer group bg-slate-900/50"
        >
          <input type="file" accept=".pptx" onChange={handlePptxChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          <div className="p-5 rounded-full bg-slate-800 mb-4 group-hover:scale-110 transition-transform shadow-xl">
            <UploadCloud className="w-10 h-10 text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">{t.dropPPTX}</h3>
          <p className="text-slate-400 text-sm">{t.dropHint}</p>
        </div>
      ) : (
        /* Vision Mode Dual Upload */
        <div className="w-full max-w-2xl space-y-4">
          
          {/* Step 1: PPTX */}
          <div 
             className={`relative p-6 rounded-2xl border-2 border-dashed transition-all flex items-center justify-between
               ${pptxFile 
                 ? 'border-green-500/50 bg-green-500/10' 
                 : 'border-slate-700 bg-slate-900/50 hover:bg-slate-800/50'
               }`}
          >
             <input type="file" accept=".pptx" onChange={handlePptxChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
             <div className="flex items-center gap-4">
               <div className={`w-10 h-10 rounded-full flex items-center justify-center ${pptxFile ? 'bg-green-500' : 'bg-slate-700'}`}>
                  {pptxFile ? <CheckCircle2 className="w-6 h-6 text-white" /> : <Presentation className="w-5 h-5 text-slate-400" />}
               </div>
               <div>
                 <h4 className="text-white font-medium">{t.step1}</h4>
                 <p className="text-xs text-slate-400">{pptxFile ? pptxFile.name : t.step1Desc}</p>
               </div>
             </div>
             {pptxFile && <button className="text-xs text-green-400 font-medium z-20" onClick={(e) => {e.stopPropagation(); setPptxFile(null);}}>{t.change}</button>}
          </div>

          {/* Step 2: PDF */}
          <div 
             className={`relative p-6 rounded-2xl border-2 border-dashed transition-all flex items-center justify-between
               ${pdfFile 
                 ? 'border-purple-500/50 bg-purple-500/10' 
                 : 'border-slate-700 bg-slate-900/50 hover:bg-slate-800/50'
               }`}
          >
             <input type="file" accept=".pdf" onChange={handlePdfChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
             <div className="flex items-center gap-4">
               <div className={`w-10 h-10 rounded-full flex items-center justify-center ${pdfFile ? 'bg-purple-500' : 'bg-slate-700'}`}>
                  {pdfFile ? <CheckCircle2 className="w-6 h-6 text-white" /> : <FileText className="w-5 h-5 text-slate-400" />}
               </div>
               <div>
                 <h4 className="text-white font-medium">{t.step2}</h4>
                 <p className="text-xs text-slate-400">{pdfFile ? pdfFile.name : t.step2Desc}</p>
               </div>
             </div>
             {pdfFile && <button className="text-xs text-purple-400 font-medium z-20" onClick={(e) => {e.stopPropagation(); setPdfFile(null);}}>{t.change}</button>}
          </div>

          {/* Action Button */}
          <button
             onClick={handleStartVisionAnalysis}
             disabled={!pptxFile || !pdfFile}
             className={`
               w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2
               ${pptxFile && pdfFile 
                 ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:scale-[1.02] shadow-purple-900/30' 
                 : 'bg-slate-800 text-slate-500 cursor-not-allowed'
               }
             `}
          >
            <Sparkles className="w-5 h-5" />
            {t.startVision}
          </button>
        </div>
      )}

      {error && (
        <div className="mt-6 flex items-center gap-2 text-red-400 bg-red-900/20 px-4 py-2 rounded-lg border border-red-900/50 animate-bounce">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};