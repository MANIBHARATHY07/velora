import React, { useRef } from 'react';
import { Send } from 'lucide-react';

/**
 * @param {{ value: string, onChange: (v: string) => void, onSubmit: () => void, disabled?: boolean, placeholder?: string }} props
 */
export function ChatInput({ value, onChange, onSubmit, disabled, placeholder = 'Ask Velora anything about your vehicle…' }) {
  const textareaRef = useRef(null);

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) onSubmit();
    }
  }

  return (
    <div className="flex items-end gap-2 bg-surfaceElevated border border-border rounded-xl p-2">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 bg-transparent text-sm text-text placeholder-textMuted resize-none max-h-32 py-1 px-1 focus:outline-none"
        style={{ fieldSizing: 'content' }}
      />
      <button
        onClick={onSubmit}
        disabled={!value.trim() || disabled}
        className="p-2 rounded-lg bg-accent text-white disabled:opacity-40 hover:bg-accent/80 transition-colors flex-shrink-0"
      >
        <Send size={15} />
      </button>
    </div>
  );
}
