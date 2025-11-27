import React, { useEffect, useRef } from 'react';
import { SlideData } from '../types';
import { Edit3, RefreshCw, Wand2, MonitorPlay } from 'lucide-react';

interface SlideEditorProps {
  slide: SlideData;
  totalSlides: number;
  currentSlideIndex: number;
  onScriptChange: (id: number, newScript: string) => void;
  onRegenerate: (id: number) => void;
}

export const SlideEditor: React.FC<SlideEditorProps> = ({
  slide,
  totalSlides,
  currentSlideIndex,
  onScriptChange,
  onRegenerate
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [slide.generatedScript, slide.id]);

  return (
    <div className="flex flex-col h-full bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden backdrop-blur-sm">
      
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
            SLIDE {currentSlideIndex + 1} / {totalSlides}
          </div>
          <h2 className="text-white font-medium">Speaker Notes Editor</h2>
        </div>
        
        <div className="flex gap-2">
           <button 
            onClick={() => onRegenerate(slide.id)}
            disabled={slide.isGenerating}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors
              ${slide.isGenerating 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                : 'bg-slate-800 hover:bg-slate-700 text-blue-400'
              }
            `}
          >
            {slide.isGenerating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4" />
            )}
            <span>Regenerate AI</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Column: Source Content (ReadOnly) */}
        <div className="w-1/3 border-r border-slate-800 p-6 overflow-y-auto bg-slate-900/30">
          <div className="flex items-center gap-2 mb-4 text-slate-400 uppercase text-xs font-bold tracking-wider">
            <MonitorPlay className="w-4 h-4" />
            <span>Extracted Content</span>
          </div>
          
          <div className="space-y-3">
            {slide.originalText.length === 0 ? (
               <p className="text-slate-600 italic text-sm">No text detected on this slide.</p>
            ) : (
              slide.originalText.map((text, idx) => (
                <div key={idx} className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                  <p className="text-slate-300 text-sm leading-relaxed">{text}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Script Editor */}
        <div className="w-2/3 p-6 overflow-y-auto bg-slate-900/10 relative">
          <div className="flex items-center gap-2 mb-4 text-slate-400 uppercase text-xs font-bold tracking-wider">
            <Edit3 className="w-4 h-4" />
            <span>Script</span>
          </div>

          <div className="relative">
            {slide.isGenerating && (
              <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] z-10 flex items-center justify-center">
                 <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-blue-400 text-sm animate-pulse">Writing script...</span>
                 </div>
              </div>
            )}
            
            <textarea
              ref={textareaRef}
              value={slide.generatedScript}
              onChange={(e) => onScriptChange(slide.id, e.target.value)}
              placeholder="Waiting for AI generation..."
              className="w-full bg-transparent text-lg leading-8 text-white placeholder-slate-600 focus:outline-none resize-none min-h-[400px]"
              spellCheck={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};