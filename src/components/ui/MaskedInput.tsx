import { forwardRef } from 'react';
import { IMaskInput } from 'react-imask';
import { TextField } from '@mui/material';
import type { TextFieldProps } from '@mui/material';

interface MaskedInputProps extends Omit<TextFieldProps, 'onChange'> {
  mask: string | any[];
  onAccept?: (value: string, mask: any) => void;
  // react-hook-form integration
  onChange?: (event: { target: { name: string; value: string } }) => void;
}

const TextMaskCustom = forwardRef<HTMLInputElement, any>(function TextMaskCustom(
  props,
  ref,
) {
  const { onChange, mask, ...other } = props;
  return (
    <IMaskInput
      {...other}
      mask={mask}
      inputRef={ref}
      onAccept={(value: any) => onChange({ target: { name: props.name, value } })}
      overwrite
    />
  );
});

export const MaskedInput = ({ mask, onChange, ...other }: MaskedInputProps) => {
  return (
    <TextField
      {...other}
      slotProps={{
        input: {
          inputComponent: TextMaskCustom as any,
          inputProps: { mask, onChange },
        } as any
      }}
    />
  );
};
