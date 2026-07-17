import { useCallback, useContext, useEffect, useReducer } from 'react'
import { AuthContext } from './AuthContext'
import { redirect } from '@tanstack/react-router'
import { SignInModal, SubmitEmail, WaitForVerification } from './SignInModal'

type SignInAction =
  | {
      type: 'submitEmail'
      email: string
    }
  | { type: 'verificationReceived' }
  | { type: 'cancel' }

export type SignInStep = 'submit' | 'waitForVerification' | 'complete'

interface SignInState {
  step: 'submit' | 'waitForVerification' | 'complete'
  email: string
}

const initialSignInState: SignInState = {
  step: 'submit',
  email: '',
}

function loginReducer(state: SignInState, action: SignInAction): SignInState {
  switch (action.type) {
    case 'submitEmail': {
      return { step: 'waitForVerification', email: action.email }
    }
    case 'verificationReceived': {
      return { ...state, step: 'complete' }
    }
    case 'cancel': {
      return { ...state, step: 'submit' }
    }
  }
}

function useSignIn() {
  const auth = useContext(AuthContext)
  const [state, dispatch] = useReducer(loginReducer, initialSignInState)

  const submitEmail = useCallback(
    (email: string) => {
      auth.signIn(email).then(() => {
        dispatch({ type: 'verificationReceived' })
      })
      dispatch({ type: 'submitEmail', email })
    },
    [auth],
  )

  const cancel = useCallback(() => {
    dispatch({ type: 'cancel' })
  }, [])
  return {
    step: state.step,
    email: state.email,
    submitEmail,
    cancel,
  }
}

export function SignInModalContainer() {
  const qs = new URLSearchParams(location.search)
  const { step, submitEmail, cancel, email } = useSignIn()
  const redirectUrl = qs.get('sign_in_destination_url') || '/'

  useEffect(() => {
    if (step === 'complete') {
      redirect({ to: '/' })
    }
  }, [step, redirectUrl])

  return (
    <SignInModal disableFullscreen>
      {step === 'submit' ? (
        <SubmitEmail
          onSubmitEmail={submitEmail}
          initialEmail={email}
          termsUrl="..."
          privacyUrl="..."
        />
      ) : (
        <WaitForVerification
          onCancel={cancel}
          email={email}
          showNewsletterSignup={false}
        />
      )}
    </SignInModal>
  )
}
