import React, { useRef, useEffect, KeyboardEvent, ChangeEvent } from 'react';
import { SendIcon, UploadIcon, FileIcon, TrashIcon, MicrophoneIcon } from './IconComponents';

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
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  isLoading, 
  file, 
  onFileChange, 
  onFileRemove,
  text,
  setText,
  isListening,
  onToggleListening,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [text]);

  const handleSubmit = () => {
    if ((text.trim() || file) && !isLoading) {
      onSendMessage();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      onFileChange(selectedFile);
    }
    // Reset file input value to allow selecting the same file again
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {file && (
        <div className="mb-2 flex items-center justify-between bg-gray-700/50 p-2 rounded-lg text-sm">
          <div className="flex items-center gap-2 truncate">
            <FileIcon className="h-5 w-5 flex-shrink-0 text-gray-400" />
            <span className="text-gray-300 truncate">{file.name}</span>
          </div>
          <button
            onClick={onFileRemove}
            className="p-1 text-gray-400 hover:text-white rounded-full hover:bg-gray-600"
            aria-label="Remove file"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      )}
      <div className="relative flex items-end bg-gray-800 rounded-xl border border-gray-700 focus-within:ring-2 focus-within:ring-green-500 transition-all duration-200">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelected}
          className="hidden"
          accept=".xlsx,.xls,.csv"
          disabled={isLoading}
        />
        <button
          onClick={handleFileButtonClick}
          disabled={isLoading}
          className="p-2 ml-2 mb-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors"
          aria-label="Attach file"
        >
          <UploadIcon className="w-5 h-5" />
        </button>
        <button
          onClick={onToggleListening}
          disabled={isLoading}
          className={`p-2 mb-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors ${isListening ? 'text-red-500' : ''}`}
          aria-label={isListening ? "Stop listening" : "Start listening"}
        >
          <MicrophoneIcon className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
        </button>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "Listening..." : "Ask anything about Excel, or upload a file..."}
          rows={1}
          className="w-full bg-transparent p-3 pr-12 text-gray-200 placeholder-gray-500 focus:outline-none resize-none max-h-48"
          disabled={isLoading}
        />
        <button
          onClick={handleSubmit}
          disabled={isLoading || (!text.trim() && !file)}
          className="absolute right-3 bottom-3 p-2 rounded-full bg-green-600 text-white disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-green-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
          aria-label="Send message"
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};