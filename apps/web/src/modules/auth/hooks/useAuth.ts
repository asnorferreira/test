'use client'

import { useCallback, useEffect, useState } from 'react'
import { clearSession, getSession, isAdmin, isDoctor, isPatient, type Session } from '../services/auth.api'

export function useAuth() {
  const [session, setSessionState] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    setSessionState(getSession())
  }, [])

  const refresh = useCallback(() => {
    setSessionState(getSession())
  }, [])

  const signOut = useCallback(() => {
    clearSession()
    setSessionState(null)
  }, [])

  return {
    session,
    loading: session === undefined,
    refresh,
    signOut,
    isDoctor: isDoctor(session ?? null),
    isPatient: isPatient(session ?? null),
    isAdmin: isAdmin(session ?? null),
  }
}
