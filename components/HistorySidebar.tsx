
import React, 'react';
import { Conversation } from '../types';
import { PlusIcon, MessageSquareIcon, TrashIcon, ExcelIcon } from './IconComponents';

interface HistorySidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onNewChat: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    conversationTitle: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, conversationTitle }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div 
                className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm border border-gray-700"
                onClick={e => e.stopPropagation()} // Prevent closing when clicking inside the modal
            >
                <h2 id="modal-title" className="text-lg font-bold text-white mb-2">Confirm Deletion</h2>
                <p className="text-sm text-gray-400 mb-6">
                    Are you sure you want to delete the chat titled "{conversationTitle}"? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500 transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};


export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onDeleteConversation,
  onNewChat,
  isOpen,
  setIsOpen
}) => {
  const [conversationToDelete, setConversationToDelete] = React.useState<Conversation | null>(null);
    
  const requestDelete = (convo: Conversation) => {
      setConversationToDelete(convo);
  };

  const confirmDelete = () => {
      if (conversationToDelete) {
          onDeleteConversation(conversationToDelete.id);
          setConversationToDelete(null);
      }
  };

  const cancelDelete = () => {
      setConversationToDelete(null);
  };

  return (
    <>
        {/* Overlay for mobile */}
        <div 
            className={`fixed inset-0 bg-black/60 z-20 lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setIsOpen(false)}
        ></div>

        <aside className={`absolute lg:static inset-y-0 left-0 z-30 flex flex-col w-64 bg-gray-800 border-r border-gray-700/50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
            <div className="flex items-center justify-between p-4 border-b border-gray-700/50 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <ExcelIcon className="h-6 w-6 text-green-400" />
                    <span className="font-semibold text-white">Chat History</span>
                </div>
                <button
                    onClick={onNewChat}
                    className="flex items-center gap-1 p-2 text-sm bg-green-600/80 text-white rounded-md hover:bg-green-600"
                    aria-label="Start new chat"
                >
                    <PlusIcon className="h-4 w-4" />
                </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-2 space-y-1">
                {conversations.length > 0 ? (
                    conversations.map((convo) => (
                        <div
                            key={convo.id}
                            className={`group flex items-center justify-between w-full rounded-md text-sm transition-colors ${
                                activeConversationId === convo.id
                                ? 'bg-green-800/50 text-white'
                                : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
                            }`}
                        >
                            <button
                                onClick={() => onSelectConversation(convo.id)}
                                className="flex items-center gap-2 truncate w-full h-full px-3 py-2 text-left"
                                aria-label={`Select conversation: ${convo.title}`}
                            >
                                <MessageSquareIcon className="h-4 w-4 flex-shrink-0" />
                                <span className="truncate">{convo.title}</span>
                            </button>
                            <button 
                                onClick={() => requestDelete(convo)}
                                className="p-1 mr-2 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 focus:opacity-100 flex-shrink-0"
                                aria-label={`Delete conversation: ${convo.title}`}
                            >
                                <TrashIcon className="h-4 w-4" />
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-xs text-gray-500 p-4">
                        No chat history yet. Start a new conversation!
                    </div>
                )}
            </nav>
        </aside>

        <ConfirmationModal
            isOpen={!!conversationToDelete}
            onClose={cancelDelete}
            onConfirm={confirmDelete}
            conversationTitle={conversationToDelete?.title || ''}
        />
    </>
  );
};
