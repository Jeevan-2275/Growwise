'use client';

import {
  Box, IconButton, Stack, TextField, Tooltip, CircularProgress, Chip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import StopIcon from '@mui/icons-material/Stop';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useEffect, useMemo, useRef, useState } from 'react';
import MessageList from './MessageList';

type Msg = { id: string; role: 'user' | 'assistant' | 'system'; content: string };

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export default function Chat() {
  const [messages, setMessages] = useState<Msg[]>(() => {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem('gw_chat');
    return raw ? JSON.parse(raw) : [];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    localStorage.setItem('gw_chat', JSON.stringify(messages));
  }, [messages]);

  const displayMsgs = useMemo(
    () => messages.filter((m) => m.role !== 'system') as Msg[],
    [messages]
  ) as any;

  const suggestions = [
    'What is a good SIP for Rs 10k/month for 10 years?',
    'Compare Nifty 50 index funds with lowest expense ratio',
    'Explain SWP tax impact for retirees',
  ];

  async function streamSSE(body: any, onText: (delta: string) => void) {
    const controller = new AbortController();
    abortRef.current = controller;

    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok || !res.body) throw new Error('Stream error');

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // Parse SSE frames
      let idx;
      while ((idx = buffer.indexOf('\n\n')) !== -1) {
        const frame = buffer.slice(0, idx).trim();
        buffer = buffer.slice(idx + 2);
        const lines = frame.split('\n');
        let event = 'message';
        let data = '';
        for (const line of lines) {
          if (line.startsWith('event:')) event = line.replace('event:', '').trim();
          if (line.startsWith('data:')) data += line.replace('data:', '').trim();
        }
        if (event === 'error') throw new Error(data);
        if (data) {
          try {
            const obj = JSON.parse(data);
            if (obj.text) onText(obj.text);
          } catch {
            onText(data);
          }
        }
      }
    }
  }

  async function send(prompt?: string) {
    const content = (prompt ?? input).trim();
    if (!content) return;

    const userMsg: Msg = { id: uid(), role: 'user', content };
    const draftId = uid();
    const assistantDraft: Msg = { id: draftId, role: 'assistant', content: '' };

    setMessages((prev) => [...prev, userMsg, assistantDraft]);
    setInput('');
    setLoading(true);

    try {
      await streamSSE(
        { messages: [...messages, userMsg] },
        (delta) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === draftId ? { ...m, content: m.content + delta } : m))
          );
        }
      );
    } catch (e) {
      setMessages((prev) =>
        prev.map((m) => (m.id === draftId ? { ...m, content: 'Sorry, something went wrong.' } : m))
      );
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }

  function stop() {
    abortRef.current?.abort();
  }

  function reset() {
    setMessages([]);
    setInput('');
  }

  return (
    <Stack spacing={2}>
      {displayMsgs.length === 0 && (
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {suggestions.map((s) => (
            <Chip key={s} label={s} variant="outlined" onClick={() => send(s)} />
          ))}
        </Stack>
      )}

      <MessageList messages={displayMsgs as any} />

      <Box
        sx={{
          display: 'flex',
          gap: 1,
          alignItems: 'center',
          border: '1px solid #e5e8ec',
          borderRadius: 2,
          p: 1,
        }}
      >
        <TextField
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about SIPs, funds, returns..."
          variant="outlined"
          size="small"
          fullWidth
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <Tooltip title="Reset">
          <span>
            <IconButton onClick={reset} disabled={loading}>
              <RestartAltIcon />
            </IconButton>
          </span>
        </Tooltip>
        {loading ? (
          <Tooltip title="Stop">
            <IconButton color="warning" onClick={stop}>
              <StopIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Send">
            <IconButton color="primary" onClick={() => send()}>
              <SendIcon />
            </IconButton>
          </Tooltip>
        )}
        {loading && <CircularProgress size={20} />}
      </Box>
    </Stack>
  );
}