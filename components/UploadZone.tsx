import React, { useCallback, useState } from 'react';
import { UploadCloud, FileType, AlertCircle, Globe, Mic2, Sparkles, Settings2 } from 'lucide-react';
import { TargetLanguage, ScriptStyle } from '../types';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  selectedLanguage: TargetLanguage;
  onLanguageChange: (lang: TargetLanguage) => void;
  selectedStyle: ScriptStyle;
  onStyleChange: (style: ScriptStyle) => void;
  customPrompt: string;
  onCustomPromptChange: (text: string) => void;
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

const STYLES: { value: ScriptStyle; label: string; desc: string }[] = [
  { value: 'Professional', label: 'Professional', desc: 'Formal, concise, corporate tone' },
  { value: 'Conversational', label: 'Conversational', desc: 'Relaxed, engaging, spoken-word style' },
  { value: 'Academic', label: 'Academic', desc: 'Detailed, educational, formal vocabulary' },
  { value: 'Enthusiastic', label: 'Enthusiastic', desc: 'High energy, motivational, persuasive' },
  { value: 'Humorous', label: 'Humorous', desc: 'Light-hearted, witty, occasional jokes' },
  { value: 'Custom', label: 'Custom', desc: 'Define your own specific requirements' },
];

export const UploadZone: React.FC<UploadZoneProps> = ({ 
  onFileSelect, 
  selectedLanguage, 
  onLanguageChange,
  selectedStyle,
  onStyleChange,
  customPrompt,
  onCustomPromptChange
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = (file: File) => {
    if (!file.name.endsWith('.pptx')) {
      setError("Please upload a .pptx file.");
      return;
    }
    setError(null);
    onFileSelect(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-4xl mx-auto px-4 py-8">
      
      {/* Configuration Panel */}
      <div className="w-full max-w-2xl bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800 p-6 mb-8 shadow-xl">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
          <Settings2 className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">Generation Settings</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Language Selector */}
          <div className="space-y-2">
            <label className="text-sm text-slate-400 font-medium flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Target Language
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
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          {/* Style Selector */}
          <div className="space-y-2">
            <label className="text-sm text-slate-400 font-medium flex items-center gap-2">
              <Mic2 className="w-4 h-4" />
              Speaking Style
            </label>
            <div className="relative w-full">
              <select 
                value={selectedStyle}
                onChange={(e) => onStyleChange(e.target.value as ScriptStyle)}
                className="w-full appearance-none bg-slate-800 border border-slate-700 hover:border-blue-500 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
              >
                {STYLES.map(style => (
                  <option key={style.value} value={style.value}>
                    {style.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Style Description / Hint */}
        <div className="mt-3 text-xs text-slate-500 flex items-center justify-between">
           <span>{STYLES.find(s => s.value === selectedStyle)?.desc}</span>
           {selectedStyle === 'Custom' && (
             <span className="text-blue-400 font-medium">Advanced</span>
           )}
        </div>

        {/* Custom Prompt Input */}
        <div className={`
          overflow-hidden transition-all duration-300 ease-in-out mt-4
          ${selectedStyle === 'Custom' ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}
        `}>
          <label className="text-sm text-slate-400 font-medium flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            Custom Instructions
          </label>
          <textarea 
            value={customPrompt}
            onChange={(e) => onCustomPromptChange(e.target.value)}
            placeholder="e.g., 'Make it sound like a Steve Jobs keynote', 'Focus heavily on the financial data', 'Use simple metaphors for complex terms'"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm h-24 resize-none"
          />
        </div>
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative w-full max-w-2xl p-10 rounded-3xl border-2 border-dashed transition-all duration-300
          flex flex-col items-center justify-center cursor-pointer group bg-slate-900/50
          ${isDragging 
            ? 'border-blue-500 bg-blue-500/10 scale-[1.02]' 
            : 'border-slate-700 hover:border-blue-400/50 hover:bg-slate-800/50'
          }
        `}
      >
        <input
          type="file"
          accept=".pptx"
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className={`
          p-5 rounded-full bg-slate-800 mb-4 transition-transform duration-300 shadow-xl
          ${isDragging ? 'scale-110' : 'group-hover:scale-110'}
        `}>
          <UploadCloud className="w-10 h-10 text-blue-400" />
        </div>

        <h3 className="text-xl font-semibold text-white mb-2">
          Select PowerPoint File
        </h3>
        <p className="text-slate-400 mb-4 text-center max-w-sm text-sm">
          Drag & drop or click to upload.
        </p>

        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-800">
          <FileType className="w-3 h-3" />
          <span>.pptx supported</span>
        </div>

        {error && (
          <div className="absolute -bottom-14 flex items-center gap-2 text-red-400 bg-red-900/20 px-4 py-2 rounded-lg border border-red-900/50 animate-bounce">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};
