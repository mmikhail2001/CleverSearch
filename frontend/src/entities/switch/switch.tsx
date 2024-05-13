import React, { FC } from 'react';
import { FormControlLabel } from '@mui/material'
import { Switch as UISwitch } from '@mui/material'
import CSS from 'csstype'

interface SwitchProps {
    size?: 'small',
    checked: boolean,
    onChange: () => void,
    label?: string;
    labelPlacement?: 'top' | 'bottom' | 'start' | 'end';
    disabled?: boolean;
    fontSize?: string;
    className?: string;
    style?: CSS.Properties;
    color?: 'secondary' | 'warning' | 'default'
}

export const Switch: FC<SwitchProps> = ({
    size,
    checked,
    onChange,
    label,
    labelPlacement,
    disabled,
    fontSize,
    className,
    style,
    color,
}) => {
    return (
        <FormControlLabel
            className={className}
            style={{ 
                ...style,
                marginLeft: '0',
                width:'100%',
            }}
            label={label}
            slotProps={{ typography: { fontSize: fontSize } }}
            labelPlacement={labelPlacement}
            control={
                <UISwitch
                    color={color}
                    onClick={onChange}
                    disabled={disabled}
                    checked={checked}
                    size={size}
                />
            }
        >

        </FormControlLabel>
    )
};
