// All necessary imports are consolidated at the top.
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
// Fix: The type `ChatMessage` is not exported from `@google/genai`. The correct type for chat history messages is `Content`.
import { GoogleGenAI, Chat, Content as GeminiChatMessage } from "@google/genai";
import * as XLSX from 'xlsx';

// =================================================================
// TYPE DEFINITIONS (from services/types.ts and App.tsx)
// =================================================================

// Fix: Add types for the browser's SpeechRecognition API to fix TypeScript errors.
interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: (event: Event) => void;
  start(): void;
  stop(): void;
}

declare global {
  interface Window {
    SpeechRecognition: { new (): SpeechRecognition };
    webkitSpeechRecognition: { new (): SpeechRecognition };
  }
}

enum ChatRole {
  USER = 'user',
  MODEL = 'model',
}

interface ChatMessage {
  role: ChatRole;
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
}

// =================================================================
// ICON COMPONENTS (from components/IconComponents.tsx)
// =================================================================

const ExcelIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
);

const BotIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 8V4H8" />
        <rect width="16" height="12" x="4" y="8" rx="2" />
        <path d="M2 14h2" />
        <path d="M20 14h2" />
        <path d="M15 13v2" />
        <path d="M9 13v2" />
    </svg>
);

const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const SendIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="m22 2-7 20-4-9-9-4Z" />
        <path d="M22 2 11 13" />
    </svg>
);

const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M5 12h14"/>
        <path d="M12 5v14"/>
    </svg>
);

const CopyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
    </svg>
);

const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M20 6 9 17l-5-5"/>
    </svg>
);

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M18 6L6 18M6 6l12 12" />
    </svg>
);

const UploadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
);

const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

const FileIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M3 6h18"/>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
);

const MicrophoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
        <line x1="12" y1="19" x2="12" y2="23"/>
        <line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
);

const MenuIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="3" y1="12" x2="21" y2="12"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
);

const MessageSquareIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
);

const CodeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polyline points="16 18 22 12 16 6"/>
        <polyline points="8 6 2 12 8 18"/>
    </svg>
);

const SettingsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1 0 2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
        <circle cx="12" cy="12" r="3"/>
    </svg>
);

const EyeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
        <circle cx="12" cy="12" r="3"/>
    </svg>
);

const EyeOffIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
        <line x1="2" x2="22" y1="2" y2="22"/>
    </svg>
);


// =================================================================
// GEMINI SERVICE (from services/geminiService.ts)
// =================================================================

const getAi = (apiKey: string): GoogleGenAI => {
    if (!apiKey) {
        throw new Error("A chave de API é necessária, mas não foi fornecida.");
    }
    return new GoogleGenAI({ apiKey });
};

const systemInstruction = `Função: Você é um especialista em Excel com mais de 20 anos de experiência. Sua missão é responder perguntas de forma clara, prática e completa, utilizando todos os recursos disponíveis no Excel — desde fórmulas simples até funções avançadas e macros VBA.

Instruções:
- **REGRA PRINCIPAL:** Se o usuário pedir explicitamente por um código VBA, forneça-o diretamente. Para outras perguntas, primeiro ofereça a solução mais comum (geralmente uma fórmula do Excel). Após a explicação da fórmula, você DEVE perguntar se o usuário gostaria de ver uma alternativa em VBA.
- Sempre explique de forma acessível, adaptando o nível técnico ao perfil do usuário.
- Dê exemplos práticos e contextualizados.
- Quando possível, sugira boas práticas e alternativas mais eficientes.
- Se a dúvida envolver erro ou problema, identifique possíveis causas e proponha soluções.
- Use linguagem amigável, profissional e motivadora.
- Formate suas respostas usando markdown. Para blocos de código Excel, use \`\`\`excel ... \`\`\`. Para blocos de código VBA, use \`\`\`vba ... \`\`\`.
- Para fornecer dados para download como um arquivo CSV, formate a saída dentro de um bloco de código markdown com o tipo 'csv'. Por exemplo:
\`\`\`csv
Cabeçalho1,Cabeçalho2
Valor1,Valor2
\`\`\`

Estilo de resposta:
- Clareza e objetividade.
- Estrutura com tópicos ou passos numerados.
- Exemplos com fórmulas e explicações, sempre seguidos pela oferta de um exemplo VBA (a menos que o VBA tenha sido solicitado inicialmente).

Exemplo de entrada do usuário:
> Como faço para somar valores de uma coluna apenas se outra coluna tiver o texto "Confirmado"?

Resposta esperada:
> Para somar valores de uma coluna com base em um critério, você pode usar a função SOMASE do Excel. É uma solução direta para planilhas.
>
> Exemplo da fórmula:
> \`\`\`excel
> =SOMASE(B2:B100; "Confirmado"; A2:A100)
> \`\`\`
> - \`B2:B100\`: intervalo onde está o critério ("Confirmado")
> - \`"Confirmado"\`: o texto que será usado como filtro
> - \`A2:A100\`: intervalo dos valores que serão somados
>
> Gostaria de ver um exemplo de como fazer isso utilizando um código VBA?`;

const startNewGeminiChatWithHistory = (apiKey: string, history: ChatMessage[]): Chat => {
  const mappedHistory: GeminiChatMessage[] = history
    .filter(msg => msg.content.trim() !== '' || msg.role === ChatRole.USER)
    .map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));
  
  const ai = getAi(apiKey);
  return ai.chats.create({
    model: 'gemini-flash-lite-latest',
    config: {
      systemInstruction: systemInstruction,
    },
    history: mappedHistory,
  });
};

async function* streamChatResponse(
  chat: Chat, 
  message: string
): AsyncGenerator<string, void, unknown> {
  try {
    const result = await chat.sendMessageStream({ message });

    for await (const chunk of result) {
      yield chunk.text;
    }
  } catch (error) {
    console.error("Gemini API error:", error);
    if (error instanceof Error && (error.message.includes("API key not valid") || error.message.includes("API_KEY_INVALID"))) {
         throw new Error("API key not valid");
    }
    throw new Error("Falha ao obter resposta da IA. Verifique sua conexão de rede e a configuração da chave de API.");
  }
}

async function generateTitle(apiKey: string, prompt: string): Promise<string> {
    try {
        const ai = getAi(apiKey);
        const result = await ai.models.generateContent({
            model: 'gemini-flash-lite-latest',
            contents: `Gere um título curto e conciso (máximo de 5 palavras) para a seguinte pergunta do usuário. Responda APENAS com o título, sem nenhuma formatação ou texto adicional como aspas ou markdown. Pergunta: "${prompt}"`,
        });
        const title = result.text.trim().replace(/['"“”*]+/g, '');
        return title || "New Chat";
    } catch(e) {
        console.error("Title generation failed", e);
        return "New Chat";
    }
}


// =================================================================
// UI COMPONENTS (from components folder)
// =================================================================

// --- ApiKeyModal.tsx ---
interface ApiKeyModalProps {
  isOpen: boolean;
  onSave: (key: string) => void;
  onClose: () => void;
  apiKeyError: string | null;
}
const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onSave, onClose, apiKeyError }) => {
    const [apiKeyInput, setApiKeyInput] = useState('');
    const [isKeyVisible, setIsKeyVisible] = useState(false);
    const hasExistingKey = !!localStorage.getItem('gemini-api-key');

    useEffect(() => {
        if (isOpen) {
            setApiKeyInput(localStorage.getItem('gemini-api-key') || '');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (apiKeyInput.trim()) {
            onSave(apiKeyInput.trim());
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="api-modal-title">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md border border-gray-700 relative" onClick={e => e.stopPropagation()}>
                {hasExistingKey && (
                    <button onClick={onClose} className="absolute top-3 right-3 p-1 text-gray-500 hover:text-white rounded-full hover:bg-gray-700 transition-colors" aria-label="Close modal">
                        <XIcon className="h-5 w-5" />
                    </button>
                )}
                <div className="flex items-center gap-3 mb-4">
                    <SettingsIcon className="h-6 w-6 text-green-400" />
                    <h2 id="api-modal-title" className="text-xl font-bold text-white">Configure API Key</h2>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                    To use Excel Expert AI, please provide your Google Gemini API key. Your key is stored securely in your browser's local storage and is never sent anywhere else.
                </p>
                <p className="text-sm text-gray-400 mb-4">
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">
                        Get your Gemini API Key from Google AI Studio
                    </a>
                </p>
                {apiKeyError && <div className="bg-red-900/50 border border-red-700 text-red-300 text-sm p-3 rounded-md mb-4">{apiKeyError}</div>}
                <div className="relative">
                    <input
                        type={isKeyVisible ? 'text' : 'password'}
                        value={apiKeyInput}
                        onChange={(e) => setApiKeyInput(e.target.value)}
                        placeholder="Enter your Gemini API key"
                        className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:outline-none pr-10"
                    />
                     <button
                        type="button"
                        onClick={() => setIsKeyVisible(!isKeyVisible)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-white"
                        aria-label={isKeyVisible ? 'Hide API key' : 'Show API key'}
                    >
                       {isKeyVisible ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                </div>
                <div className="mt-6 flex justify-end">
                    <button onClick={handleSave} className="px-5 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed" disabled={!apiKeyInput.trim()}>
                        Save and Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- WelcomeScreen.tsx ---
interface WelcomeScreenProps {
  onPromptClick: (prompt: string) => void;
}
const examplePrompts = [
  "How do I use VLOOKUP?",
  "Create a VBA macro to sort data in column A.",
  "What is a Pivot Table?",
  "Explain the SUMIF function with an example."
];
const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onPromptClick }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 px-4">
      <div className="max-w-3xl">
        <ExcelIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-200 mb-2">Welcome to Excel Expert AI</h2>
        <p className="mb-8">Your AI-powered assistant for mastering Microsoft Excel. Ask anything from simple formulas to complex macros.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {examplePrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => onPromptClick(prompt)}
              className="bg-gray-800 hover:bg-gray-700/80 border border-gray-700 text-left text-sm text-gray-300 p-3 rounded-lg transition-colors duration-200"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- ChatMessage.tsx ---
interface ChatMessageProps {
  message: ChatMessage;
}
const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCopied, setIsCopied] = useState(false);
  const rawCode = children?.toString() || '';
  const handleCopy = async () => {
    if (!rawCode) return;
    try {
      await navigator.clipboard.writeText(rawCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };
  const highlightSyntax = (codeString: string) => {
    if (!codeString) return { __html: '' };
    const regex = /(\".*?\")|(\b[A-Z]{2,}\b(?=\s*\())|(\b\$?[A-Z]+\$?\d+(?::\$?[A-Z]+\$?\d+)?\b)|(\b\d+\.?\d*\b)|([=+\-*/,;()<>])/g;
    const highlightedCode = codeString.replace(regex, (match, string, func, range, num, op) => {
        if (string) return `<span class="text-lime-400">${string}</span>`;
        if (func) return `<span class="text-sky-400">${func}</span>`;
        if (range) return `<span class="text-orange-400">${range}</span>`;
        if (num) return `<span class="text-purple-400">${num}</span>`;
        if (op) return `<span class="text-gray-400">${op}</span>`;
        return match;
    });
    return { __html: highlightedCode };
  };
  return (
    <div className="bg-gray-900/70 rounded-md my-4 relative group">
      <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-gray-600/50">
        <div className="flex items-center gap-2">
            <ExcelIcon className="h-5 w-5 text-green-400" />
            <span className="text-sm font-semibold text-gray-400">Excel Formula</span>
        </div>
        <button
          onClick={handleCopy}
          disabled={isCopied}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white p-1.5 rounded-md bg-gray-800 hover:bg-gray-700 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200 disabled:cursor-wait"
          aria-label={isCopied ? "Copied" : "Copy code"}
        >
          {isCopied ? ( <><CheckIcon className="h-4 w-4 text-green-400" /><span>Copied!</span></> ) : ( <><CopyIcon className="h-4 w-4" /><span>Copy</span></> )}
        </button>
      </div>
      <pre className="p-4 text-sm text-green-300 whitespace-pre-wrap break-words">
        <code dangerouslySetInnerHTML={highlightSyntax(rawCode)} />
      </pre>
    </div>
  );
};
const VbaCodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCopied, setIsCopied] = useState(false);
  const rawCode = children?.toString() || '';
  const handleCopy = async () => {
    if (!rawCode) return;
    try {
      await navigator.clipboard.writeText(rawCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };
  const highlightVbaSyntax = (codeString: string) => {
    if (!codeString) return { __html: '' };
    const vbaRegex = /(^\s*'.*?$)|(".*?")|\b(Sub|Function|Dim|As|String|Integer|Long|Double|Boolean|Date|Object|Variant|If|Then|Else|ElseIf|End If|For|To|Next|Do|Loop|While|Wend|Select|Case|End Select|With|End With|Public|Private|Const|Set|Call|Exit|On Error|Resume|GoTo|True|False|Null|Nothing)\b|(\b(?:Application|Workbooks|Worksheets|Range|Cells|ActiveSheet|ActiveWorkbook|Selection|Value|Text|Formula|Address|Count|Select|Activate|Copy|Paste|MsgBox)\b)|(\b\d+\.?\d*\b)|([=+\-*/<>&(),.])/gm;
    const highlightedCode = codeString.replace(vbaRegex, (match, comment, string, keyword, excelObject, num, op) => {
        if (comment) return `<span class="text-green-600">${comment}</span>`;
        if (string) return `<span class="text-lime-400">${string}</span>`;
        if (keyword) return `<span class="text-cyan-400">${keyword}</span>`;
        if (excelObject) return `<span class="text-yellow-300">${excelObject}</span>`;
        if (num) return `<span class="text-purple-400">${num}</span>`;
        if (op) return `<span class="text-gray-400">${op}</span>`;
        return match;
    });
    return { __html: highlightedCode };
  };
  return (
    <div className="bg-gray-900/70 rounded-md my-4 relative group">
      <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-gray-600/50">
        <div className="flex items-center gap-2">
            <CodeIcon className="h-5 w-5 text-cyan-400" />
            <span className="text-sm font-semibold text-gray-400">VBA Macro</span>
        </div>
        <button
          onClick={handleCopy}
          disabled={isCopied}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white p-1.5 rounded-md bg-gray-800 hover:bg-gray-700 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200 disabled:cursor-wait"
          aria-label={isCopied ? "Copied" : "Copy code"}
        >
          {isCopied ? ( <><CheckIcon className="h-4 w-4 text-green-400" /><span>Copied!</span></> ) : ( <><CopyIcon className="h-4 w-4" /><span>Copy</span></> )}
        </button>
      </div>
      <pre className="p-4 text-sm text-gray-300 whitespace-pre-wrap break-words">
        <code dangerouslySetInnerHTML={highlightVbaSyntax(rawCode)} />
      </pre>
    </div>
  );
};
const DownloadBlock: React.FC<{ content: string }> = ({ content }) => {
    const handleDownload = () => {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'export.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    return (
        <div className="bg-gray-900/70 rounded-md my-4">
            <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-gray-600/50">
                <div className="flex items-center gap-2">
                    <ExcelIcon className="h-5 w-5 text-green-400" />
                    <span className="text-sm font-semibold text-gray-400">CSV Data</span>
                </div>
                <button onClick={handleDownload} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white p-1.5 rounded-md bg-gray-800 hover:bg-gray-700 transition-colors" aria-label="Download CSV">
                    <DownloadIcon className="h-4 w-4" />
                    <span>Download</span>
                </button>
            </div>
            <pre className="p-4 text-sm text-gray-300 whitespace-pre-wrap break-words max-h-48 overflow-y-auto">
                <code>{content}</code>
            </pre>
        </div>
    );
};
const FormattedContent: React.FC<{ content: string }> = ({ content }) => {
  if (!content) return <span className="animate-pulse">...</span>;
  const parts = content.split(/(\`\`\`(?:excel|vba|csv)[\s\S]*?\`\`\`)/g);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('```excel')) {
          const code = part.replace(/^```excel\n?/, '').replace(/\n?```$/, '').trim();
          return <CodeBlock key={index}>{code}</CodeBlock>;
        }
        if (part.startsWith('```vba')) {
          const code = part.replace(/^```vba\n?/, '').replace(/\n?```$/, '').trim();
          return <VbaCodeBlock key={index}>{code}</VbaCodeBlock>;
        }
        if (part.startsWith('```csv')) {
          const csvContent = part.replace(/^```csv\n?/, '').replace(/\n?```$/, '').trim();
          return <DownloadBlock key={index} content={csvContent} />;
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </>
  );
};
const ChatMessageComponent: React.FC<ChatMessageProps> = ({ message }) => {
  const isModel = message.role === ChatRole.MODEL;
  return (
    <div className={`flex items-start gap-4 max-w-4xl mx-auto ${isModel ? '' : 'justify-start'}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isModel ? 'bg-green-800' : 'bg-gray-700'}`}>
        {isModel ? <BotIcon className="w-5 h-5 text-green-300" /> : <UserIcon className="w-5 h-5 text-gray-300" />}
      </div>
      <div className={`w-full p-4 rounded-xl ${isModel ? 'bg-gray-800' : 'bg-gray-700/50'}`}>
        <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-2 leading-relaxed break-words whitespace-pre-wrap">
           <FormattedContent content={message.content} />
        </div>
      </div>
    </div>
  );
};

// --- ChatInput.tsx ---
interface ChatInputProps {
  onSendMessage: () => void;
  isLoading: boolean;
  file: File | null;
  onFileChange: (file: File) => void;
  onFileRemove: () => void;
  text: string;
  setText: (text: string) => void;
  isListening: boolean;
  onToggleListening: () => void;
  isApiKeySet: boolean;
}
const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, file, onFileChange, onFileRemove, text, setText, isListening, onToggleListening, isApiKeySet }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [text]);
  const isDisabled = isLoading || !isApiKeySet;
  const handleSubmit = () => { if ((text.trim() || file) && !isDisabled) { onSendMessage(); } };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); handleSubmit(); } };
  const handleFileButtonClick = () => { fileInputRef.current?.click(); };
  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) { onFileChange(selectedFile); }
    if(fileInputRef.current) { fileInputRef.current.value = ''; }
  };
  return (
    <div className="max-w-4xl mx-auto">
      {file && (
        <div className="mb-2 flex items-center justify-between bg-gray-700/50 p-2 rounded-lg text-sm">
          <div className="flex items-center gap-2 truncate">
            <FileIcon className="h-5 w-5 flex-shrink-0 text-gray-400" />
            <span className="text-gray-300 truncate">{file.name}</span>
          </div>
          <button onClick={onFileRemove} className="p-1 text-gray-400 hover:text-white rounded-full hover:bg-gray-600" aria-label="Remove file">
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      )}
      <div className="relative flex items-end bg-gray-800 rounded-xl border border-gray-700 focus-within:ring-2 focus-within:ring-green-500 transition-all duration-200">
        <input type="file" ref={fileInputRef} onChange={handleFileSelected} className="hidden" accept=".xlsx,.xls,.csv" disabled={isDisabled} />
        <button onClick={handleFileButtonClick} disabled={isDisabled} className="p-2 ml-2 mb-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50" aria-label="Attach file">
          <UploadIcon className="w-5 h-5" />
        </button>
        <button onClick={onToggleListening} disabled={isDisabled} className={`p-2 mb-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50 ${isListening ? 'text-red-500' : ''}`} aria-label={isListening ? "Stop listening" : "Start listening"}>
          <MicrophoneIcon className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
        </button>
        <textarea ref={textareaRef} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={handleKeyDown} placeholder={!isApiKeySet ? "Please set your API key to begin..." : (isListening ? "Listening..." : "Ask anything about Excel, or upload a file...")} rows={1} className="w-full bg-transparent p-3 pr-12 text-gray-200 placeholder-gray-500 focus:outline-none resize-none max-h-48" disabled={isDisabled} />
        <button onClick={handleSubmit} disabled={isDisabled || (!text.trim() && !file)} className="absolute right-3 bottom-3 p-2 rounded-full bg-green-600 text-white disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-green-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50" aria-label="Send message">
          <SendIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// --- Header.tsx ---
interface HeaderProps { onNewChat: () => void; onToggleSidebar: () => void; }
const Header: React.FC<HeaderProps> = ({ onNewChat, onToggleSidebar }) => {
  return (
    <header className="flex items-center justify-between p-2 sm:p-4 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-10 flex-shrink-0">
      <div className="flex items-center gap-3">
        <button onClick={onToggleSidebar} className="p-2 -ml-2 text-gray-400 hover:text-white lg:hidden" aria-label="Open chat history">
          <MenuIcon className="h-6 w-6" />
        </button>
        <ExcelIcon className="h-8 w-8 text-green-400 hidden sm:block" />
        <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-200 tracking-tight">Excel Expert AI</h1>
            <p className="text-xs text-gray-400">by Eleandro</p>
        </div>
      </div>
       <button onClick={onNewChat} className="flex items-center gap-2 px-4 py-2 bg-green-600/80 hover:bg-green-600 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50">
        <PlusIcon className="h-5 w-5" />
        <span className="hidden sm:inline">New Chat</span>
      </button>
    </header>
  );
};

// --- HistorySidebar.tsx ---
interface HistorySidebarProps { conversations: Conversation[]; activeConversationId: string | null; onSelectConversation: (id: string) => void; onDeleteConversation: (id: string) => void; onNewChat: () => void; isOpen: boolean; setIsOpen: (isOpen: boolean) => void; onManageApiKey: () => void; }
interface ConfirmationModalProps { isOpen: boolean; onClose: () => void; onConfirm: () => void; conversationTitle: string; }
const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, conversationTitle }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm border border-gray-700" onClick={e => e.stopPropagation()}>
                <h2 id="modal-title" className="text-lg font-bold text-white mb-2">Confirm Deletion</h2>
                <p className="text-sm text-gray-400 mb-6">Are you sure you want to delete the chat titled "{conversationTitle}"? This action cannot be undone.</p>
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500 transition-colors">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500 transition-colors">Delete</button>
                </div>
            </div>
        </div>
    );
};
const HistorySidebar: React.FC<HistorySidebarProps> = ({ conversations, activeConversationId, onSelectConversation, onDeleteConversation, onNewChat, isOpen, setIsOpen, onManageApiKey }) => {
  const [conversationToDelete, setConversationToDelete] = React.useState<Conversation | null>(null);
  const requestDelete = (convo: Conversation) => { setConversationToDelete(convo); };
  const confirmDelete = () => { if (conversationToDelete) { onDeleteConversation(conversationToDelete.id); setConversationToDelete(null); } };
  const cancelDelete = () => { setConversationToDelete(null); };
  return (
    <>
        <div className={`fixed inset-0 bg-black/60 z-20 lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsOpen(false)}></div>
        <aside className={`absolute lg:static inset-y-0 left-0 z-30 flex flex-col w-64 bg-gray-800 border-r border-gray-700/50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
            <div className="flex items-center justify-between p-4 border-b border-gray-700/50 flex-shrink-0">
                <div className="flex items-center gap-2"><ExcelIcon className="h-6 w-6 text-green-400" /><span className="font-semibold text-white">Chat History</span></div>
                <button onClick={onNewChat} className="flex items-center gap-1 p-2 text-sm bg-green-600/80 text-white rounded-md hover:bg-green-600" aria-label="Start new chat"><PlusIcon className="h-4 w-4" /></button>
            </div>
            <nav className="flex-1 overflow-y-auto p-2 space-y-1">
                {conversations.length > 0 ? (
                    conversations.map((convo) => (
                        <div key={convo.id} className={`group flex items-center justify-between w-full rounded-md text-sm transition-colors ${activeConversationId === convo.id ? 'bg-green-800/50 text-white' : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'}`}>
                            <button onClick={() => onSelectConversation(convo.id)} className="flex items-center gap-2 truncate w-full h-full px-3 py-2 text-left" aria-label={`Select conversation: ${convo.title}`}>
                                <MessageSquareIcon className="h-4 w-4 flex-shrink-0" />
                                <span className="truncate">{convo.title}</span>
                            </button>
                            <button onClick={() => requestDelete(convo)} className="p-1 mr-2 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 focus:opacity-100 flex-shrink-0" aria-label={`Delete conversation: ${convo.title}`}><TrashIcon className="h-4 w-4" /></button>
                        </div>
                    ))
                ) : ( <div className="text-center text-xs text-gray-500 p-4">No chat history yet. Start a new conversation!</div> )}
            </nav>
            <div className="p-2 border-t border-gray-700/50 mt-auto flex-shrink-0 space-y-2">
                 <button onClick={onManageApiKey} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:bg-gray-700/50 hover:text-gray-200 rounded-md transition-colors">
                    <SettingsIcon className="h-4 w-4" />
                    <span>Manage API Key</span>
                </button>
                <p className="text-xs text-center text-gray-500 !mt-2">Excel Expert AI by Eleandro</p>
            </div>
        </aside>
        <ConfirmationModal isOpen={!!conversationToDelete} onClose={cancelDelete} onConfirm={confirmDelete} conversationTitle={conversationToDelete?.title || ''} />
    </>
  );
};

// =================================================================
// MAIN APP COMPONENT (from App.tsx)
// =================================================================

interface ErrorToastProps { message: string | null; onClose: () => void; }
const ErrorToast: React.FC<ErrorToastProps> = ({ message, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);
    useEffect(() => {
        if (message) {
            setIsVisible(true);
            const timer = setTimeout(() => { handleClose(); }, 8000);
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
        }
    }, [message]);
    const handleClose = () => { setIsVisible(false); setTimeout(() => { onClose(); }, 300); };
    if (!message) { return null; }
    return (
        <div className={`fixed bottom-5 right-5 max-w-sm w-full bg-red-800 border border-red-600 text-white p-4 rounded-lg shadow-2xl transition-all duration-300 ease-in-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} z-50`} role="alert" aria-live="assertive">
            <div className="flex items-start">
                <div className="flex-1"><p className="font-bold text-red-200">An Error Occurred</p><p className="text-sm text-red-300 mt-1">{message}</p></div>
                <button onClick={handleClose} className="ml-4 p-1 rounded-full text-red-300 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-white" aria-label="Close error message"><XIcon className="h-5 w-5" /></button>
            </div>
        </div>
    );
};

const App: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini-api-key');
    if (savedKey) {
        setApiKey(savedKey);
    } else {
        setIsApiKeyModalOpen(true);
    }
    
    try {
        const savedConversations = localStorage.getItem('excel-expert-conversations');
        if (savedConversations) { setConversations(JSON.parse(savedConversations)); }
    } catch (e) {
        console.error("Failed to load conversations from localStorage", e);
        setError("Could not load your saved chat history.");
    }
  }, []);

  useEffect(() => {
    try {
        localStorage.setItem('excel-expert-conversations', JSON.stringify(conversations));
    } catch (e) {
        console.error("Failed to save conversations to localStorage", e);
        setError("Could not save your chat history.");
    }
  }, [conversations]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [activeConversationId, conversations]);

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) { console.warn("Speech recognition is not supported by this browser."); return; }
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'pt-BR';
    recognition.onresult = (event) => {
        const transcript = Array.from(event.results).map(result => result[0]).map(result => result.transcript).join('');
        setText(transcript);
    };
    recognition.onerror = (event) => {
        console.error('Speech Recognition Error:', event.error);
        setError(`Speech recognition failed: ${event.error}`);
        setIsListening(false);
    };
    recognition.onend = () => { setIsListening(false); };
    recognitionRef.current = recognition;
  }, []);

  const activeMessages = useMemo(() => {
    return conversations.find(c => c.id === activeConversationId)?.messages || [];
  }, [conversations, activeConversationId]);

  const sendMessage = useCallback(async (messageText: string) => {
    if (!apiKey) {
        setApiKeyError("Please set your API key to start chatting.");
        setIsApiKeyModalOpen(true);
        return;
    }
    if (!messageText.trim() && !file) return;
    setIsLoading(true);
    setError(null);
    if (isListening) { recognitionRef.current?.stop(); }
    
    let currentConversationId = activeConversationId;
    const isNewConversation = !currentConversationId;
    let messageContent = messageText;

    if (file) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) throw new Error("The spreadsheet contains no sheets.");
        const worksheet = workbook.Sheets[firstSheetName];
        const fileContentAsCsv = XLSX.utils.sheet_to_csv(worksheet);
        const userPrompt = messageText || "analise esta planilha e me dê um resumo dos dados.";
        messageContent = `O conteúdo do arquivo '${file.name}' (em formato CSV) é:\n\n---\n${fileContentAsCsv}\n---\n\n${userPrompt}`;
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred while reading the file.';
        setError(`Failed to read the uploaded file: ${errorMessage}`);
        setIsLoading(false);
        return;
      }
    }

    const userMessage: ChatMessage = { role: ChatRole.USER, content: messageContent };
    const historyForApi = isNewConversation ? [] : conversations.find(c => c.id === currentConversationId)?.messages || [];
    
    if (isNewConversation) {
        const newId = Date.now().toString();
        const newConversation: Conversation = { id: newId, title: messageText.substring(0, 40) + '...', messages: [userMessage] };
        setConversations(prev => [newConversation, ...prev]);
        setActiveConversationId(newId);
        currentConversationId = newId;
        generateTitle(apiKey, messageText).then(title => { setConversations(prev => prev.map(conv => conv.id === newId ? { ...conv, title } : conv)); }).catch(err => console.error("Failed to generate title", err));
    } else {
        setConversations(prev => prev.map(conv => conv.id === currentConversationId ? { ...conv, messages: [...conv.messages, userMessage] } : conv));
    }

    setFile(null);
    setText('');
    setConversations(prev => prev.map(conv => conv.id === currentConversationId ? { ...conv, messages: [...conv.messages, { role: ChatRole.MODEL, content: '' }] } : conv));

    try {
        const chat = startNewGeminiChatWithHistory(apiKey, historyForApi);
        const stream = streamChatResponse(chat, messageContent);
        for await (const chunk of stream) {
            setConversations(prev => prev.map(conv => {
                if (conv.id !== currentConversationId) return conv;
                const lastMessage = conv.messages[conv.messages.length - 1];
                const updatedMessages = [...conv.messages.slice(0, -1), { ...lastMessage, content: lastMessage.content + chunk }];
                return { ...conv, messages: updatedMessages };
            }));
        }
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.';
        if (err instanceof Error && err.message.includes("API key not valid")) {
            localStorage.removeItem('gemini-api-key');
            setApiKey(null);
            setApiKeyError("The provided API key is invalid or has been revoked. Please enter a valid key.");
            setIsApiKeyModalOpen(true);
            setConversations(prev => prev.map(conv => {
                if (conv.id !== currentConversationId) return conv;
                const userMessages = conv.messages.filter(m => m.role === ChatRole.USER);
                return { ...conv, messages: userMessages };
            }));
        } else {
            setError(errorMessage);
            setConversations(prev => prev.map(conv => {
                if (conv.id !== currentConversationId) return conv;
                const lastMessage = conv.messages[conv.messages.length - 1];
                if (lastMessage.content.includes('**Erro:**')) return conv;
                const updatedMessages = [...conv.messages.slice(0, -1), { ...lastMessage, content: lastMessage.content + `\n\n**Erro:** ${errorMessage}` }];
                return { ...conv, messages: updatedMessages };
            }));
        }
    } finally {
        setIsLoading(false);
    }
  }, [apiKey, activeConversationId, conversations, file, isListening]);
  
  const handleSaveApiKey = (key: string) => {
    localStorage.setItem('gemini-api-key', key);
    setApiKey(key);
    setApiKeyError(null);
    setIsApiKeyModalOpen(false);
  };

  const handleFormSubmit = () => { sendMessage(text); };
  const startNewChat = () => { setActiveConversationId(null); setError(null); setFile(null); setText(''); setIsSidebarOpen(false); };
  const selectConversation = (id: string) => { setActiveConversationId(id); setIsSidebarOpen(false); };
  const deleteConversation = (id: string) => { setConversations(prev => prev.filter(c => c.id !== id)); if (activeConversationId === id) { setActiveConversationId(null); } };
  const handleToggleListening = () => {
      if (!recognitionRef.current) return;
      if (isListening) { recognitionRef.current.stop(); } else { setText(''); recognitionRef.current.start(); setIsListening(true); }
  };

  return (
    <div className="max-w-screen-2xl mx-auto">
        <ApiKeyModal isOpen={isApiKeyModalOpen} onSave={handleSaveApiKey} onClose={() => setIsApiKeyModalOpen(false)} apiKeyError={apiKeyError} />
        <div className="flex h-screen bg-gray-900 text-white font-sans overflow-hidden">
            <HistorySidebar conversations={conversations} activeConversationId={activeConversationId} onSelectConversation={selectConversation} onDeleteConversation={deleteConversation} onNewChat={startNewChat} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} onManageApiKey={() => { setApiKeyError(null); setIsApiKeyModalOpen(true); }} />
            <div className="flex flex-col flex-1 min-w-0">
                <Header onNewChat={startNewChat} onToggleSidebar={() => setIsSidebarOpen(prev => !prev)} />
                <main ref={chatContainerRef} className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 space-y-6">
                {activeMessages.length === 0 ? (
                    <WelcomeScreen onPromptClick={sendMessage} />
                ) : (
                    activeMessages.map((msg, index) => (
                    <ChatMessageComponent key={index} message={msg} />
                    ))
                )}
                </main>
                <div className="p-2 sm:p-4 md:p-6 bg-gray-900 border-t border-gray-700/50">
                <ChatInput onSendMessage={handleFormSubmit} isLoading={isLoading} file={file} onFileChange={setFile} onFileRemove={() => setFile(null)} text={text} setText={setText} isListening={isListening} onToggleListening={handleToggleListening} isApiKeySet={!!apiKey} />
                </div>
            </div>
        </div>
        <ErrorToast message={error} onClose={() => setError(null)} />
    </div>
  );
};


// =================================================================
// RENDER THE APP (from original index.tsx)
// =================================================================

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
