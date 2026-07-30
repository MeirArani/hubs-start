import { useSelect, type UseSelectProps } from 'downshift';
import InputField from './InputField';
import { m } from '#/paraglide/messages';
import CaretDownIcon from '../icons/CaretDown.svg?react';
import type { ReactNode } from 'react';

type ItemType = string | { value: string; label?: string };

function getItemValue(item: ItemType) {
  return typeof item === 'object' ? item.value : item;
}

function getSelectedItem(value: ItemType, options: ItemType[]) {
  const selectedItemValue = getItemValue(value);

  if (options.length > 0 && typeof options[0] === 'object') {
    return options.find(
      (item) => (item as { value: string }).value === selectedItemValue,
    );
  }

  return selectedItemValue;
}

function getItemLabel(item?: ItemType | null) {
  if (item === null || item === undefined) {
    console.warn(
      "Cannot get the label for the selected item for this SelectInputField because there is no selected item.  This probably indicates a bug somewhere, unless you're rendering one of the Storybook stories for the SelectInputField control that contains controls with no default selected item.",
    );
    return '';
  }
  return typeof item === 'object' ? item.label || item.value : item;
}

export interface SelectInputFieldProps extends UseSelectProps<ItemType> {
  className?: string;
  label?: ReactNode;
  error?: ReactNode;
  description?: ReactNode;
  labelClassName?: string;
  inputClassName?: string;
  buttonClassName?: string;
  value: ItemType;
  options: ItemType[];
  onChange?: (item: string) => void;
  fullWidth?: boolean;
}
export default function SelectInputField({
  options,
  value,
  className,
  onChange,
  label,
  fullWidth,
  description,
  inputClassName,
  buttonClassName,
  error,
  ...rest
}: SelectInputFieldProps) {
  const {
    isOpen,
    selectedItem,
    getToggleButtonProps,
    getMenuProps,
    getLabelProps,
    highlightedIndex,
    getItemProps,
  } = useSelect<ItemType>({
    selectedItem: getSelectedItem(value, options),
    ...rest,
    items: options,
    onSelectedItemChange: ({ selectedItem }) => {
      if (onChange && selectedItem) {
        onChange(getItemValue(selectedItem));
      }
    },
  });

  const selectedItemLabel = getItemLabel(selectedItem);

  return (
    <InputField
      {...getLabelProps()}
      className={className}
      label={label}
      error={error}
      description={description}
      fullWidth={fullWidth}
    >
      <div className={`select-input ${isOpen ? 'open' : ''} ${inputClassName}`}>
        <button
          className={`dropdown-button ${buttonClassName}`}
          type="button"
          {...getToggleButtonProps()}
        >
          <span>
            {selectedItemLabel !== undefined
              ? selectedItemLabel
              : m['select-input-field.placeholder']()}
          </span>
          <CaretDownIcon />
        </button>
        {options.length > 0 && (
          <ul {...getMenuProps()} className="dropdown">
            {isOpen &&
              options.map((item, index) => (
                <li
                  className={`dropdown-item ${highlightedIndex === index ? 'highlighted-item' : ''}`}
                  key={getItemValue(item)}
                  {...getItemProps({ item, index })}
                >
                  {getItemLabel(item)}
                </li>
              ))}
          </ul>
        )}
      </div>
    </InputField>
  );
}
