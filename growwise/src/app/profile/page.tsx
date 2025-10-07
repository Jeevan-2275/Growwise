"use client"

import { useEffect, useState } from 'react'
import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material'
import { getUser, signInMock, signOutMock } from '@/lib/mockSession'

export default function ProfilePage() {
  const [user, setUser] = useState(getUser())
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')

  useEffect(() => {
    const h = () => setUser(getUser())
    window.addEventListener('gw_user_change', h as any)
    return () => window.removeEventListener('gw_user_change', h as any)
  }, [])

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>Profile</Typography>
      {user ? (
        <Stack spacing={2}>
          <Typography>Name: {user.name}</Typography>
          <Typography>Email: {user.email}</Typography>
          <Button variant="outlined" onClick={() => { signOutMock() }}>Sign out</Button>
        </Stack>
      ) : (
        <Stack spacing={2}>
          <TextField label="Name" value={name} onChange={e => setName(e.target.value)} />
          <TextField label="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <Button variant="contained" onClick={() => signInMock(email, 'password', name)}>Sign in (mock)</Button>
        </Stack>
      )}
    </Paper>
  )
}

