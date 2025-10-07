'use client';

import { Avatar, Box, Stack, Typography } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

type Msg = { id: string; role: 'user' | 'assistant'; content: string };

export default function MessageList({ messages }: { messages: Msg[] }) {
  return (
    <Stack spacing={2}>
      {messages.map((m) => (
        <Stack key={m.id} direction="row" spacing={2} alignItems="flex-start">
          <Avatar sx={{ bgcolor: m.role === 'assistant' ? 'primary.main' : 'grey.700' }}>
            {m.role === 'assistant' ? 'AI' : 'U'}
          </Avatar>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: m.role === 'assistant' ? '#f4fff6' : '#f5f5f5',
              border: '1px solid',
              borderColor: m.role === 'assistant' ? 'success.light' : 'grey.300',
              maxWidth: '100%',
              width: '100%',
              overflowX: 'auto',
            }}
          >
            <Typography component="div" sx={{ whiteSpace: 'pre-wrap' }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                {m.content}
              </ReactMarkdown>
            </Typography>
          </Box>
        </Stack>
      ))}
    </Stack>
  );
}