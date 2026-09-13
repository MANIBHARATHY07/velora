import React from 'react';

const DEFAULT_PROMPTS = [
  'Is my clutch covered under Shield of Trust?',
  'When was my last oil change?',
  'Is my insurance still valid?',
  'What parts were replaced in my last service?',
  'When does my PUC expire?',
  'What is covered under my extended warranty?',
];

/**
 * @param {{ onSelect: (prompt: string) => void, prompts?: string[] }} props
 */
export function PromptSuggestions({ onSelect, prompts = DEFAULT_PROMPTS }) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {prompts.map((p) => (
        <button
          key={p}
          onClick={() => onSelect(p)}
          className="text-xs px-3 py-1.5 rounded-full border border-border text-textMuted hover:border-accent hover:text-text transition-colors"
        >
          {p}
        </button>
      ))}
    </div>
  );
}
