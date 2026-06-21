import {
  type SubmitEventHandler,
  useCallback,
  useState,
  type ChangeEvent,
  type ReactNode,
  type ChangeEventHandler,
} from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import TextInputField from '../input/TextInputField'
import { CancelButton, ContinueButton, NextButton } from '../input/Button'
import { Modal, type ModalProps } from '../modal/Modal'
import { CloseButton } from '../input/CloseButton'
import { Column } from '../layout/Column'
import { LegalMessage } from './LegalMessage'

type SignInMessage =
  | {
      kind: 'pin'
      id: 'sign-in-modal.signin-message.pin'
      defaultMessage: "You'll need to sign in to pin objects."
    }
  | {
      kind: 'unpin'
      id: 'sign-in-modal.signin-message.unpin'
      defaultMessage: "You'll need to sign in to un-pin objects."
    }
  | {
      kind: 'changeScene'
      id: 'sign-in-modal.signin-message.change-scene'
      defaultMessage: "You'll need to sign in to change the scene."
    }
  | {
      kind: 'roomSettings'
      id: 'sign-in-modal.signin-message.room-settings'
      defaultMessage: "You'll need to sign in to change the room's settings."
    }
  | {
      kind: 'closeRoom'
      id: 'sign-in-modal.signin-message.close-room'
      defaultMessage: "You'll need to sign in to close the room."
    }
  | {
      kind: 'muteUser'
      id: 'sign-in-modal.signin-message.mute-user'
      defaultMessage: "You'll need to sign in to mute other users."
    }
  | {
      kind: 'kickUser'
      id: 'sign-in-modal.signin-message.kick-user'
      defaultMessage: "You'll need to sign in to kick other users."
    }
  | {
      kind: 'addOwner'
      id: 'sign-in-modal.signin-message.add-owner'
      defaultMessage: "You'll need to sign in to assign moderators."
    }
  | {
      kind: 'removeOwner'
      id: 'sign-in-modal.signin-message.remove-owner'
      defaultMessage: "You'll need to sign in to assign moderators."
    }
  | {
      kind: 'createAvatar'
      id: 'sign-in-modal.signin-message.create-avatar'
      defaultMessage: "You'll need to sign in to create avatars."
    }
  | {
      kind: 'remixAvatar'
      id: 'sign-in-modal.signin-message.remix-avatar'
      defaultMessage: "You'll need to sign in to remix avatars."
    }
  | {
      kind: 'remixScene'
      id: 'sign-in-modal.signin-message.remix-scene'
      defaultMessage: "You'll need to sign in to remix scenes."
    }
  | {
      kind: 'favoriteRoom'
      id: 'sign-in-modal.signin-message.favorite-room'
      defaultMessage: "You'll need to sign in to add this room to your favorites."
    }
  | {
      kind: 'favoriteRooms'
      id: 'sign-in-modal.signin-message.favorite-rooms'
      defaultMessage: "You'll need to sign in to add favorite rooms."
    }
  | {
      kind: 'tweet'
      id: 'sign-in-modal.signin-message.tweet'
      defaultMessage: "You'll need to sign in to send tweets."
    }

export interface SubmitEmailProps {
  onSubmitEmail: (email: string) => void
  message?: SignInMessage
  initialEmail?: string
  privacyUrl: string
  termsUrl: string
}

export function SubmitEmail({
  onSubmitEmail,
  initialEmail = '',
  privacyUrl,
  termsUrl,
  message,
}: SubmitEmailProps) {
  const intl = useIntl()
  const [email, setEmail] = useState(initialEmail)

  const onSubmitForm = useCallback<SubmitEventHandler<HTMLFormElement>>(
    (e) => {
      e.preventDefault()
      onSubmitEmail(email)
    },
    [onSubmitEmail, email],
  )

  const onChangeEmail = useCallback<
    ChangeEventHandler<HTMLInputElement, HTMLInputElement>
  >(
    (e: ChangeEvent<HTMLInputElement>) => {
      setEmail(e.target.value)
    },
    [setEmail],
  )

  return (
    <Column as="form" center padding onSubmit={onSubmitForm}>
      <p>
        {message ? (
          intl.formatMessage(message)
        ) : (
          <FormattedMessage
            id="sign-in-modal.prompt"
            defaultMessage="Please Sign In"
          />
        )}
      </p>
      <TextInputField
        name="email"
        type="email"
        required
        value={email}
        onChange={onChangeEmail}
        placeholder="example@example.com"
      />
      <p>
        <small>
          <LegalMessage termsUrl={termsUrl} privacyUrl={privacyUrl} />
        </small>
      </p>
      <NextButton />
    </Column>
  )
}

export interface WaitForVerificationProps {
  email: string
  onCancel: () => void
  showNewsletterSignup?: boolean
}

export function WaitForVerification({
  email,
  onCancel,
  showNewsletterSignup = false,
}: WaitForVerificationProps) {
  return (
    <Column center padding>
      <FormattedMessage
        id="sign-in-modal.wait-for-verification"
        defaultMessage="<p>Email sent to {email}!</p><p>To continue, click on the link in the email using your phone, tablet, or PC.</p><p>No email? You may not be able to create an account.</p>"
        values={{ email, p: (chunks) => <p>{chunks}</p> }}
      />
      {showNewsletterSignup && (
        <p>
          <small>
            <FormattedMessage
              id="sign-in-modal.newsletter-signup-question"
              defaultMessage="Want Hubs news sent to your inbox?"
            />
            <br />
            <a
              href="https://eepurl.com/gX_fH9"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FormattedMessage
                id="sign-in-modal.newsletter-signup-link"
                defaultMessage="Subscribe for updates"
              />
            </a>
          </small>
        </p>
      )}
      <CancelButton onClick={onCancel} />
    </Column>
  )
}

export interface SignInCompleteProps {
  onContinue: () => void
  message?: SignInMessage
}

export function SignInComplete({ message, onContinue }: SignInCompleteProps) {
  const intl = useIntl()

  return (
    <Column center padding>
      <p>
        <b>
          {message ? (
            intl.formatMessage(message)
          ) : (
            <FormattedMessage
              id="sign-in-modal.complete"
              defaultMessage="You are now signed in."
            />
          )}
        </b>
      </p>
      <ContinueButton onClick={onContinue} />
    </Column>
  )
}

export interface SignInModalProps {
  closeable?: boolean
  onClose?: React.MouseEventHandler<HTMLButtonElement>
  children: ReactNode
}

export function SignInModal({
  closeable = false,
  onClose,
  children,
  ...rest
}: SignInModalProps & Omit<ModalProps, 'title'>) {
  return (
    <Modal
      title={
        <FormattedMessage id="sign-in-modal.title" defaultMessage="Sign In" />
      }
      beforeTitle={closeable && <CloseButton onClick={onClose} />}
      {...rest}
    >
      {children}
    </Modal>
  )
}
