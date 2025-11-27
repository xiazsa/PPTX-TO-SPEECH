import React, { useState } from 'react';
import { Key, Lock } from 'lucide-react';
import { UILanguage } from '../types';
import { TRANSLATIONS } from '../utils/translations';

interface ApiKeyModalProps {
  onSubmit: (key: string) => void;
  uiLanguage?: UILanguage;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSubmit, uiLanguage = 'Chinese' }) => {
  const [key, setKey] = useState('');
  const t = TRANSLATIONS[uiLanguage].apiKeyModal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      onSubmit(key.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="flex items-center justify-center w-16 h-16 bg-blue-500/10 rounded-full mb-6 mx-auto">
          <Key className="w-8 h-8 text-blue-400" />
        </div>
        
        <h2 className="text-2xl font-bold text-center text-white mb-2">
          {t.title}
        </h2>
        <p className="text-slate-400 text-center mb-8 text-sm">
          {t.desc}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder={t.placeholder}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-600"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium py-3 rounded-lg transition-all shadow-lg shadow-blue-500/20"
          >
            {t.submit}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <a 
            href="https://aistudio.google.com/app/apikey" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 underline"
          >
            {t.link}
          </a>
        </div>
      </div>
    </div>
  );
};