
import React from 'react';
import { Message } from '../types';

interface ChatBubbleProps {
  message: Message;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isAi = message.role === 'model';

  return (
    <div className={`flex w-full mb-6 ${isAi ? 'justify-start' : 'justify-end'} group`}>
      <div className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl shadow-sm border ${
        isAi 
          ? 'bg-white border-gray-200 text-slate-800 rounded-tl-none' 
          : 'bg-indigo-900 border-indigo-900 text-white rounded-tr-none'
      }`}>
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold opacity-60">
          <i className={`fa-solid ${isAi ? 'fa-robot' : 'fa-user-tie'}`}></i>
          <span>{isAi ? 'SISTEMA ADVOGADO-IA' : 'ADVOGADO CONSULTOR'}</span>
          <span className="ml-auto">{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        
        {message.attachment && (
          <div className={`mb-3 p-2 rounded-lg border flex items-center gap-3 ${
            isAi ? 'bg-gray-50 border-gray-200' : 'bg-indigo-800/50 border-indigo-700'
          }`}>
            <div className="w-10 h-10 rounded bg-indigo-500/20 flex items-center justify-center text-indigo-500">
               <i className={`fa-solid ${message.attachment.mimeType.startsWith('image/') ? 'fa-image' : 'fa-file-pdf'}`}></i>
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-medium truncate">{message.attachment.name}</p>
              <p className="text-[10px] opacity-60 uppercase">{message.attachment.mimeType.split('/')[1]}</p>
            </div>
          </div>
        )}

        <div className="whitespace-pre-wrap text-sm leading-relaxed prose prose-sm max-w-none prose-indigo">
          {message.text}
        </div>

        {isAi && message.groundingUrls && message.groundingUrls.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-2">Fontes Consultadas (Grounding):</p>
            <div className="flex flex-wrap gap-2">
              {message.groundingUrls.map((url, i) => (
                <a 
                  key={i} 
                  href={url.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[11px] bg-gray-50 hover:bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-gray-200 transition-colors flex items-center gap-1"
                >
                  <i className="fa-solid fa-link"></i>
                  {url.title || 'Link Legal'}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;
