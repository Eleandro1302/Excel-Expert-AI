import React from 'react';
import { ExcelIcon, PlusIcon, MenuIcon } from './IconComponents.tsx';

interface HeaderProps {
    onNewChat: () => void;
    onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNewChat, onToggleSidebar }) => {
  return (
    <header className="flex items-center justify-between p-2 sm:p-4 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-10 flex-shrink-0">
      <div className="flex items-center gap-3">
        <button 
          onClick={onToggleSidebar}
          className="p-2 -ml-2 text-gray-400 hover:text-white lg:hidden"
          aria-label="Open chat history"
        >
          <MenuIcon className="h-6 w-6" />
        </button>
        <ExcelIcon className="h-8 w-8 text-green-400 hidden sm:block" />
        <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-200 tracking-tight">Excel Expert AI</h1>
            <p className="text-xs text-gray-400">by Eleandro</p>
        </div>
      </div>
       <button 
        onClick={onNewChat}
        className="flex items-center gap-2 px-4 py-2 bg-green-600/80 hover:bg-green-600 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
      >
        <PlusIcon className="h-5 w-5" />
        <span className="hidden sm:inline">New Chat</span>
      </button>
    </header>
  );
};