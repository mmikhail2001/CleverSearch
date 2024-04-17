import React, { FC } from 'react';
import { FormControlLabel } from '@mui/material'
import { Switch as UISwitch } from '@mui/material'

interface SwitchProps {
    size?: 'small',
    checked: boolean,
    onChange: () => void,
    label?: string;
    labelPlacement?: 'top' | 'bottom' | 'start' | 'end';
    disabled?: boolean;
    fontSize?: string;
}

export const Switch: FC<SwitchProps> = ({
    size,
    checked,
    onChange,
    label,
    labelPlacement,
    disabled,
    fontSize,
}) => {
    return (
        <FormControlLabel
            style={{ marginLeft: '0' }}
            label={label}
            slotProps={{ typography: { fontSize: fontSize } }}
            labelPlacement={labelPlacement}
            control={
                <UISwitch
                    disabled={disabled}
                    checked={checked}
                    onChange={onChange}
                    size={size}
                />
            }
        >

        </FormControlLabel>
    )
};
