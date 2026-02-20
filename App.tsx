
import React, { useState, useRef, useEffect } from 'react';
import { Message, LegalAction, Attachment } from './types';
import { TEMPLATES } from './constants';
import { geminiService } from './services/geminiService';
import ChatBubble from './components/ChatBubble';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import FileSaver from 'file-saver';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: "Bem-vindo ao Gabinete de Alta Precisão do AdvogadoIA. Estou configurado para análise jurídica de rigor máximo.\n\nSou a sua inteligência jurídica especializada em Direito de Imigração em Portugal. Como posso auxiliá-lo na defesa dos seus constituintes com detalhe exaustivo hoje?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadingMessages = [
    "Analisando base legal e jurisprudência...",
    "Verificando conformidade com o Código do Procedimento Administrativo...",
    "Redigindo fundamentação detalhada...",
    "Executando revisão técnica de rigor máximo...",
    "Finalizando minuta jurídica..."
  ];

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % loadingMessages.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = (event.target?.result as string).split(',')[1];
      setAttachment({
        name: file.name,
        mimeType: file.type,
        data: base64
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input.trim();
    if ((!textToSend && !attachment) || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      text: textToSend || (attachment ? `Analise exaustivamente este ficheiro: ${attachment.name}` : ''),
      timestamp: new Date(),
      attachment: attachment || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setAttachment(null);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ 
        role: m.role, 
        text: m.text, 
        attachment: m.attachment 
      }));
      
      const response = await geminiService.sendMessage(
        textToSend || "Por favor, proceda à análise jurídica detalhada e sem erros deste documento.", 
        history, 
        userMessage.attachment
      );
      
      const aiMessage: Message = {
        role: 'model',
        text: response.text,
        groundingUrls: response.urls,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        role: 'model',
        text: "Lamento, ocorreu um erro técnico ao processar a sua consulta jurídica. Por favor, tente novamente ou verifique a sua ligação.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateClick = (title: string) => {
    handleSend(`Gostaria de iniciar um rascunho de ${title} com o máximo nível de detalhe jurídico. Por favor, indique-me os elementos factuais precisos que necessita para uma peça processual sem falhas.`);
  };

  const handleAlterationRequest = () => {
    fileInputRef.current?.click();
    setInput("Por favor, execute uma revisão exaustiva e altere este documento para incluir fundamentação jurídica superior sobre...");
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleExportDocx = async () => {
    const lastAiMsg = [...messages].reverse().find(m => m.role === 'model');
    if (!lastAiMsg) return;

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: "Peça Processual - AdvogadoIA",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          ...lastAiMsg.text.split('\n').map(line => {
            let text = line.trim();
            const isHeading = text.startsWith('#');
            if (isHeading) {
              const level = (text.match(/^#+/) || ['#'])[0].length;
              text = text.replace(/^#+\s*/, '');
              return new Paragraph({
                text: text,
                heading: level === 1 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 100 },
              });
            }
            return new Paragraph({
              children: [new TextRun({ text: line, size: 24 })],
              spacing: { after: 120 },
            });
          }),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    // Use FileSaver.saveAs if named export fails
    if (typeof FileSaver === 'function') {
      (FileSaver as any)(blob, `Documento_Juridico_${new Date().getTime()}.docx`);
    } else if (FileSaver && (FileSaver as any).saveAs) {
      (FileSaver as any).saveAs(blob, `Documento_Juridico_${new Date().getTime()}.docx`);
    } else {
      // Fallback to manual download if file-saver completely fails
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Documento_Juridico_${new Date().getTime()}.docx`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Sidebar - Desktop Only */}
      <aside className="hidden lg:flex flex-col w-72 bg-slate-900 text-white border-r border-slate-800 shadow-xl print:hidden">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <i className="fa-solid fa-scale-balanced text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">AdvogadoIA</h1>
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Rigor Máximo</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-2">Análise de Documentos</div>
          
          <button
            onClick={handleAlterationRequest}
            className="w-full text-left p-3 rounded-xl bg-indigo-600/10 border border-indigo-500/30 hover:bg-indigo-600/20 transition-all group flex items-start gap-3 mb-4"
          >
            <i className="fa-solid fa-wand-magic-sparkles mt-1 text-indigo-400 group-hover:text-indigo-300 transition-colors"></i>
            <div>
              <div className="text-sm font-bold text-indigo-100">Revisão Exaustiva</div>
              <div className="text-[11px] text-slate-400 leading-tight mt-1">Correção e ampliação de peças processuais.</div>
            </div>
          </button>

          <div className="border-t border-slate-800 my-4"></div>

          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-2">Peças Processuais</div>
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => handleTemplateClick(t.title)}
              className="w-full text-left p-3 rounded-xl hover:bg-white/5 transition-all group flex items-start gap-3"
            >
              <i className={`fa-solid ${t.icon} mt-1 text-slate-500 group-hover:text-indigo-400 transition-colors`}></i>
              <div>
                <div className="text-sm font-semibold text-slate-200">{t.title}</div>
                <div className="text-[11px] text-slate-500 leading-tight mt-1">{t.description}</div>
              </div>
            </button>
          ))}
        </nav>

        <div className="p-6 bg-slate-800/50 mt-auto border-t border-slate-800">
          <div className="flex items-center gap-3 text-xs mb-4">
            <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>
            <span className="font-bold text-indigo-300 uppercase tracking-wider">Modo Alta Precisão</span>
          </div>
          <p className="text-[11px] text-slate-400 italic leading-relaxed">
            "A precisão técnica é a maior defesa do direito."
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-white shadow-inner relative">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b bg-white/80 backdrop-blur-md sticky top-0 z-10 print:hidden">
          <div className="flex items-center gap-3">
            <div className="lg:hidden w-8 h-8 bg-slate-900 rounded flex items-center justify-center text-white">
               <i className="fa-solid fa-scale-balanced text-sm"></i>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Câmara de Alta Consultoria</h2>
              <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-1">
                <i className="fa-solid fa-shield-halved"></i>
                Vigilância Jurisprudencial Ativa
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleExportDocx}
              title="Exportar para Word (.docx)"
              className="text-slate-600 hover:text-blue-600 font-bold transition-all p-2 px-3 rounded-lg hover:bg-blue-50 flex items-center gap-2 border border-slate-200"
            >
              <i className="fa-solid fa-file-word"></i>
              <span className="text-xs hidden sm:inline">DOCX</span>
            </button>
            <button 
              onClick={handleExportPDF}
              title="Exportar para PDF"
              className="text-slate-600 hover:text-red-600 font-bold transition-all p-2 px-3 rounded-lg hover:bg-red-50 flex items-center gap-2 border border-slate-200"
            >
              <i className="fa-solid fa-file-pdf"></i>
              <span className="text-xs hidden sm:inline">PDF</span>
            </button>
          </div>
        </header>

        {/* Messages */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 bg-slate-50/30 print:bg-white print:p-0"
          id="chat-container"
        >
          {messages.map((msg, i) => (
            <ChatBubble key={i} message={msg} />
          ))}
          {isLoading && (
            <div className="flex flex-col gap-3 p-6 bg-white border-2 border-indigo-100 rounded-3xl w-full max-w-md shadow-xl animate-pulse print:hidden">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <i className="fa-solid fa-gavel text-indigo-600 text-xs"></i>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] mb-1">Análise de Rigor Máximo</div>
                  <div className="text-sm text-slate-600 font-medium transition-all duration-500">
                    {loadingMessages[loadingStep]}
                  </div>
                </div>
              </div>
              <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-300" 
                  style={{ width: `${((loadingStep + 1) / loadingMessages.length) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Input Footer */}
        <footer className="p-4 sm:p-8 border-t bg-white print:hidden">
          {attachment && (
            <div className="max-w-4xl mx-auto mb-4 flex items-center gap-3 p-3 px-5 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/20 animate-in slide-in-from-bottom-2">
              <i className="fa-solid fa-file-shield text-lg"></i>
              <div className="flex-1">
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">Documento sob Inspeção Jurídica</div>
                <div className="text-sm font-bold truncate">{attachment.name}</div>
              </div>
              <button 
                onClick={() => setAttachment(null)}
                className="hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          )}
          <div className="max-w-4xl mx-auto relative group">
            <div className="absolute inset-0 bg-indigo-600 blur-xl opacity-0 group-focus-within:opacity-10 transition-opacity"></div>
            <div className="relative flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border-2 border-slate-200 focus-within:border-indigo-600 transition-all">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-12 h-12 rounded-xl flex items-center justify-center text-slate-400 hover:bg-white hover:text-indigo-600 hover:shadow-md transition-all border border-transparent hover:border-slate-200"
                title="Submeter ficheiro para auditoria"
              >
                <i className="fa-solid fa-folder-open text-xl"></i>
              </button>
              
              <textarea
                rows={1}
                value={input}
                onChange={(e) => {
                   setInput(e.target.value);
                   e.target.style.height = 'auto';
                   e.target.style.height = e.target.scrollHeight + 'px';
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Introduza os factos ou solicite uma revisão exaustiva..."
                className="flex-1 bg-transparent border-none outline-none px-2 py-3 text-sm text-slate-800 placeholder:text-slate-400 resize-none max-h-48"
              />
              
              <button
                onClick={() => handleSend()}
                disabled={isLoading || (!input.trim() && !attachment)}
                className="bg-slate-900 text-white w-12 h-12 rounded-xl flex items-center justify-center hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:scale-105 active:scale-95"
              >
                <i className="fa-solid fa-bolt-lightning text-lg"></i>
              </button>
            </div>
          </div>
          <div className="mt-4 flex justify-center items-center gap-6">
             <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                <i className="fa-solid fa-circle-check text-emerald-500"></i>
                Análise Anti-Erro Ativa
             </div>
             <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                <i className="fa-solid fa-circle-check text-emerald-500"></i>
                Rigor PT-PT Jurídico
             </div>
          </div>
        </footer>
      </main>

      <style>{`
        @media print {
          @page {
            margin: 20mm;
          }
          body {
            background-color: white !important;
          }
          aside, header, footer, .animate-pulse, .absolute, button {
            display: none !important;
          }
          #chat-container {
            padding: 0 !important;
            background: white !important;
            box-shadow: none !important;
            overflow: visible !important;
            height: auto !important;
          }
          .prose {
            max-width: 100% !important;
            color: black !important;
          }
          #root {
            height: auto !important;
          }
          main {
            height: auto !important;
            overflow: visible !important;
          }
        }
        textarea::-webkit-scrollbar {
          width: 4px;
        }
        textarea::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default App;
