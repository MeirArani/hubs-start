import {
  type SubmitEventHandler,
  useCallback,
  useState,
  type ChangeEvent,
  type ReactNode,
  type ChangeEventHandler,
} from 'react';
import TextInputField from '../input/TextInputField';
import Button, { ContinueButton, NextButton } from '../input/Button';
import { Modal, type ModalProps } from '../modal/Modal';
import { CloseButton } from '../input/CloseButton';
import { Column } from '../layout/Column';
import { LegalMessage } from './LegalMessage';
import { m } from '@/paraglide/messages.js';
import { ParaglideMessage } from '@inlang/paraglide-js-react';

type SignInMessage = Exclude<
  Extract<keyof typeof m, `sign-in-modal.${string}`>,
  'sign-in-modal.wait-for-verification'
>;

export interface SubmitEmailProps {
  onSubmitEmail: (email: string) => void;
  initialEmail?: string;
  privacyUrl: string;
  termsUrl: string;
}

export function SubmitEmail({
  onSubmitEmail,
  initialEmail = '',
  privacyUrl,
  termsUrl,
}: SubmitEmailProps) {
  const [email, setEmail] = useState(initialEmail);

  const onSubmitForm = useCallback<SubmitEventHandler<HTMLFormElement>>(
    (e) => {
      e.preventDefault();
      onSubmitEmail(email);
    },
    [onSubmitEmail, email],
  );

  const onChangeEmail = useCallback<
    ChangeEventHandler<HTMLInputElement, HTMLInputElement>
  >(
    (e: ChangeEvent<HTMLInputElement>) => {
      setEmail(e.target.value);
    },
    [setEmail],
  );

  return (
    <Column as="form" center padding onSubmit={onSubmitForm} gap="2xs">
      <p>{m['sign-in-modal.prompt']()}</p>
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
  );
}

export interface WaitForVerificationProps {
  email: string;
  onCancel: () => void;
  showNewsletterSignup?: boolean;
}

export function WaitForVerification({
  email,
  onCancel,
  showNewsletterSignup = false,
}: WaitForVerificationProps) {
  return (
    <Column center padding>
      <ParaglideMessage
        message={m['sign-in-modal.wait-for-verification']}
        inputs={{ email: email }}
        markup={{ p: ({ children }) => <p>{children}</p> }}
      />
      {showNewsletterSignup && (
        <p>
          <small>
            {m['sign-in-modal.newsletter-signup-question']()}
            <br />
            <a
              href="https://eepurl.com/gX_fH9"
              target="_blank"
              rel="noopener noreferrer"
            >
              {m['sign-in-modal.newsletter-signup-link']()}
            </a>
          </small>
        </p>
      )}
      <Button preset="cancel" onClick={onCancel} />
    </Column>
  );
}

export interface SignInCompleteProps {
  onContinue: () => void;
  message: SignInMessage;
}

export function SignInComplete({ message, onContinue }: SignInCompleteProps) {
  return (
    <Column center padding>
      <p>
        <b>{message ? m[message]() : m['sign-in-modal.complete']()}</b>
      </p>
      <ContinueButton onClick={onContinue} />
    </Column>
  );
}

export interface SignInModalProps {
  closeable?: boolean;
  onClose?: React.MouseEventHandler<HTMLButtonElement>;
  children: ReactNode;
}

export function SignInModal({
  closeable = false,
  onClose,
  children,
  ...rest
}: SignInModalProps & Omit<ModalProps, 'title'>) {
  return (
    <Modal
      title={m['sign-in-modal.title']()}
      beforeTitle={closeable && <CloseButton onClick={onClose} />}
      {...rest}
    >
      {children}
    </Modal>
  );
}
