import { m } from '#/paraglide/messages';
import { useClipboard } from 'use-clipboard-copy';
import TextInputField, { type TextInputFieldProps } from './TextInputField';
import Button, { type ButtonPreset } from './Button';

interface CopyableTextInputFieldProps extends TextInputFieldProps {
  buttonPreset?: ButtonPreset;
}

export function CopyableTextInputField({
  buttonPreset,
  ...rest
}: CopyableTextInputFieldProps) {
  const clipboard = useClipboard({
    copiedTimeout: 600,
  });

  const copyLabel = m['copyable-text-input-field.copy-label']();
  const copiedLabel = m['copyable-text-input-field.copied-label']();

  const maxLabelLength = Math.max(copyLabel.length, copiedLabel.length);

  return (
    <TextInputField
      ref={clipboard.target}
      afterInput={
        clipboard.isSupported() ? (
          <Button
            preset={buttonPreset}
            onClick={clipboard.copy}
            className="box-content"
            style={{
              width: `${maxLabelLength}ch`,
              minWidth: 'auto',
              padding: '0 16px',
            }}
          >
            {clipboard.copied ? copiedLabel : copyLabel}
          </Button>
        ) : undefined
      }
      {...rest}
    />
  );
}
