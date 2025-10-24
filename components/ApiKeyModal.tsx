import React, { useState } from 'react';

interface ApiKeyModalProps {
  onKeySubmit: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onKeySubmit }) => {
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onKeySubmit(apiKey.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-95 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div 
        className="bg-gray-800 border border-gray-700 rounded-xl p-6 sm:p-8 max-w-lg w-full text-center shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="api-key-modal-title"
      >
        <h2 id="api-key-modal-title" className="text-2xl font-bold text-white mb-3">
          Enter Gemini API Key
        </h2>
        <p className="text-gray-400 mb-6">
          To use Excel Expert AI, please provide your Google Gemini API key. Your key is saved only in your browser and is never sent to any server other than Google's.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API key here"
            className="w-full bg-gray-700 text-white rounded-md px-4 py-3 mb-4 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-shadow"
            aria-label="Gemini API Key"
          />
          <button
            type="submit"
            disabled={!apiKey.trim()}
            className="w-full bg-green-600 text-white font-semibold py-3 px-4 rounded-md hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500"
          >
            Save and Continue
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-4">
          Don't have a key? Get one from{' '}
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-400 hover:underline"
          >
            Google AI Studio
          </a>.
        </p>
      </div>
    </div>
  );
};
