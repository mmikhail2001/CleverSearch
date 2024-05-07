import React, { FC, useRef } from 'react';
import { Button, VariantBtn } from '@entities/button/button';

import './buttonWithInput.scss'
import { Typography } from '@mui/material';
import CSS from 'csstype'

interface TextWithInputProps {
  onChange: (a: FileList) => void;
  disabled: boolean;
  className?: string;
  buttonText: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  stylesOnRoot?: CSS.Properties;
  textStyles?:CSS.Properties;
}

export const TextWithInput: FC<TextWithInputProps> = ({
  onChange,
  disabled,
  className,
  buttonText,
  startIcon,
  endIcon,
  stylesOnRoot,
  textStyles,
}) => {
  const hiddenFileInput = useRef(null);
  const handleClick = () => {
    hiddenFileInput.current.click();
  };

  return (
    <div className={className || ''} style={{...stylesOnRoot}}>
      {startIcon}
      <Typography
        sx={{
          cursor: 'pointer',
          color:'inherit',
          ...textStyles,
        }}
        onClick={(e) => {
          e.stopPropagation()
          handleClick()
        }}
      >{buttonText}</Typography>
      {endIcon}
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
