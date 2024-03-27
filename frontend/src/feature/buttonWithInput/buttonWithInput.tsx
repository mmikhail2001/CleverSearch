import React, { FC, useRef } from 'react';
import { Button, Variants } from '@entities/button/button';

import './buttonWithInput.scss'

interface ButtonWithInputProps {
  onChange: (a: FileList) => void;
  disabled: boolean;
  variant: Variants;
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
        variant={variant}
        buttonText={buttonText}
        clickHandler={handleClick}
        disabled={false}
      ></Button>
      <input
        multiple={true}
        ref={hiddenFileInput}
        type="file"
        disabled={disabled}
        className={'hidden-input'}
        onChange={(event) => {
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
