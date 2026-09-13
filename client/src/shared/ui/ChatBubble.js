import React from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';

/**
 * @param {{ role: 'user'|'assistant', content: string }} props
 */
export function ChatBubble({ role, content }) {
  const isUser = role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
          isUser
            ? 'bg-accent text-white rounded-br-sm'
            : 'bg-surfaceElevated text-text rounded-bl-sm border border-border'
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{content}</p>
        ) : (
          <MarkdownRenderer content={content} />
        )}
      </div>
    </div>
  );
}
