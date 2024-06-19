import React, { FC, useRef } from 'react';
import { Button, VariantBtn } from '@entities/button/button';

import CSS from 'csstype'
import { isNullOrUndefined } from '@helpers/isNullOrUndefined';

interface ComponentWithInputProps {
  onChange: (a: FileList) => void;
  disabled: boolean;
  classNameOnComponent?: string;
  stylesOnComponent?: CSS.Properties;
  isMultiple?:boolean;
  children?: React.ReactNode,
  capture?: 'environment',
  accept?: string,
}

export const ComponentWithInput: FC<ComponentWithInputProps> = ({
  onChange,
  disabled,
  classNameOnComponent,
  children,
  stylesOnComponent,
  capture,
  accept,
}) => {
  const hiddenFileInput = useRef<HTMLInputElement | null>(null);
  
  const handleClick = () => {
    hiddenFileInput.current.click();
  };

  return (
    <div 
      className={classNameOnComponent || ''} 
      style={{...stylesOnComponent}}
      onClick={handleClick}
    >
      {children}
      <input
        accept={isNullOrUndefined(accept) ? null : accept}
        capture={capture ? capture : null}
        multiple={true}
        ref={hiddenFileInput}
        type="file"
        disabled={disabled}
        style={{display:'none'}}
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
