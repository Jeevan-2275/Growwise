"use client"

import { Drawer, Box, Typography, IconButton, Divider } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useEffect, useMemo, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const STORAGE_KEY = 'gw_chat_mock'

interface Message { id: string; role: 'user' | 'assistant'; content: string }

export default function ChatDrawer() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) setMessages(JSON.parse(saved))
    const handler = () => setOpen(true)
    window.addEventListener('gw_open_chat' as any, handler)
    return () => window.removeEventListener('gw_open_chat' as any, handler)
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  }, [messages])

  const send = async () => {
    const text = input.trim()
    if (!text) return
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text }
    setMessages(m => [...m, userMsg])
    setInput('')
    // mock typing effect
    const assistantId = crypto.randomUUID()
    const chunks = [
      'Analyzing your question...',
      'Considering market context...',
      'Here is an insight based on your query.',
    ]
    for (const chunk of chunks) {
      await new Promise(r => setTimeout(r, 400))
      setMessages(m => {
        const existing = m.find(msg => msg.id === assistantId)
        if (existing) return m.map(msg => msg.id === assistantId ? { ...msg, content: msg.content + '\n\n' + chunk } : msg)
        return [...m, { id: assistantId, role: 'assistant', content: chunk }]
      })
    }
  }

  return (
    <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
      <Box sx={{ width: { xs: 340, sm: 420 }, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" sx={{ flex: 1 }}>Growwise AI</Typography>
          <IconButton onClick={() => setOpen(false)}><CloseIcon /></IconButton>
        </Box>
        <Divider />
        <Box sx={{ p: 2, flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
          {messages.map(m => (
            <Box key={m.id} sx={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', bgcolor: m.role === 'user' ? 'primary.main' : 'action.hover', color: m.role === 'user' ? 'primary.contrastText' : 'text.primary', p: 1.5, borderRadius: 2, maxWidth: '85%' }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
            </Box>
          ))}
        </Box>
        <Divider />
        <Box sx={{ p: 1.5, display: 'flex', gap: 1 }}>
          <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about funds, SIP, returns..." style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid rgba(0,0,0,0.12)' }} />
          <button onClick={send} style={{ padding: '10px 14px', borderRadius: 8, background: '#1976D2', color: 'white', border: 'none' }}>Send</button>
        </Box>
      </Box>
    </Drawer>
  )
}

