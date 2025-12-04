import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  if (!content) return null;

  // Simple Markdown Parser (Headers, Bold, Lists, Paragraphs)
  const renderLine = (line: string, index: number) => {
    // Headers
    if (line.startsWith('### ')) return <h3 key={index} className="dark:text-slate-200">{parseInline(line.slice(4))}</h3>;
    if (line.startsWith('## ')) return <h2 key={index} className="dark:text-slate-100">{parseInline(line.slice(3))}</h2>;
    if (line.startsWith('# ')) return <h1 key={index} className="dark:text-white">{parseInline(line.slice(2))}</h1>;

    // Lists
    if (line.trim().startsWith('- ')) {
      return (
        <ul key={index}>
          <li className="dark:text-slate-300">{parseInline(line.trim().slice(2))}</li>
        </ul>
      );
    }
    
    // Numbered Lists (Simple check for "1. ")
    if (/^\d+\.\s/.test(line.trim())) {
       return (
         <div key={index} className="flex gap-2 mb-1">
           <span className="font-bold text-slate-700 dark:text-slate-300 select-none">{line.trim().split(' ')[0]}</span>
           <span className="dark:text-slate-300">{parseInline(line.trim().replace(/^\d+\.\s/, ''))}</span>
         </div>
       )
    }

    // Empty lines
    if (!line.trim()) return <br key={index} />;

    // Paragraphs
    return <p key={index} className="dark:text-slate-300">{parseInline(line)}</p>;
  };

  // Helper for bold/italic inline parsing
  const parseInline = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="dark:text-white">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="markdown-content text-slate-700 dark:text-slate-300 text-sm leading-7">
      {content.split('\n').map((line, i) => renderLine(line, i))}
    </div>
  );
};

export default MarkdownRenderer;