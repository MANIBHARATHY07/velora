/**
 * @param {{ messages: object[], vehicleId: string, onChunk: (text: string) => void, onDone: () => void, onError: (err: Error) => void }} opts
 */
export async function sendMessage({ messages, vehicleId, onChunk, onDone, onError }) {
  try {
    const response = await fetch('/server/ai-proxy/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ messages, vehicleId }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(err || `HTTP ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') {
          onDone();
          return;
        }
        try {
          const parsed = JSON.parse(data);
          if (parsed.type === 'text' && parsed.content) {
            onChunk(parsed.content);
          }
        } catch {
          // non-JSON SSE lines — ignore
        }
      }
    }

    onDone();
  } catch (err) {
    onError(err instanceof Error ? err : new Error(String(err)));
  }
}
