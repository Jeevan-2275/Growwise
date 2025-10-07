"use client"

export type MockUser = { id: string; name: string; email: string }

const KEY = 'gw_user_mock'

export function getUser(): MockUser | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(KEY)
  return raw ? JSON.parse(raw) as MockUser : null
}

export function signInMock(email: string, _password: string, name?: string): MockUser {
  const user: MockUser = { id: 'u_' + Math.random().toString(36).slice(2), name: name || email.split('@')[0], email }
  if (typeof window !== 'undefined') localStorage.setItem(KEY, JSON.stringify(user))
  window.dispatchEvent(new Event('gw_user_change'))
  return user
}

export function signOutMock() {
  if (typeof window !== 'undefined') localStorage.removeItem(KEY)
  window.dispatchEvent(new Event('gw_user_change'))
}

