import { signIn, signOut, useSession } from 'next-auth/react'

export function loginWithGoogle(): void {
  void signIn('google')
}

export function loginWithEmail(): void {
  void signIn()
}

export function logout(): void {
  void signOut()
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  const session = (window as unknown as { __NEXT_AUTH_SESSION__?: unknown }).__NEXT_AUTH_SESSION__
  return Boolean(session)
}

export function useAuthSession() {
  return useSession()
}

