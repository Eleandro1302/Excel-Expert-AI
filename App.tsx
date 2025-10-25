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

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { streamChatResponse, generateTitle, startNewGeminiChatWithHistory } from './services/geminiService.ts';
import { ChatMessage as ChatMessageType, ChatRole, Conversation } from './services/types.ts';
import { Header } from './components/Header.tsx';
import { ChatMessage } from './components/ChatMessage.tsx';
import { ChatInput } from './components/ChatInput.tsx';
import { WelcomeScreen } from './components/WelcomeScreen.tsx';
import { HistorySidebar } from './components/HistorySidebar.tsx';
import { XIcon } from './components/IconComponents.tsx';
import * as XLSX from 'xlsx';

// Error Toast Component for prominent error display
interface ErrorToastProps {
    message: string | null;
    onClose: () => void;
}

const ErrorToast: React.FC<ErrorToastProps> = ({ message, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (message) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                handleClose();
            }, 8000); // Auto-dismiss after 8 seconds
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
        }
    }, [message]);
    
    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    if (!message) {
        return null;
    }

    return (
        <div 
            className={`fixed bottom-5 right-5 max-w-sm w-full bg-red-800 border border-red-600 text-white p-4 rounded-lg shadow-2xl transition-all duration-300 ease-in-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} z-50`}
            role="alert"
            aria-live="assertive"
        >
            <div className="flex items-start">
                <div className="flex-1">
                    <p className="font-bold text-red-200">An Error Occurred</p>
                    <p className="text-sm text-red-300 mt-1">{message}</p>
                </div>
                <button 
                    onClick={handleClose} 
                    className="ml-4 p-1 rounded-full text-red-300 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-white"
                    aria-label="Close error message"
                >
                    <XIcon className="h-5 w-5" />
                </button>
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

  // Load conversations from localStorage on initial render
  useEffect(() => {
    try {
        const savedConversations = localStorage.getItem('excel-expert-conversations');
        if (savedConversations) {
            setConversations(JSON.parse(savedConversations));
        }
    } catch (e) {
        console.error("Failed to load conversations from localStorage", e);
        setError("Could not load your saved chat history.");
    }
  }, []);

  // Save conversations to localStorage whenever they change
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

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      console.warn("Speech recognition is not supported by this browser.");
      return;
    }
    
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'pt-BR';

    recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('');
        setText(transcript);
    };

    recognition.onerror = (event) => {
        console.error('Speech Recognition Error:', event.error);
        setError(`Speech recognition failed: ${event.error}`);
        setIsListening(false);
    };

    recognition.onend = () => {
        setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const activeMessages = useMemo(() => {
    return conversations.find(c => c.id === activeConversationId)?.messages || [];
  }, [conversations, activeConversationId]);

  const sendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim() && !file) return;

    setIsLoading(true);
    setError(null);
    if (isListening) {
        recognitionRef.current?.stop();
    }
    
    let currentConversationId = activeConversationId;
    const isNewConversation = !currentConversationId;
    let messageContent = messageText;

    // File Processing
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

    const userMessage: ChatMessageType = { role: ChatRole.USER, content: messageContent };
    
    const historyForApi = isNewConversation 
        ? [] 
        : conversations.find(c => c.id === currentConversationId)?.messages || [];
    
    if (isNewConversation) {
        const newId = Date.now().toString();
        const newConversation: Conversation = {
            id: newId,
            title: messageText.substring(0, 40) + '...', // Temporary title
            messages: [userMessage]
        };
        setConversations(prev => [newConversation, ...prev]);
        setActiveConversationId(newId);
        currentConversationId = newId;

        generateTitle(messageText)
          .then(title => {
              setConversations(prev => prev.map(conv => 
                  conv.id === newId ? { ...conv, title } : conv
              ));
          })
          .catch(err => console.error("Failed to generate title", err));
    } else {
        setConversations(prev => prev.map(conv =>
            conv.id === currentConversationId ? { ...conv, messages: [...conv.messages, userMessage] } : conv
        ));
    }

    setFile(null);
    setText('');

    setConversations(prev => prev.map(conv =>
        conv.id === currentConversationId ? { ...conv, messages: [...conv.messages, { role: ChatRole.MODEL, content: '' }] } : conv
    ));

    try {
        const chat = startNewGeminiChatWithHistory(historyForApi);
        const stream = streamChatResponse(chat, messageContent);

        for await (const chunk of stream) {
            setConversations(prev => prev.map(conv => {
                if (conv.id !== currentConversationId) return conv;
                const lastMessage = conv.messages[conv.messages.length - 1];
                const updatedMessages = [
                    ...conv.messages.slice(0, -1),
                    { ...lastMessage, content: lastMessage.content + chunk }
                ];
                return { ...conv, messages: updatedMessages };
            }));
        }
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.';
        setError(errorMessage);
        setConversations(prev => prev.map(conv => {
            if (conv.id !== currentConversationId) return conv;
            const lastMessage = conv.messages[conv.messages.length - 1];
            if (lastMessage.content.includes('**Error:**')) return conv;
            const updatedMessages = [
                ...conv.messages.slice(0, -1),
                { ...lastMessage, content: lastMessage.content + `\n\n**Erro:** ${errorMessage}` }
            ];
            return { ...conv, messages: updatedMessages };
        }));
    } finally {
        setIsLoading(false);
    }
  }, [activeConversationId, conversations, file, isListening]);

  const handleFormSubmit = () => {
      sendMessage(text);
  };

  const startNewChat = () => {
    setActiveConversationId(null);
    setError(null);
    setFile(null);
    setText('');
    setIsSidebarOpen(false);
  };

  const selectConversation = (id: string) => {
    setActiveConversationId(id);
    setIsSidebarOpen(false);
  };
  
  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConversationId === id) {
        setActiveConversationId(null);
    }
  };

  const handleToggleListening = () => {
      if (!recognitionRef.current) return;
      if (isListening) {
          recognitionRef.current.stop();
      } else {
          setText('');
          recognitionRef.current.start();
          setIsListening(true);
      }
  };

  return (
    <div className="max-w-screen-2xl mx-auto">
        <div className="flex h-screen bg-gray-900 text-white font-sans overflow-hidden">
            <HistorySidebar 
                conversations={conversations}
                activeConversationId={activeConversationId}
                onSelectConversation={selectConversation}
                onDeleteConversation={deleteConversation}
                onNewChat={startNewChat}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
            />
            <div className="flex flex-col flex-1 min-w-0">
                <Header onNewChat={startNewChat} onToggleSidebar={() => setIsSidebarOpen(prev => !prev)} />
                <main ref={chatContainerRef} className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 space-y-6">
                {activeMessages.length === 0 ? (
                    <WelcomeScreen onPromptClick={sendMessage} />
                ) : (
                    activeMessages.map((msg, index) => (
                    <ChatMessage key={index} message={msg} />
                    ))
                )}
                </main>
                <div className="p-2 sm:p-4 md:p-6 bg-gray-900 border-t border-gray-700/50">
                <ChatInput 
                    onSendMessage={handleFormSubmit} 
                    isLoading={isLoading}
                    file={file}
                    onFileChange={setFile}
                    onFileRemove={() => setFile(null)}
                    text={text}
                    setText={setText}
                    isListening={isListening}
                    onToggleListening={handleToggleListening}
                />
                </div>
            </div>
        </div>
        <ErrorToast message={error} onClose={() => setError(null)} />
    </div>
  );
};

export default App;