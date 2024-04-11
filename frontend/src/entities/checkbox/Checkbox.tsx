import React, { FC } from 'react';
import { Checkbox as UICheckbox } from '@mui/material';

interface CheckboxProps {
	isChecked: boolean;
	changeHandler: (e: React.ChangeEvent) => void;
	disabled: boolean;
}

export type ColorCheckbox = 'default'
	| 'primary'
	| 'secondary'
	| 'error'
	| 'info'
	| 'success'
	| 'warning'



export const Checkbox: FC<CheckboxProps> = ({
	changeHandler,
	isChecked,
	disabled,
}) => {
	return (
		<UICheckbox
			checked={isChecked}
			disabled={disabled}
			onChange={changeHandler}
		></UICheckbox>
	);
};
