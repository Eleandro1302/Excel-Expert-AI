
import React from 'react';
import { ExcelIcon } from './IconComponents';

interface WelcomeScreenProps {
  onPromptClick: (prompt: string) => void;
}

const examplePrompts = [
  "How do I use VLOOKUP?",
  "Create a VBA macro to sort data in column A.",
  "What is a Pivot Table?",
  "Explain the SUMIF function with an example."
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onPromptClick }) => {
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