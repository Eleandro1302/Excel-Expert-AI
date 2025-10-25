import React, { useState } from 'react';
import { ChatMessage as ChatMessageType, ChatRole } from '../services/types.ts';
import { BotIcon, UserIcon, ExcelIcon, CopyIcon, CheckIcon, DownloadIcon, CodeIcon } from './IconComponents.tsx';

interface ChatMessageProps {
  message: ChatMessageType;
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

    // This regex uses capture groups to identify different parts of an Excel formula:
    // 1. Double-quoted strings
    // 2. Functions (uppercase words followed by an opening parenthesis)
    // 3. Cell ranges (e.g., A1, $B$2, C3:D4)
    // 4. Numbers
    // 5. Operators and parentheses
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
          {isCopied ? (
            <>
              <CheckIcon className="h-4 w-4 text-green-400" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <CopyIcon className="h-4 w-4" />
              <span>Copy</span>
            </>
          )}
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

    // This regex uses capture groups to identify different parts of VBA code:
    // 1. Comments (starting with ')
    // 2. Double-quoted strings
    // 3. Keywords (Sub, Dim, If, For, etc.)
    // 4. Excel Objects/Methods (Range, Cells, etc.)
    // 5. Numbers
    // 6. Operators and punctuation
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
          {isCopied ? (
            <>
              <CheckIcon className="h-4 w-4 text-green-400" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <CopyIcon className="h-4 w-4" />
              <span>Copy</span>
            </>
          )}
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
                <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white p-1.5 rounded-md bg-gray-800 hover:bg-gray-700 transition-colors"
                    aria-label="Download CSV"
                >
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

  // This regex captures excel, vba, and csv blocks
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
        // Use React.Fragment and let the parent's CSS handle whitespace.
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </>
  );
};


export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
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