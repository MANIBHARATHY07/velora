import React from 'react';
import ReactMarkdown from 'react-markdown';

/** @param {{ content: string }} props */
export function MarkdownRenderer({ content }) {
  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
        strong: ({ children }) => <strong className="font-semibold text-text">{children}</strong>,
        ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
        li: ({ children }) => <li className="text-sm">{children}</li>,
        code: ({ inline, children }) =>
          inline ? (
            <code className="bg-surface px-1 py-0.5 rounded text-xs font-mono text-accent">{children}</code>
          ) : (
            <pre className="bg-surface p-3 rounded-lg overflow-x-auto text-xs font-mono mt-2 mb-2">
              <code>{children}</code>
            </pre>
          ),
        h1: ({ children }) => <h1 className="text-base font-semibold mb-2">{children}</h1>,
        h2: ({ children }) => <h2 className="text-sm font-semibold mb-2">{children}</h2>,
        h3: ({ children }) => <h3 className="text-sm font-medium mb-1">{children}</h3>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-accent pl-3 text-textMuted italic">{children}</blockquote>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
