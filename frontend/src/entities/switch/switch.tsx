import React, { FC } from 'react';
import { FormControlLabel, TextFieldPropsSizeOverrides, TextFieldVariants, TextField as UIInput } from '@mui/material'
import { Switch as UISwitch } from '@mui/material'

interface SwitchProps {
    size?: 'small',
    checked: boolean,
    onChange: () => void,
    label?: string;
    labelPlacement?: 'top' | 'bottom' | 'start' | 'end';
    disabled?: boolean;
}

export const Switch: FC<SwitchProps> = ({
    size,
    checked,
    onChange,
    label,
    labelPlacement,
    disabled,
}) => {
    return (
        <FormControlLabel
            style={{ marginLeft: "0" }}
            label={label}
            slotProps={{ typography: { fontSize: "1.6rem" } }}
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
