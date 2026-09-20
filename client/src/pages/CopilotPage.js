import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bot, ChevronDown } from 'lucide-react';
import { addMessage, setStreaming, updateLastMessage, clearHistory, setVehicle } from '../store/slices/chatSlice';
import { sendMessage } from '../ai/copilot/stream-client';
import { useVehicles } from '../features/vehicles/hooks/use-vehicles';
import { ChatBubble } from '../shared/ui/ChatBubble';
import { ChatInput } from '../shared/ui/ChatInput';
import { TypingIndicator } from '../shared/ui/TypingIndicator';
import { PromptSuggestions } from '../shared/ui/PromptSuggestions';

export function CopilotPage() {
  const dispatch = useDispatch();
  const { messages, isStreaming, selectedVehicleId } = useSelector((s) => s.chat);
  const globalSelectedVehicleId = useSelector((s) => s.vehicle.selectedVehicleId);
  const userId = useSelector((s) => s.settings.userId);
  const { data: vehicles = [] } = useVehicles();

  const [input, setInput] = useState('');
  const bottomRef = useRef(null);
  const vehicleId = selectedVehicleId || globalSelectedVehicleId;

  useEffect(() => {
    if (!selectedVehicleId && globalSelectedVehicleId) {
      dispatch(setVehicle(globalSelectedVehicleId));
    }
  }, [globalSelectedVehicleId, selectedVehicleId, dispatch]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  async function handleSubmit() {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput('');

    dispatch(addMessage({ role: 'user', content: text }));
    dispatch(setStreaming(true));
    dispatch(addMessage({ role: 'assistant', content: '' }));

    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    history.push({ role: 'user', content: text });

    let accumulated = '';

    await sendMessage({
      messages: history,
      vehicleId,
      userId,
      onChunk: (chunk) => {
        accumulated += chunk;
        dispatch(updateLastMessage(accumulated));
      },
      onDone: () => {
        dispatch(setStreaming(false));
      },
      onError: (err) => {
        dispatch(updateLastMessage(`Sorry, something went wrong: ${err.message}`));
        dispatch(setStreaming(false));
      },
    });
  }

  const vehicle = vehicles.find((v) => v.id === vehicleId);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-surface/50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center">
            <Bot size={15} className="text-accent" />
          </div>
          <span className="text-sm font-medium text-text">Velora Copilot</span>
        </div>
        <div className="flex items-center gap-2">
          {vehicles.length > 1 && (
            <div className="relative">
              <select
                value={vehicleId || ''}
                onChange={(e) => dispatch(setVehicle(e.target.value))}
                className="text-xs bg-surfaceElevated border border-border rounded-md pl-2 pr-6 py-1 text-text appearance-none cursor-pointer"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>{v.brand} {v.model}</option>
                ))}
              </select>
              <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-textMuted pointer-events-none" />
            </div>
          )}
          {vehicle && (
            <span className="text-xs text-textMuted bg-surfaceElevated px-2 py-0.5 rounded-full">
              {vehicle.brand} {vehicle.model}
            </span>
          )}
          {messages.length > 0 && (
            <button
              onClick={() => dispatch(clearHistory())}
              className="text-xs text-textMuted hover:text-text transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
                <Bot size={28} className="text-accent" />
              </div>
              <h2 className="text-base font-semibold text-text mb-1">Ask Velora</h2>
              <p className="text-sm text-textMuted max-w-sm">
                Ask anything about your vehicle — coverage, service history, expiry dates, and more.
              </p>
            </div>
            <PromptSuggestions onSelect={(p) => { setInput(p); }} />
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              msg.content !== '' || msg.role === 'user' ? (
                <ChatBubble key={i} role={msg.role} content={msg.content} />
              ) : null
            ))}
            {isStreaming && messages[messages.length - 1]?.content === '' && <TypingIndicator />}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-5 pb-5 pt-2 border-t border-border">
        <ChatInput
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          disabled={isStreaming}
        />
        {!vehicleId && (
          <p className="text-xs text-warning mt-2 text-center">Select a vehicle to get personalized answers</p>
        )}
      </div>
    </div>
  );
}
