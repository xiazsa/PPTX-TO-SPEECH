import React, { useState, useEffect } from 'react';
import { AppState, SlideData, TargetLanguage, ScriptStyle, ProcessingMode, UILanguage } from './types';
import { UploadZone } from './components/UploadZone';
import { SlideEditor } from './components/SlideEditor';
import { ApiKeyModal } from './components/ApiKeyModal';
import { parsePPTXFile, embedScriptsAndExportPPTX } from './utils/pptxHelper';
import { convertPdfToImages } from './utils/pdfHelper';
import { initializeGemini, generateSlideScript } from './services/geminiService';
import { TRANSLATIONS } from './utils/translations';
import { 
  FileText, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Bot,
  FileDown,
  Eye,
  ScanText,
  Languages
} from 'lucide-react';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  
  // Settings State
  const [uiLanguage, setUiLanguage] = useState<UILanguage>('Chinese');
  const [targetLanguage, setTargetLanguage] = useState<TargetLanguage>('Chinese');
  const [scriptStyle, setScriptStyle] = useState<ScriptStyle>('Professional');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [processingMode, setProcessingMode] = useState<ProcessingMode>('Text');
  const [visionDelay, setVisionDelay] = useState<number>(3); // Default 3s delay

  const t = TRANSLATIONS[uiLanguage];

  // Check for env key
  useEffect(() => {
    if (process.env.API_KEY) {
      setApiKey(process.env.API_KEY);
      initializeGemini(process.env.API_KEY);
    }
  }, []);

  const handleApiKeySubmit = (key: string) => {
    setApiKey(key);
    initializeGemini(key);
  };

  const handleFilesSelect = async (pptxFile: File, pdfFile?: File) => {
    try {
      setIsProcessing(true);
      setOriginalFile(pptxFile);
      setFileName(pptxFile.name);
      
      const extractedSlides = await parsePPTXFile(pptxFile, processingMode);
      
      let pdfImages: string[] = [];
      if (processingMode === 'Vision' && pdfFile) {
         try {
           pdfImages = await convertPdfToImages(pdfFile);
         } catch (e) {
           console.error("PDF Parsing failed:", e);
           alert("Failed to parse PDF file. Falling back to text-only mode.");
         }
      }

      const newSlides: SlideData[] = extractedSlides.map((slide, index) => {
        const visionImage = pdfImages[index] ? [pdfImages[index]] : [];
        const finalImages = visionImage.length > 0 ? visionImage : slide.images;

        return {
          id: index,
          originalText: slide.text,
          images: finalImages,
          generatedScript: "",
          isGenerating: false,
          status: 'pending'
        };
      });
      
      if (processingMode === 'Vision' && pdfImages.length !== extractedSlides.length) {
        console.warn(`Mismatch: PPT has ${extractedSlides.length} slides, PDF has ${pdfImages.length} pages.`);
      }

      setSlides(newSlides);
      setAppState(AppState.EDITOR);
      
      generateAllScripts(newSlides);

    } catch (error) {
      alert("Error processing files. Ensure they are valid.");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateAllScripts = async (currentSlides: SlideData[]) => {
    const queue = [...currentSlides];
    let previousScriptContext: string | null = null;

    for (let i = 0; i < queue.length; i++) {
      const slide = queue[i];
      const prevSlide = queue[i - 1]; // Can be undefined
      const nextSlide = queue[i + 1]; // Can be undefined

      setSlides(prev => prev.map(s => s.id === slide.id ? { ...s, isGenerating: true, status: 'generating' } : s));

      try {
        const script = await generateSlideScript(
          slide.id, 
          queue.length,
          slide.originalText,
          slide.images,
          prevSlide ? prevSlide.images : null, // Pass previous images
          nextSlide ? nextSlide.images : null, // Pass next images
          previousScriptContext, 
          nextSlide ? nextSlide.originalText : null, 
          targetLanguage,
          scriptStyle,
          customPrompt
        );
        
        setSlides(prev => prev.map(s => 
          s.id === slide.id 
            ? { ...s, generatedScript: script, isGenerating: false, status: 'completed' } 
            : s
        ));

        previousScriptContext = script;

      } catch (error) {
        const errMsg = error instanceof Error ? error.message : "Unknown error";
        setSlides(prev => prev.map(s => 
          s.id === slide.id 
            ? { ...s, generatedScript: `[Generation Error]: ${errMsg}\n\nPlease try regenerating.`, isGenerating: false, status: 'error' } 
            : s
        ));
        previousScriptContext = null; 
      }
      
      // Use user-defined delay for Vision mode, or fixed short delay for Text mode
      const delay = processingMode === 'Vision' ? (visionDelay * 1000) : 1000;
      await new Promise(r => setTimeout(r, delay));
    }
  };

  const handleRegenerate = async (id: number) => {
    const slideIndex = slides.findIndex(s => s.id === id);
    if (slideIndex === -1) return;

    const slide = slides[slideIndex];
    const previousSlide = slides[slideIndex - 1];
    const nextSlide = slides[slideIndex + 1];
    const previousScriptContext = previousSlide ? previousSlide.generatedScript : null;

    setSlides(prev => prev.map(s => s.id === id ? { ...s, isGenerating: true, status: 'generating' } : s));
    try {
      const script = await generateSlideScript(
        slide.id,
        slides.length,
        slide.originalText,
        slide.images,
        previousSlide ? previousSlide.images : null, // Context images
        nextSlide ? nextSlide.images : null,       // Context images
        previousScriptContext,
        nextSlide ? nextSlide.originalText : null,
        targetLanguage,
        scriptStyle,
        customPrompt
      );
      
      setSlides(prev => prev.map(s => s.id === id ? { ...s, generatedScript: script, isGenerating: false, status: 'completed' } : s));
    } catch (error) {
       const errMsg = error instanceof Error ? error.message : "Unknown error";
       setSlides(prev => prev.map(s => s.id === id ? { ...s, generatedScript: `[Error]: ${errMsg}`, isGenerating: false, status: 'error' } : s));
    }
  };

  const handleScriptChange = (id: number, newScript: string) => {
    setSlides(prev => prev.map(s => s.id === id ? { ...s, generatedScript: newScript } : s));
  };

  const exportPPTX = async () => {
    if (!originalFile) return;
    try {
      setIsExporting(true);
      const blob = await embedScriptsAndExportPPTX(originalFile, slides, targetLanguage);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Autoscript_${fileName}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert("Export failed. Please check console for details.");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const downloadTextScripts = () => {
    const content = slides.map(s => `
---
SLIDE ${s.id + 1}
---
[CONTENT]:
${s.originalText.join('\n')}

[SCRIPT (${targetLanguage})]:
${s.generatedScript}

`).join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scripts_${fileName.replace('.pptx', '')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleLanguage = () => {
    setUiLanguage(prev => prev === 'English' ? 'Chinese' : 'English');
  };

  if (!apiKey) {
    return <ApiKeyModal onSubmit={handleApiKeySubmit} uiLanguage={uiLanguage} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0f172a] text-slate-200">
      {/* Header */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-8 fixed w-full z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Bot className="text-white w-5 h-5" />
          </div>
          <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
            {t.appTitle}
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors border border-slate-700 text-sm font-medium"
          >
            <Languages className="w-4 h-4" />
            <span>{uiLanguage === 'English' ? '中文' : 'EN'}</span>
          </button>

          {appState === AppState.EDITOR && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500 font-medium hidden md:inline border-l border-slate-700 pl-4">{fileName}</span>
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
                  {processingMode === 'Vision' ? <Eye className="w-3 h-3 text-purple-400" /> : <ScanText className="w-3 h-3 text-blue-400" />}
                  <span className="text-xs text-slate-300">{processingMode} {t.header.mode}</span>
              </div>
              
              <div className="flex gap-2">
                  <button 
                    onClick={downloadTextScripts}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-all border border-slate-700"
                    title="Download raw text file"
                  >
                    <FileText className="w-4 h-4" />
                    <span className="hidden sm:inline">{t.header.textOnly}</span>
                  </button>

                  <button 
                    onClick={exportPPTX}
                    disabled={isExporting}
                    className="bg-green-600 hover:bg-green-500 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-green-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Download new PPTX with notes"
                  >
                    {isExporting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FileDown className="w-4 h-4" />}
                    <span>{t.header.exportPPTX}</span>
                  </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-20 px-6 pb-6 h-screen flex flex-col">
        {appState === AppState.UPLOAD ? (
          <div className="flex-1 flex flex-col items-center justify-center">
             {isProcessing ? (
               <div className="text-center space-y-4">
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <h3 className="text-xl font-medium text-white">{t.processing.analyzing}</h3>
                  <p className="text-slate-400">
                     {t.processing.extracting} ({processingMode === 'Vision' ? t.processing.rendering : t.processing.parsing})
                  </p>
               </div>
             ) : (
               <UploadZone 
                  onFilesSelect={handleFilesSelect} 
                  selectedLanguage={targetLanguage}
                  onLanguageChange={setTargetLanguage}
                  selectedStyle={scriptStyle}
                  onStyleChange={setScriptStyle}
                  customPrompt={customPrompt}
                  onCustomPromptChange={setCustomPrompt}
                  processingMode={processingMode}
                  onProcessingModeChange={setProcessingMode}
                  visionDelay={visionDelay}
                  onVisionDelayChange={setVisionDelay}
                  uiLanguage={uiLanguage}
               />
             )}
          </div>
        ) : (
          <div className="flex gap-6 h-full">
            {/* Sidebar: Slide List */}
            <div className="w-64 flex flex-col bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shrink-0">
              <div className="p-4 border-b border-slate-800 bg-slate-950/50">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.editor.slidesOverview}</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {slides.map((slide, idx) => (
                  <button
                    key={slide.id}
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`
                      w-full text-left p-3 rounded-xl border transition-all duration-200 group relative
                      ${currentSlideIndex === idx 
                        ? 'bg-blue-600/10 border-blue-500/50' 
                        : 'bg-slate-800/40 border-slate-700/30 hover:bg-slate-800 hover:border-slate-600'
                      }
                    `}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-xs font-bold ${currentSlideIndex === idx ? 'text-blue-400' : 'text-slate-400'}`}>
                        {t.editor.slide} {idx + 1}
                      </span>
                      {slide.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                      {slide.status === 'error' && <div className="w-2 h-2 bg-red-500 rounded-full" />}
                      {slide.status === 'generating' && <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />}
                    </div>
                    <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden">
                       <div 
                         className={`h-full ${slide.originalText.length > 0 || slide.images.length > 0 ? 'bg-slate-500' : 'bg-red-900/50'}`}
                         style={{ width: '40%' }} 
                       />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2 truncate flex items-center gap-1">
                      {slide.images.length > 0 && <Eye className="w-3 h-3 text-purple-400" />}
                      <span className="truncate">{slide.originalText[0] || (slide.images.length > 0 ? t.editor.visualContent : t.editor.noContent)}</span>
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Editor */}
            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex-1 mb-4">
                 <SlideEditor 
                    slide={slides[currentSlideIndex]} 
                    totalSlides={slides.length}
                    currentSlideIndex={currentSlideIndex}
                    onScriptChange={handleScriptChange}
                    onRegenerate={handleRegenerate}
                    uiLanguage={uiLanguage}
                 />
              </div>

              {/* Navigation Footer */}
              <div className="h-16 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between px-6 shrink-0">
                <button 
                  onClick={() => setCurrentSlideIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentSlideIndex === 0}
                  className="flex items-center gap-2 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span>{t.editor.prevSlide}</span>
                </button>

                <div className="flex gap-1">
                  {slides.map((_, idx) => (
                    <div 
                      key={idx}
                      className={`
                        w-1.5 h-1.5 rounded-full transition-all
                        ${idx === currentSlideIndex ? 'bg-blue-500 w-4' : 'bg-slate-700'}
                      `}
                    />
                  ))}
                </div>

                <button 
                  onClick={() => setCurrentSlideIndex(prev => Math.min(slides.length - 1, prev + 1))}
                  disabled={currentSlideIndex === slides.length - 1}
                  className="flex items-center gap-2 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                >
                  <span>{t.editor.nextSlide}</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;