import React, { FC, useRef } from 'react';
import { Button, VariantBtn } from '@entities/button/button';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';

import './buttonWithInput.scss'
import { Typography } from '@mui/material';

interface TextWithInputProps {
  onChange: (a: FileList) => void;
  disabled: boolean;
  variant: VariantBtn;
  className?: string;
  buttonText: string;
}

export const TextWithInput: FC<TextWithInputProps> = ({
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
    <div className={className || ''} style={{ 
        width: '185px', 
        paddingLeft:'1.5rem', 
        paddingTop: '1rem',
        paddingBottom: '0.5rem',
        fontSize: 'var(--ft-paragraph)',
        display: 'grid',
				gridTemplateColumns: "minmax(0, 0.5fr) minmax(0, 3fr) minmax(0, 0.25fr)",
        alignItems:'center',
      }}>
      <InsertDriveFileRoundedIcon fontSize='inherit' sx={{color: "#0A9542", marginBottom: '3px'}}/>
      <Typography
        sx={{cursor: 'pointer'}}
        fontSize='var(--ft-paragraph)'
        onClick={(e) => {
          e.stopPropagation()
          handleClick()
        }}
        style={{color:'inherit'}}
      >{buttonText}</Typography>
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
