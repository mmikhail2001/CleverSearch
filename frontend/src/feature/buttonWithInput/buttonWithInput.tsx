import React, { FC, useRef } from 'react';
import { Button, VariantBtn } from '@entities/button/button';

import './buttonWithInput.scss'

interface ButtonWithInputProps {
  onChange: (a: FileList) => void;
  disabled: boolean;
  variant: VariantBtn;
  className?: string;
  buttonText: string;
}

export const ButtonWithInput: FC<ButtonWithInputProps> = ({
  onChange,
  disabled,
  variant,
  className,
  buttonText,
}) => {
  const hiddenFileInput = useRef(null);
  const handleClick = () => {
    hiddenFileInput.current.click();
  };

  return (
    <div className={className || ''}>
      <Button
        isFullSize={true}
        fontSize='var(--ft-body)'
        variant={variant}
        buttonText={buttonText}
        clickHandler={(e) => {
          e.preventDefault()
          handleClick()
        }
        }
        disabled={false}
      ></Button>
      <input
        multiple={true}
        ref={hiddenFileInput}
        type="file"
        disabled={disabled}
        className={'hidden-input'}
        onChange={(event) => {
          console.log('CHANGE EVENT', event.target)
          const files = event.target.files;
          if (files) {
            onChange(files);
          }
          event.target.value = '';
        }}
      ></input>
    </div>
  );
};
