import { createContext } from 'react'

export interface AuthParams {
  topic: string
  token: string
  origin: string
  payload: string
}

export interface AuthContextParams {
  initialized: boolean
  isSignedIn: boolean
  isAdmin: boolean
  token?: string
  email: string
  userId: string
  signIn: (email: string) => Promise<void>
  verify: (authParams: AuthParams) => Promise<void>
  signOut: () => void
}

const defaultAuthContext: AuthContextParams = {
  initialized: true,
  isSignedIn: true,
  isAdmin: true,
  token: 'abc123',
  email: 'foo@bar.baz',
  userId: '00000000',
  signIn: () => new Promise<void>(() => {}), // HACK: do we really need this promise def?
  verify: () => new Promise<void>(() => {}),
  signOut: () => {},
}

export const AuthContext = createContext(defaultAuthContext)
