import { useCallback, type ReactNode } from 'react'
import { m } from '@/paraglide/messages.js'
import { ParaglideMessage } from '@inlang/paraglide-js-react'

export interface LegalMessageProps {
  termsUrl: string
  privacyUrl: string
}

export function LegalMessage({ termsUrl, privacyUrl }: LegalMessageProps) {
  const TosLink = useCallback(
    ({ children }: { children: ReactNode }) => (
      <a rel="noopener noreferrer" target="_blank" href={termsUrl}>
        {children}
      </a>
    ),
    [termsUrl],
  )

  const PrivacyLink = useCallback(
    ({ children }: { children: ReactNode }) => (
      <a rel="noopener noreferrer" target="_blank" href={privacyUrl}>
        {children}
      </a>
    ),
    [privacyUrl],
  )

  if (termsUrl && privacyUrl) {
    return (
      <ParaglideMessage
        message={m['legal-message.tos-and-privacy']}
        markup={{
          toslink: ({ children }) => <TosLink>{children}</TosLink>,
          privacylink: ({ children }) => <PrivacyLink>{children}</PrivacyLink>,
        }}
      />
    )
  }

  if (termsUrl && !privacyUrl) {
    return (
      <ParaglideMessage
        message={m['legal-message.tos']}
        markup={{
          toslink: ({ children }) => <TosLink>{children}</TosLink>,
        }}
      />
    )
  }

  if (!termsUrl && privacyUrl) {
    return (
      <ParaglideMessage
        message={m['legal-message.privacy']}
        markup={{
          privacylink: ({ children }) => <PrivacyLink>{children}</PrivacyLink>,
        }}
      />
    )
  }

  return null
}
